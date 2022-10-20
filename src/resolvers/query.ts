import { IResolvers } from "@graphql-tools/utils";
import { Db } from "mongodb";
import { IUser } from "../interfaces/user.interface";
import bcrypt from "bcrypt";
import JWT from "../lib/jwt";
import { ELEMENTS_SELECT } from "../config/constants";

const queryResolvers: IResolvers = {
  Query: {
    users: async (
      _: void,
      __: unknown,
      context: { db: Db }
    ): Promise<Array<IUser>> => {
      return (await context.db
        .collection("users")
        .find()
        .toArray()) as unknown as Array<IUser>;
    },
    login: async (
      _: void,
      args: {
        email: string;
        password: string;
      },
      context: { db: Db }
    ): Promise<{
      status: boolean;
      message: string;
      elementSelect: string;
      token?: string;
    }> => {
      return await context.db
        .collection("users")
        .findOne({
          email: args.email,
        })
        .then((user) => {
          if (!user) {
            return {
              status: false,
              message:
                "Usuario no existe, comprueba que has introducido correctamente el correo",
              elementSelect: ELEMENTS_SELECT.TOKEN,
            };
          }
          // Comprobamos el password
          if (!bcrypt.compareSync(args.password, user.password)) {
            return {
              status: false,
              message:
                "Password no correcto, comprueba de nuevo introduciéndolo",
              elementSelect: ELEMENTS_SELECT.TOKEN,
            };
          }
          // delete user?._id;
          delete user.password;
          delete user.registerDate;
          return {
            status: true,
            message: "Usuario correctamente cargado",
            elementSelect: ELEMENTS_SELECT.TOKEN,
            token: new JWT().sign(user as unknown as IUser),
          };
        })
        .catch((error) => {
          return {
            status: false,
            message: `Error: ${error}`,
            elementSelect: ELEMENTS_SELECT.TOKEN,
          };
        });
    },
    me: (
      _: void,
      __: unknown,
      context: { token: string }
    ): {
      status: boolean;
      message: string;
      elementSelect: string;
      user?: IUser;
    } => {
      const info = new JWT().verify(context.token);
      if (info === "Token inválido") {
        return {
          status: false,
          message: "Token no correcto por estar caducado o inválido",
          elementSelect: ELEMENTS_SELECT.USER,
        };
      }
      return {
        status: true,
        message: "Token correcto para utilizar la información almacenada",
        elementSelect: ELEMENTS_SELECT.USER,
        user: (info as unknown as { user: IUser }).user,
      };
    },
  },
};

export default queryResolvers;

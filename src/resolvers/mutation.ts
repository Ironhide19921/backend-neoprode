import { IUser } from "../interfaces/user.interface";
import { IResolvers } from "@graphql-tools/utils";
import { Db } from "mongodb";
import bcrypt from "bcrypt";
import JWT from "../lib/jwt";
import { ELEMENTS_SELECT } from "../config/constants";

const mutationResolvers: IResolvers = {
  Mutation: {
    add: async (
      _: void,
      args: { user: IUser },
      context: { db: Db }
    ): Promise<{
      status: boolean;
      message: string;
      elementSelect: string;
      user?: IUser;
    }> => {
      // Comprobar si existe el usuario en la base de datos con el correo
      // Si existe, error mostrando feedback
      const userCheck = await context.db
        .collection("users")
        .findOne({ email: args.user.email });

      if (userCheck) {
        return {
          status: false,
          message: "Usuario existe y no podemos registrarnos",
          elementSelect: ELEMENTS_SELECT.USER,
        };
      }

      // Usuario sin password definido, mostrar error si se cumple
      if (!args.user.password) {
        return {
          status: false,
          message: "Password no establecido / asignado",
          elementSelect: ELEMENTS_SELECT.USER,
        };
      }

      // YA TENEMOS LO NECESARIO PARA AÑADIR
      // Si todo va bien y tenemos la información para almacenar
      // Asignar el ID nuevo automáticamente, basándonos
      const lastElement = await context.db
        .collection("users")
        .find()
        .limit(1)
        .sort({
          registerDate: -1,
        })
        .toArray();

      args.user.id =
        lastElement.length === 0 ? "1" : String(+lastElement[0].id + 1);

      console.log(args.user);

      // Añadir la fecha de registro antes de almacenar
      args.user.registerDate = new Date().toISOString();
      // Encriptar password antes de almacenar
      args.user.password = bcrypt.hashSync(args.user.password, 10);

      // Insertar el usuario en la base de datos
      return await context.db
        .collection("users")
        .insertOne(args.user)
        .then(() => {
          return {
            status: true,
            message: "Añadido correctamente",
            elementSelect: ELEMENTS_SELECT.USER,
            user: args.user,
          };
        })
        .catch((error) => {
          console.log(`ERROR: ${error}`);
          return {
            status: false,
            message: `ERROR: ${error}`,
            elementSelect: ELEMENTS_SELECT.USER,
          };
        });
    },
    update: async (
      _: void,
      args: { user: IUser },
      context: { db: Db; token: string }
    ): Promise<{
      status: boolean;
      message: string;
      elementSelect: string;
      user?: IUser;
    }> => {
      // Verificar el token para poder realizar la operación
      const info = new JWT().verify(context.token);
      if (info === "Token inválido") {
        return {
          status: false,
          message:
            "Token no correcto por estar caducado o inválido.No puedes actualizar el usuario por no tener permiso.",
          elementSelect: ELEMENTS_SELECT.USER,
        };
      }
      // Verificar si el usuario existe mediante el id
      const userData: IUser = (await context.db
        .collection("users")
        .findOne({ id: args.user.id })) as unknown as IUser;
      //Si no existe el usuario
      if (!userData) {
        return {
          status: false,
          message:
            "Usuario no se puede actualizar.No está registrado.¿Estás seguro que has introducido correctaemnte los datos?",
          elementSelect: ELEMENTS_SELECT.USER,
        };
      }
      args.user = Object.assign(args.user, {
        password: userData.password,
        registerDate: userData.registerDate,
      });
      // Operación de modificar la información del usuario seleccionado
      return await context.db
        .collection("users")
        .updateOne({ id: args.user.id }, { $set: args.user })
        .then(() => {
          return {
            status: true,
            message: "Actualizado correctamente el usuario",
            elementSelect: ELEMENTS_SELECT.USER,
            user: args.user,
          };
        })
        .catch((error) => {
          console.log(`ERROR: ${error}`);
          return {
            status: false,
            message: `ERROR - No Actualizado: ${error}`,
            elementSelect: ELEMENTS_SELECT.USER,
          };
        });
    },
  },
};

export default mutationResolvers;

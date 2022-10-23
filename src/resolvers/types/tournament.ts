import { IResolvers } from "@graphql-tools/utils";
import { Db } from "mongodb";
import { IUser } from "../../interfaces/user.interface";

const typesPeopleResolvers: IResolvers = {
  Data: {
    __resolveType(obj: { lastname: string; name: string }) {
      // Only Author has a name field
      if (obj.lastname) {
        return "User";
      }
      // Only Book has a title field
      if (obj.name) {
        return "Tournament";
      }
      return null; // GraphQLError is throwns
    },
  },
  Tournament: {
    users: async (root: { users: Array<string> }, context: { db: Db }) => {
      console.log(root.users);
      return (await context.db
        .collection("users")
        .find({ id: { $in: root.users } })
        .toArray()) as unknown as Array<IUser>;
      //   .find()
      //   .toArray()) as unknown as Array<IUser>;
      // return data.books.filter((book) => root.books.indexOf(book.id) > -1);
    },
  },
};

export default typesPeopleResolvers;

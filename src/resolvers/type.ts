import { ELEMENTS_SELECT } from "../config/constants";
import { IResolvers } from "@graphql-tools/utils";

const resolversTypes: IResolvers = {
  Result: {
    __resolveType(root: { elementSelect: string }) {
      // Only Textbook has a courses field
      if (root.elementSelect == ELEMENTS_SELECT.USER) {
        return "ResultUser";
      }
      // Only ColoringBook has a colors field
      if (root.elementSelect == ELEMENTS_SELECT.TOKEN) {
        return "ResultToken";
      }
      return null; // GraphQLError is thrown
    },
  },
};

export default resolversTypes;

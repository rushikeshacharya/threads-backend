import UserService, { CreateUserPayload } from "../../services/user";

const queries = {
  getUserToken: async (
    _: any,
    payload: { email: string; password: string }
  ) => {
    const token = await UserService.getUserToken({
      email: payload.email,
      password: payload.password,
    });
    return token;
  },
  getCurrentLoggedInUser: async (_: any, parameters: any, context: any) => {
    if (context && context.user) {
      const user = await UserService.getUserById(context.user.id);
      return user;
    }
    throw new Error("User is not logged in");
  },
};
const mutations = {
  createUser: async (_: any, payload: CreateUserPayload) => {
    return (await UserService.createUser(payload)).id;
  },
};

export const resolvers = { queries, mutations };

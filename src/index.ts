import express from "express";
import { expressMiddleware } from "@apollo/server/express4";
import UserService from "./services/user";
import createApolloGraphqlServer from "./graphql/index";
async function init() {
  const app = express();
  const PORT = Number(process.env.PORT) || 8000;

  app.use(express.json());

  app.get("/", (req, res) => {
    res.json({ message: "Server is up and running" });
  });
  app.use(
    "/graphql",
    expressMiddleware(await createApolloGraphqlServer(), {
      context: async ({ req }) => {
        const token =
          req.headers?.authorization?.split("Bearer ")[1] || undefined;

        try {
          const user = UserService.decodeJWTToken(token as string);
          return { user };
        } catch (error) {
          return {};
        }
      },
    })
  );

  app.listen(PORT, () => console.log(`Server started at : ${PORT}`));
}

init();

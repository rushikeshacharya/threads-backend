import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

async function init() {
  const app = express();
  const PORT = Number(process.env.PORT) || 8000;

  app.use(express.json());
  const gqlServer = new ApolloServer({
    typeDefs: `
        type Query{
            hello: String
            say(name: String): String
        }
    `,
    resolvers: {
      Query: {
        hello: () => "Hello from Graphql Server",
        say: (_, { name }: { name: string }) =>
          `Hello ${name}.. Welcome to Graphql`,
      },
    },
  });

  await gqlServer.start();
  app.get("/", (req, res) => {
    res.json({ message: "Server is up and running" });
  });

  app.use("/graphql", expressMiddleware(gqlServer));

  app.listen(PORT, () => console.log(`Server started at : ${PORT}`));
}

init();

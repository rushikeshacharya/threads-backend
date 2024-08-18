import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { prismaClient } from "./lib/db";

async function init() {
  const app = express();
  const PORT = Number(process.env.PORT) || 8000;

  app.use(express.json());
  const gqlServer = new ApolloServer({
    typeDefs: `
        type Query{
          hello: String
          say(name: String): String
        },
        type Mutation{
          createUser(firstName: String!, lastName:String!, email: String!, password:String!): Boolean
        }
    `,
    resolvers: {
      Query: {
        hello: () => "Hello from Graphql Server",
        say: (_, { name }: { name: string }) =>
          `Hello ${name}.. Welcome to Graphql`,
      },
      Mutation: {
        createUser: async (
          _,
          {
            firstName,
            lastName,
            email,
            password,
          }: {
            firstName: string;
            lastName: string;
            email: string;
            password: string;
          }
        ) => {
          await prismaClient.user.create({
            data: {
              email,
              firstName,
              lastName,
              password,
              salt: "random_salt",
            },
          });
          return true;
        },
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

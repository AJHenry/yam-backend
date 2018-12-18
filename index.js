require('dotenv').config();

import cors from 'cors';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { resolvers } from './resolvers';
import { typeDefs } from './schemas';

const server = new ApolloServer({ typeDefs, resolvers });

const app = express().use('*', cors());
server.applyMiddleware({ app });

// basic health route, ping /health to determine server health
app.get('/health', (req, res) => {
  res.sendStatus(200);
});

app.listen(process.env.PORT, () => {
  console.log(
    `🚀 Server ready at http://localhost:${process.env.PORT}${
      server.graphqlPath
    }`
  );
});

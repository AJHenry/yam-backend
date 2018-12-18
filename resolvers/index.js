import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import { databaseTest, createPost, selectAllPosts } from '../database-actions';

export const resolvers = {
  Query: {
    databaseStatus: () => {
      console.log('Got here');
      return databaseTest();
    },
    posts: () => {
      console.log(`Resolver: posts`);
      return selectAllPosts();
    },
  },
  Mutation: {
    post: (obj, args, context, info) => {
      console.log(`Called mutation with args ${args}`);
      return createPost(args);
    },
  },
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      return new Date(value); // value from the client
    },
    serialize(value) {
      return value.getTime(); // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10); // ast value is always in string format
      }
      return null;
    },
  }),
};

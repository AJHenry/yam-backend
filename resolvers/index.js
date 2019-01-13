import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import {
  databaseTest,
  createPost,
  selectAllPosts,
  selectCoordsByPostId,
} from '../database-actions';

export const resolvers = {
  Query: {
    databaseStatus: () => {
      console.log(`Query:databaseStatus`);
      return databaseTest();
    },
    selectAllPosts: () => {
      console.log(`Query:selectAllPosts`);
      return selectAllPosts();
    },
    getFeed: (obj, args, context, info) => {
      const { user } = context;
    },
  },
  Mutation: {
    post: (obj, args, context, info) => {
      console.log(`Mutation:post (args: ${args})`);
      const { user } = context;
      return createPost(args, user);
    },
  },
  Post: {
    location: post => {
      return selectCoordsByPostId(post.post_id);
    },
    comments: post => {
      if (!post.parent_id) {
        return selectCommentsByParentId(post.post_id);
      } else {
        return null;
      }
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

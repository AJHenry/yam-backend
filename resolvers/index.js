import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import {
  databaseTest,
  createPost,
  selectAllPosts,
  selectCoordsByPostId,
  selectCommentsByParentId,
  selectPostById,
  updateScore,
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
    selectPost: (obj, args, context, info) => {
      const postId = args.post_id;
      const voterId = context.user.account_id;
      return selectPostById(postId, voterId);
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
    updateScore: (obj, args, context, info) => {
      console.log(`Mutation:updateScore (args: ${args})`);
      const accountId = context.user.account_id;
      const postId = args.post_id;
      const voteType = args.vote_type;
      return updateScore(postId, voteType, accountId);
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

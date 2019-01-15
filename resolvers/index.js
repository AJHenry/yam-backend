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
  getFeed,
  selectVoteType,
} from '../database-actions';

export const resolvers = {
  Query: {
    databaseStatus: () => {
      console.log(`Query:databaseStatus`);
      return databaseTest();
    },
    allPosts: () => {
      console.log(`Query:selectAllPosts`);
      return selectAllPosts();
    },
    post: (obj, args, context, info) => {
      const postId = args.post_id;
      const voterId = context.user.account_id;
      return selectPostById(postId, voterId);
    },
    feed: (obj, args, context, info) => {
      const { user } = context;
      const { location, radius, offset, count, timestamp } = args;

      return getFeed(location, radius, offset, count, timestamp, user);
    },
  },
  Mutation: {
    post: (obj, args, context, info) => {
      console.log(`Mutation:post (args: ${args})`);
      const { user } = context;
      return createPost(args, user);
    },
    vote: (obj, args, context, info) => {
      console.log(`Mutation:updateScore (args: ${args})`);
      const accountId = context.user.account_id;
      const postId = args.post_id;
      const voteType = args.vote_type;
      return updateScore(postId, voteType, accountId);
    },
  },
  Post: {
    vote_type: (post, args, context, info) => {
      return selectVoteType(post.post_id, context.user.account_id);
    },
    location: post => {
      return selectCoordsByPostId(post.post_id);
    },
    comments: post => {
      return selectCommentsByParentId(post.post_id);
    },
  },
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      console.log(`parseValue`);
      return new Date(value); // value from the client
    },
    serialize(value) {
      console.log(`serialize`);
      return value.getTime(); // value sent to the client
    },
    parseLiteral(ast) {
      console.log(`parseLiteral`);
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10); // ast value is always in string format
      }
      return null;
    },
  }),
};

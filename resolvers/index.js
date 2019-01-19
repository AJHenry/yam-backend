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
  selectCommentCount,
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
      const postId = args.postId;
      const voterId = context.user.accountId;
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
      const accountId = context.user.accountId;
      const postId = args.postId;
      const voteType = args.voteType;
      return updateScore(postId, voteType, accountId);
    },
  },
  Post: {
    voteType: (post, args, context, info) => {
      return selectVoteType(post.postId, context.user.accountId);
    },
    location: post => {
      return selectCoordsByPostId(post.postId);
    },
    comments: post => {
      return selectCommentsByParentId(post.postId);
    },
    commentCount: post => {
      return selectCommentCount(post.postId);
    },
    isOwner: (post, args, context, info) => {
      return post.authorId == context.user.accountId;
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

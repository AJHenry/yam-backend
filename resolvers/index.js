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
  getFeedByAccountId,
  getCommentFeed,
  deletePostById,
  getResourcesByPostId,
  createResource,
  getAddressByCoordsId,
} from '../database-actions';
import nanoid from 'nanoid';
import { uploadStream } from '../cloud/s3Upload';

import fs from 'fs';

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
    resources: (obj, args, context, info) => {
      const postId = obj.postId;
      const accountId = context.user.accountId;
      return getResourcesByPostId(postId);
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
    commentFeed: (obj, args, context, info) => {
      const { user } = context;
      const { offset, count, timestamp, parentId } = args;

      return getCommentFeed(offset, count, timestamp, parentId, user);
    },
    feedByAccountId: (obj, args, context, info) => {
      const { user } = context;
      const { offset, count, accountId } = args;

      const chosenAccountId = accountId ? accountId : user.accountId;

      return getFeedByAccountId(offset, count, chosenAccountId);
    },
  },
  Mutation: {
    post: async (obj, args, context, info) => {
      console.log(`Mutation:post (args: ${args})`);
      const { user } = context;
      const { resource } = args;
      console.log(`resource`);
      console.log(resource);

      const newPost = await createPost(args, user);
      console.log(newPost);

      // Initiate a file upload if there is one
      if (newPost && resource) {
        console.log('initiating file upload');

        const { height, width, file, title, fileType } = resource;
        const { createReadStream, filename, mimetype, encoding } = await file;
        const { postId } = newPost;
        const stream = createReadStream();
        console.log(filename);
        const keyName = nanoid(64);
        const { writeStream, promise } = uploadStream({
          Key: keyName,
        });

        stream.pipe(writeStream);
        return promise
          .then(async data => {
            console.log(data);
            const url = data.Location;
            const res = await createResource(
              postId,
              url,
              width,
              height,
              keyName,
              title,
              fileType
            );

            if (!res) {
              console.log(`Error with inserting image`);
              await deletePostById(postId);
              return null;
            } else {
              return { ...newPost, resources: [res] };
            }
          })
          .catch(async err => {
            console.log(`err: ${err}`);
            await deletePostById(postId);
            return null;
          });
      }

      return { ...newPost, resources: null };
    },
    vote: (obj, args, context, info) => {
      console.log(`Mutation:updateScore (args: ${args})`);
      const accountId = context.user.accountId;
      const postId = args.postId;
      const voteType = args.voteType;
      return updateScore(postId, voteType, accountId);
    },
    deletePost: (obj, args, context, info) => {
      console.log(`Mutation:deletePost (args: ${args})`);
      const { user } = context;
      const { postId } = args;
      return deletePostById(postId, user.accountId);
    },
  },
  Post: {
    _id: (post, args, context, info) => {
      return post.postId;
    },
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
      console.log(`Checking ${post.authorId} and ${context.user.accountId}`);
      return post.authorId === context.user.accountId;
    },
    resources: (post, args, context, info) => {
      return getResourcesByPostId(post.postId);
    },
  },
  GeoPosition: {
    details: (address, args, context, info) => {
      console.log('called geopostions');
      console.log(address);
      return getAddressByCoordsId(address.postCoordsId);
    },
  },
  Resource: {
    _id: (resource, args, context, info) => {
      return resource.resourceId;
    },
  },
  DeletePost: {
    _id: (post, args, context, info) => {
      return post.postId;
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

/**
 * The main export for all database actions
 * Andrew Henry
 * 12/27/18
 */

import {
  selectAllPosts,
  createPost,
  selectPostById,
  selectCoordsByPostId,
  selectCommentsByParentId,
  updateScore,
  selectVoteType,
  selectCommentCount,
} from './post';
import { findUserByDeviceId, findUserByAccountId, createUser } from './account';
import { databaseTest } from './test';
import { getFeed, getFeedByAccountId } from './feed';

export {
  databaseTest,
  createPost,
  selectAllPosts,
  findUserByDeviceId,
  findUserByAccountId,
  createUser,
  selectPostById,
  selectCoordsByPostId,
  selectCommentsByParentId,
  updateScore,
  getFeed,
  selectVoteType,
  selectCommentCount,
  getFeedByAccountId,
};

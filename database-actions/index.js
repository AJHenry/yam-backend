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
} from './post';
import { findUserByDeviceId, findUserByAccountId, createUser } from './account';
import { databaseTest } from './test';
import { getFeed } from './feed';

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
};

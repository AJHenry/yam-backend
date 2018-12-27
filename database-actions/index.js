/**
 * The main export for all database actions
 * Andrew Henry
 * 12/27/18
 */

import { selectAllPosts, createPost } from './post';
import { findUserByDeviceId, findUserByAccountId, createUser } from './account';
import { databaseTest } from './test';

export {
  databaseTest,
  createPost,
  selectAllPosts,
  findUserByDeviceId,
  findUserByAccountId,
  createUser,
};

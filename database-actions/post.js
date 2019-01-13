/**
 * Database actions related to posts/comments
 * Andrew Henry
 * 12/27/18
 */

import { psql as db } from '../config/psqlAdapter'; // our adapter from psqlAdapter.js

// Creates a post by inserting into Post and post_coords
const createPost = (args, user) => {
  console.log(`Args: ${args}`);
  console.log(`User: ${user}`);
  const authorId = user.account_id;
  const roleType = user.role_type;
  const postType = args.post_type || 'post';
  const contentTitle = args.content_title || null;
  const contentBody = args.content_body || '';
  const parentId = args.parent_id || null;
  const locationCoords = args.location || null;

  // Error if there's no parent and no post coords
  if (!locationCoords && !parentId) {
    console.log(`Failed to include parentId and locationCoords`);
    return null;
  }

  const testQuery = `insert into Post(post_type, content_title, content_body, parent_id, author_id) 
                    values($(postType), $(contentTitle), $(contentBody), $(parentId), $(authorId)) returning post_id`;

  return db
    .one(testQuery, {
      postType,
      contentTitle,
      contentBody,
      parentId,
      authorId,
    })
    .then(data => {
      const postId = data.post_id;
      const lat = locationCoords.latitude;
      const lon = locationCoords.longitude;
      const selectQuery = `insert into post_coords(post_id, loc_data)
                          values($(postId), ST_SetSRID(ST_MakePoint($(lon), $(lat)), 4326))`;
      return db
        .none(selectQuery, {
          postId,
          lon,
          lat,
        })
        .then(res => {
          console.log(`Successfully inserted post with coords`);
          return selectPostById(postId);
        })
        .catch(err => {
          console.log(`Error inserting post coords for postId: ${postId}`);
          console.log(err);
          deletePostById(postId, authorId);
          return null;
        });
    })
    .catch(error => {
      console.log('ERROR:', error); // print error;
      return -1;
    });
};

// Returns all posts, dangerous!
const selectAllPosts = () => {
  const testQuery = `select * from Post`;
  return db
    .any(testQuery)
    .then(res => {
      console.log(res); // print new user id;
      return res;
    })
    .catch(error => {
      console.log('ERROR:', error); // print error;
      return -1;
    });
};

// Selects 1 post by its ID
const selectPostById = postId => {
  console.log(`db:selectPostById`);
  const testQuery = `select * from post where post_id = $(postId)`;
  return db
    .one(testQuery, { postId })
    .then(res => {
      console.log(res);
      return res;
    })
    .catch(error => {
      console.log('ERROR:', error); // print error;
      return -1;
    });
};

// Gets a coordinate for a post by its ID
const selectCoordsByPostId = postId => {
  console.log(`db:selectCoordsByPostId`);
  const testQuery = `select ST_X(loc_data::geometry) AS longitude,
                            ST_Y(loc_data::geometry) AS latitude
                            from post_coords where post_id = $(postId)`;
  return db
    .oneOrNone(testQuery, { postId })
    .then(res => {
      console.log(res);
      return res;
    })
    .catch(error => {
      console.log('ERROR:', error); // print error;
      return null;
    });
};

// Gets comments for a given post, with its parent ID
const selectCommentsByParentId = parentId => {
  console.log(`db:selectCommentsByParentId`);
  const testQuery = `select * from post where parent_id = $(parentId)`;
  return db
    .any(testQuery, { parentId })
    .then(res => {
      console.log(res);
      return res;
    })
    .catch(error => {
      console.log('ERROR:', error); // print error;
      return null;
    });
};

// Deletes a post by its ID
const deletePostById = (postId, accountId) => {
  console.log(`db:deletePostById`);
  const testQuery = `delete from post where post_id = $(postId) and author_id = $(authorId)`;
  return db
    .none(testQuery, { postId, authorId: accountId })
    .then(res => {
      console.log(res);
      return res;
    })
    .catch(error => {
      console.log('ERROR:', error); // print error;
      return null;
    });
};

export {
  selectAllPosts,
  createPost,
  selectPostById,
  selectCoordsByPostId,
  selectCommentsByParentId,
  deletePostById,
};

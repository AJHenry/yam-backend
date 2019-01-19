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
  const authorId = user.accountId;
  const roleType = user.roleType;
  const postType = args.postType || 'post';
  const contentTitle = args.contentTitle || null;
  const contentBody = args.contentBody || '';
  const parentId = args.parentId || null;
  const locationCoords = args.location || null;

  // Error if there's no parent and no post coords
  if (!locationCoords && !parentId) {
    console.log(`Failed to include parentId and locationCoords`);
    return null;
  }

  const testQuery = `insert into Post(post_type, content_title, content_body, parent_id, author_id, post_date)
                    values($(postType), $(contentTitle), $(contentBody), $(parentId), $(authorId), to_timestamp($(postDate))) returning post_id`;

  return db
    .one(testQuery, {
      postType,
      contentTitle,
      contentBody,
      parentId,
      authorId,
      postDate: Date.now() / 1000,
    })
    .then(data => {
      const postId = data.postId;
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
          return selectPostById(postId, authorId);
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
  const testQuery = `select ${POST_FIELDS}
  from post`;

  return db
    .any(testQuery)
    .then(res => {
      //console.log(res); // print new user id;
      return res;
    })
    .catch(error => {
      console.log('ERROR:', error); // print error;
      return -1;
    });
};

// Selects 1 post by its ID
const selectPostById = (postId, voterId) => {
  console.log(`db:selectPostById`);
  const testQuery = `select * from post where post_id = $(postId)`;
  return db
    .one(testQuery, { postId, voterId })
    .then(res => {
      //console.log(res);
      return res;
    })
    .catch(error => {
      console.log('ERROR:', error); // print error;
      return -1;
    });
};

// Returns the post vote type for a given user
const selectVoteType = (postId, voterId) => {
  console.log(`db:selectPostById`);
  const testQuery = `select vote_type from vote
                    where post_id = $(postId)
                    and account_id = $(voterId)`;
  return db
    .oneOrNone(testQuery, { postId, voterId })
    .then(res => {
      //console.log(res);
      const voteType = !res || !res.voteType ? null : res.voteType;
      return voteType;
    })
    .catch(error => {
      console.log('ERROR:', error); // print error;
      return null;
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
      //console.log(res);
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
      //console.log(res);
      return res;
    })
    .catch(error => {
      console.log('ERROR:', error); // print error;
      return null;
    });
};

// Gets comments for a given post, with its parent ID
const selectCommentCount = parentId => {
  console.log(`db:selectCommentCount`);
  const testQuery = `select count(post_id) as comment_count from post where parent_id = $(parentId)`;
  return db
    .one(testQuery, { parentId })
    .then(res => {
      //console.log(res);
      return res.commentCount;
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
      //console.log(res);
      return res;
    })
    .catch(error => {
      console.log('ERROR:', error); // print error;
      return null;
    });
};

// Updates a score for a given post
const updateScore = (postId, voteType, accountId) => {
  console.log(`db:updateScore`);
  const testQuery = `insert into vote(post_id, vote_type, account_id)
                    values($(postId), $(voteType), $(accountId)) 
                    ON CONFLICT (post_id, account_id) DO UPDATE 
                    SET vote_type = excluded.vote_type
                    returning post_id`;
  return db
    .one(testQuery, { postId, voteType, accountId })
    .then(res => {
      const postId = res.postId;
      return selectPostById(postId, accountId);
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
  updateScore,
  selectVoteType,
  selectCommentCount,
};

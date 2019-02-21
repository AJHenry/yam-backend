/**
 * Database actions related to posts/comments
 * Andrew Henry
 * 12/27/18
 */

import { psql as db } from '../config/psqlAdapter'; // our adapter from psqlAdapter.js

// Creates a post by inserting into Post and post_coords
const createPost = async (args, user) => {
  console.log(`Args: ${args}`);
  console.log(`User: ${user}`);
  const authorId = user.accountId;
  const roleType = user.roleType;
  const postType = args.postType || 'post';
  const contentTitle = args.contentTitle || null;
  const contentBody = args.contentBody || null;
  const parentId = args.parentId || null;
  const locationCoords = args.location || null;
  const address = args.address;

  // Error if there's no parent and no post coords
  if (!locationCoords) {
    console.log(`Failed to include locationCoords`);
    return null;
  }

  if (!contentBody || contentBody.length < 3) {
    console.log(`No/short content body`);
    return null;
  }

  // First let's insert the post data
  const postInsert = `insert into Post(post_type, content_title, content_body, parent_id, author_id, post_date)
                    values($(postType), $(contentTitle), $(contentBody), $(parentId), $(authorId), to_timestamp($(timestamp))) returning *`;

  const postStatus = await db
    .one(postInsert, {
      postType,
      contentTitle,
      contentBody,
      parentId,
      authorId,
      timestamp: Date.now() / 1000.0,
    })
    .then(post => {
      console.log(post);
      return post;
    })
    .catch(error => {
      console.log('ERROR:', error); // print error;
      return null;
    });

  // Make sure that it passed
  if (!postStatus) {
    console.log(`Failed to insert post`);
    return null;
  }

  console.log(`Successfully inserted post data`);

  // Now lets insert post coords
  const postId = postStatus.postId;
  const lat = locationCoords.latitude;
  const lon = locationCoords.longitude;
  const postCoordsInsert = `insert into post_coords(post_id, loc_data)
                        values($(postId), ST_SetSRID(ST_MakePoint($(lon), $(lat)), 4326)) returning *, 
                        ST_X(loc_data::geometry) AS longitude,
                        ST_Y(loc_data::geometry) AS latitude`;
  const postCoordsStatus = await db
    .one(postCoordsInsert, {
      postId,
      lon,
      lat,
    })
    .then(postCoords => {
      console.log(`postCoords`);
      return postCoords;
    })
    .catch(err => {
      console.log(`Error inserting post coords for postId: ${postId}`);
      console.log(err);
      return null;
    });

  // Make sure it passed
  if (!postCoordsStatus) {
    console.log(`Failed to insert post`);
    return null;
  }

  console.log(`Successfully inserted post coords data`);

  // If there's no address, don't bother
  if (!address) {
    console.log(`No address given`);
    return { ...post, GeoPosition: { ...postCoords } };
  }

  // There's an address, lets insert it
  const { postCoordsId } = postCoordsStatus;
  const { cityName, cityState } = address;
  const addressStatus = await insertAddress(postCoordsId, cityName, cityState);
  if (!addressStatus) {
    console.log(
      `Error inserting address for: postId: ${postId} with postCoordsId: ${postCoordsId}`
    );
    console.log(err);
    deletePostById(postId, authorId);
    return null;
  }
  console.log(addressStatus);
  return {
    ...postStatus,
    location: {
      ...postCoordsStatus,
      details: { ...addressStatus },
    },
  };
};

const insertAddress = (postCoordsId, cityName, cityState) => {
  console.log(`dbPost: insertAddress`);
  const addressInsert = `insert into address(post_coords_id, city_name, city_state)
                          values($(postCoordsId), $(cityName), $(cityState)) returning *`;
  return db
    .one(addressInsert, {
      postCoordsId,
      cityName,
      cityState,
    })
    .then(res => {
      console.log(`Successfully inserted address`);
      return res;
    })
    .catch(err => {
      console.log(err);
      return null;
    });
};

// Gets an address for a given location point
const getAddressByCoordsId = postCoordsId => {
  console.log(`dbPost: getAddressByCoordsId`);
  const addressSelect = `select * 
  from address
  where post_coords_id = $(postCoordsId)`;

  return db
    .one(addressSelect, {
      postCoordsId,
    })
    .then(res => {
      console.log(res);
      return res;
    })
    .catch(err => {
      console.log(err);
      return null;
    });
};

// Returns all posts, dangerous!
const selectAllPosts = () => {
  const testQuery = `select *
  from post`;

  return db
    .any(testQuery)
    .then(res => {
      //console.log(res);
      return res;
    })
    .catch(error => {
      console.log('ERROR:', error); // print error;
      return [];
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
  const testQuery = `select *, 
                            ST_X(loc_data::geometry) AS longitude,
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
      return { postId, message: `Successfully deleted post`, status: true };
    })
    .catch(error => {
      console.log('ERROR:', error); // print error;
      return { postId: -1, message: `Failed to delete post`, status: false };
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
  getAddressByCoordsId,
};

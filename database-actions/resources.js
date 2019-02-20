import { psql as db } from '../config/psqlAdapter'; // our adapter from psqlAdapter.js

// Used to get the resources for a post
const getResourcesByPostId = postId => {
  console.log(`db:getResourcesByPostId`);
  if (!postId) {
    console.log(`No post id supplied, cannot query resources`);
    return [];
  }

  const resourceQuery = `select * 
  from resources
  where post_id = $(postId)
  `;

  return db
    .any(resourceQuery, {
      postId,
    })
    .then(res => {
      console.log(res);
      return res;
    })
    .catch(error => {
      console.log('ERROR:', error); // print error;
      console.log(error);
      return [];
    });
};

// Used to store resources for posts
const createResource = (
  postId,
  url,
  width,
  height,
  keyName,
  title = null,
  resourceType = 'image'
) => {
  console.log(`db:createResource`);
  if (!postId) {
    console.log(`No post id supplied, cannot create resource`);
    return null;
  }

  const resourceInsert = `insert into resources(post_id, resource_type, resource_url, key_name, title, width, height)
  values($(postId), $(resourceType), $(url), $(keyName), $(title), $(width), $(height)) returning *
  `;

  return db
    .one(resourceInsert, {
      postId,
      resourceType,
      url,
      keyName,
      title,
      width,
      height,
    })
    .then(res => {
      console.log(res);
      return res;
    })
    .catch(error => {
      console.log('ERROR:', error); // print error;
      console.log(error);
      return null;
    });
};

export { getResourcesByPostId, createResource };

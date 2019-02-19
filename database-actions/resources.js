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

export { getResourcesByPostId };

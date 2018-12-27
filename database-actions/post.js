/**
 * Database actions related to posts/comments
 * Andrew Henry
 * 12/27/18
 */

import { psql as db } from '../config/psqlAdapter'; // our adapter from psqlAdapter.js

const createPost = ({
  PostType,
  ContentText,
  ContentType,
  VideoUrl,
  ImageUrl,
  OtherUrl,
  parentId,
  AuthorId,
}) => {
  const testQuery = `INSERT INTO Post(PostType, ContentText, ContentType, VideoUrl, ImageUrl, OtherUrl, parentId, AuthorId) 
                    VALUES($(PostType), $(ContentText), $(ContentType), $(VideoUrl), $(ImageUrl), $(OtherUrl), $(parentId), $(AuthorId)) RETURNING id`;

  console.log('Called');
  return db
    .one(testQuery, {
      PostType,
      ContentText,
      ContentType,
      VideoUrl,
      ImageUrl,
      OtherUrl,
      parentId,
      AuthorId,
    })
    .then(data => {
      console.log(data.id); // print new user id;
      const selectQuery = `SELECT * FROM Post WHERE id = $(id)`;
      return db.one(selectQuery, { id: data.id }).then(res => {
        console.log(res);
        return res;
      });
    })
    .catch(error => {
      console.log('ERROR:', error); // print error;
      return -1;
    });
};

const selectAllPosts = () => {
  const testQuery = `SELECT * FROM Post`;
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

export { selectAllPosts, createPost };

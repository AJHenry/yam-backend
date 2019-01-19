import { psql as db } from '../config/psqlAdapter'; // our adapter from psqlAdapter.js

const DEFAULT_RADIUS = 30; // 30 mi
const MAX_RADIUS = 100; // 100 mi
const DEFAULT_COUNT = 50;
const MAX_COUNT = 200;
const DEFAULT_OFFSET = 0;

const POST_FIELDS = `post_type as postType,
content_title as contentTitle,
content_body as contentBody,
parent_id as parentId,
author_id as authorId,
current_author_name as currentAuthorName,
current_author_image as currentAuthorImage,
post_date as postDate,
post_score as postScore`;

const getFeed = (
  location,
  radius = DEFAULT_RADIUS,
  offset = DEFAULT_OFFSET,
  count = DEFAULT_COUNT,
  timestamp = Date.now(),
  userObj
) => {
  console.log(`db:getFeed`);
  if (!location) {
    console.log(`No location supplied, cannot generate feed`);
    return [];
  }

  if (radius > MAX_RADIUS || count > MAX_COUNT) {
    console.log(`Invalid parameters given`);
    return [];
  }

  const voterId = userObj.accountId;
  const lon = location.longitude;
  const lat = location.latitude;

  const feedQuery = `select * from post
  where post_id in (
      select post_id
      from post_coords
      where ST_Distance_Sphere(loc_data::geometry, ST_MakePoint($(lon), $(lat))) <= $(radius) * 1609.34
  )
  and post_date < to_timestamp($(timestamp))
  and parent_id is null
  order by post_date DESC
  offset $(offset)
  limit $(count)
  `;

  return db
    .any(feedQuery, {
      voterId,
      lon,
      lat,
      radius,
      timestamp: timestamp / 1000,
      offset,
      count,
    })
    .then(res => {
      console.log(res);
      console.log(res[0].postDate);
      return res;
    })
    .catch(error => {
      console.log('ERROR:', error); // print error;
      console.log(error);
      return [];
    });
};

export { getFeed };

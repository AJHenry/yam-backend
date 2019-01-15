import { psql as db } from '../config/psqlAdapter'; // our adapter from psqlAdapter.js

const DEFAULT_RADIUS = 30; // 30 mi
const MAX_RADIUS = 100; // 100 mi
const DEFAULT_COUNT = 50;
const MAX_COUNT = 200;
const DEFAULT_OFFSET = 0;

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

  const voterId = userObj.account_id;
  const lon = location.longitude;
  const lat = location.latitude;

  const feedQuery = `select p.*, v.vote_type from post p
                    left join (select * from vote where account_id = $(voterId)) v
                    on p.post_id = v.post_id
                    where p.post_id in (
                        select post_id
                        from post_coords
                        where ST_Distance_Sphere(loc_data::geometry, ST_MakePoint($(lon), $(lat))) <= $(radius) * 1609.34
                    )
                    and p.post_date < to_timestamp($(timestamp))
                    and p.parent_id is null
                    order by p.post_date
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
      //console.log(res);
      console.log(res[0].post_date);
      return res;
    })
    .catch(error => {
      console.log('ERROR:', error); // print error;
      console.log(error);
      return [];
    });
};

export { getFeed };

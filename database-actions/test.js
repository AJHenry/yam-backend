/**
 * Database actions related to testing the database
 * Andrew Henry
 * 12/27/18
 */

import { psql as db } from '../config/psqlAdapter'; // our adapter from psqlAdapter.js

const databaseTest = () => {
  const testQuery = 'select * from test_table';
  console.log('called');
  return db
    .one(testQuery)
    .then(res => {
      return `Successfully connected to database`;
    })
    .catch(err => {
      console.log(err);
      return `Failed to get database status with error: 
      ${err}`;
    });
};

export { databaseTest };

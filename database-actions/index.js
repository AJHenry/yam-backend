import { psql } from '../config/psqlAdapter'; // our adapter from psqlAdapter.js

const databaseTest = () => {
  const testQuery = 'select * from test_table';
  console.log('called');
  return psql
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

require('dotenv').config();

import pgPromise from 'pg-promise';

const {
  DATABASE_HOST,
  DATABASE_NAME,
  DATABASE_PASSWORD,
  DATABASE_PORT,
  DATABASE_USER,
} = process.env;

console.log(`Establishing connection to Postgres with the following settings:
  host: ${DATABASE_HOST},
  port: ${DATABASE_PORT},
  database: ${DATABASE_NAME},
  user: ${DATABASE_USER},
  password: ${DATABASE_PASSWORD},
If these do not look right, they probably aren't, check the .env file
`);

const cn = {
  host: DATABASE_HOST,
  port: DATABASE_PORT,
  database: DATABASE_NAME,
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,
};

const pgp = pgPromise({}); // empty pgPromise instance
const psql = pgp(cn); // get connection to your db instance

// Let's do a test call to make sure the data is up and running
const testQuery = 'select * from test_table';
psql
  .one(testQuery)
  .then(res => {
    //console.log(res);
    console.log(`Successfully connected to DB`);
  })
  .catch(err => {
    //console.log(err);
    console.log(`Failed to connect to DB: with err: ${err}`);
  });

export { psql };

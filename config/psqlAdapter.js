require('dotenv').config();

import pgPromise from 'pg-promise';

//const connStr = `postgresql://${process.env.DATABASE_USER}@${process.env.DATABASE_HOST}:port/database`; // add your psql details

console.log(`Establishing connection to Postgres with the following settings:
  host: ${process.env.DATABASE_HOST},
  port: ${process.env.DATABASE_PORT},
  database: ${process.env.DATABASE_NAME},
  user: ${process.env.DATABASE_USER},
  password: ${process.env.DATABASE_PASSWORD},
If these do not look right, they probably aren't, check it the .env file
`);

const cn = {
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
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

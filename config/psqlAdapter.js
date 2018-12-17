import pgPromise from 'pg-promise';

//const connStr = `postgresql://${process.env.DATABASE_USER}@${process.env.DATABASE_HOST}:port/database`; // add your psql details

const cn = {
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
};

const pgp = pgPromise({}); // empty pgPromise instance
export const psql = pgp(cn); // get connection to your db instance

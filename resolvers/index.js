import { databaseTest } from '../database-actions';

export const resolvers = {
  Query: {
    databaseStatus: () => {
      console.log('Got here');
      return databaseTest();
    },
  },
};

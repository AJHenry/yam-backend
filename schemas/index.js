import { gql } from 'apollo-server-express';

// Main schema to export
export const typeDefs = gql`
  type Query {
    databaseStatus: String
  }
`;

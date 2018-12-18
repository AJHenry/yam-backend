import { gql } from 'apollo-server-express';
import { GraphQLDateTime } from 'graphql-iso-date';

// Main schema to export
export const typeDefs = gql`
  type Query {
    databaseStatus: String
    posts: [Post]
  }

  type Mutation {
    post(
      PostType: String!
      ContentText: String!
      ContentType: String!
      VideoUrl: String
      ImageUrl: String
      OtherUrl: String
      ParentId: Int
      AuthorId: Int!
    ): Post!
  }

  scalar Date

  type Post {
    id: Int!
    posttype: String!
    contenttext: String!
    contenttype: String!
    videourl: String
    imageurl: String
    otherurl: String
    parentid: Int
    authorid: Int!
    currentauthorname: String!
    currentauthorimage: String
    postdate: Date!
  }
`;

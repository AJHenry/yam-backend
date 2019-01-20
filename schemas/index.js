import { gql } from 'apollo-server-express';
import { GraphQLDateTime } from 'graphql-iso-date';

// Main schema to export
export const typeDefs = gql`
  scalar Date

  type Post {
    postId: Int!
    postType: String!
    contentTitle: String
    contentBody: String
    parentId: Int
    authorId: Int!
    currentAuthorName: String
    currentAuthorImage: String
    postDate: Date!
    postScore: Int!
    voteType: String
    location: GeoPosition
    comments: [Post]
    commentCount: Int
    isOwner: Boolean!
  }

  type Resource {
    resourceId: Int!
    postId: Int!
    resourceType: String!
    resourceUrl: String!
  }

  type GeoPosition {
    latitude: Float!
    longitude: Float!
  }

  input GeoPositionInput {
    latitude: Float!
    longitude: Float!
    altitude: Float
  }

  input AddressInput {
    latitude: Float!
    longitude: Float!
    altitude: Float
  }

  input Address {
    latitude: Float!
    longitude: Float!
    altitude: Float
  }

  type Query {
    databaseStatus: String
    allPosts: [Post]!
    post(postId: Int!): Post
    feed(
      location: GeoPositionInput!
      radius: Float
      offset: Int
      count: Int
      timestamp: Date
    ): [Post]!
    feedByAccountId(offset: Int, count: Int, accountId: Int): [Post]!
  }

  type Mutation {
    post(
      postType: String!
      contentTitle: String
      contentBody: String
      parentId: Int
      location: GeoPositionInput!
    ): Post!
    vote(postId: Int!, voteType: String): Post!
  }
`;

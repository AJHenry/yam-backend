import { gql } from 'apollo-server-express';
import { GraphQLDateTime } from 'graphql-iso-date';

// Main schema to export
export const typeDefs = gql`
  scalar Date

  type DeletePost {
    _id: Int!
    postId: Int!
    status: Boolean!
    message: String!
  }

  type Post {
    _id: Int!
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
    resources: [Resource]!
  }

  type Resource {
    _id: Int!
    resourceId: Int!
    postId: Int!
    resourceType: String!
    resourceUrl: String!
    keyName: String!
    title: String
    width: Int!
    height: Int!
  }

  type LatLon {
    latitude: Float!
    longitude: Float!
  }

  type GeoPosition {
    latitude: Float!
    longitude: Float!
    details: Address!
  }

  type Address {
    cityName: String!
    cityState: String!
  }

  input ResourceUpload {
    file: Upload!
    title: String
    width: Int!
    height: Int!
    fileType: String
  }

  input GeoPositionInput {
    latitude: Float!
    longitude: Float!
    altitude: Float
  }

  input AddressInput {
    cityName: String!
    cityState: String!
  }

  type Query {
    databaseStatus: String
    allPosts: [Post]!
    resources(postId: Int!): [Resource]!
    post(postId: Int!): Post
    feed(
      location: GeoPositionInput!
      radius: Float
      offset: Int
      count: Int
      timestamp: Date
    ): [Post]!
    commentFeed(
      offset: Int
      count: Int
      timestamp: Date
      parentId: Int
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
      address: AddressInput
      resource: ResourceUpload
    ): Post
    deletePost(postId: Int!): DeletePost!
    vote(postId: Int!, voteType: String): Post!
    createResource(postId: Int!, resource: Upload!): Resource
  }
`;

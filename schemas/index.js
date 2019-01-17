import { gql } from 'apollo-server-express';
import { GraphQLDateTime } from 'graphql-iso-date';

// Main schema to export
export const typeDefs = gql`
  scalar Date

  type Post {
    post_id: Int!
    post_type: String!
    content_title: String
    content_body: String
    parent_id: Int
    author_id: Int!
    current_author_name: String
    current_author_image: String
    post_date: Date!
    post_score: Int!
    vote_type: String
    location: GeoPosition
    comments: [Post]
    comment_count: Int
  }

  type Resource {
    resource_id: Int!
    post_id: Int!
    resource_type: String!
    resource_url: String!
  }

  type GeoPosition {
    latitude: Float!
    longitude: Float!
  }

  input GeoPositionInput {
    latitude: Float!
    longitude: Float!
  }

  type Query {
    databaseStatus: String
    allPosts: [Post]!
    post(post_id: Int!): Post
    feed(
      location: GeoPositionInput!
      radius: Float
      offset: Int
      count: Int
      timestamp: Date
    ): [Post]!
  }

  type Mutation {
    post(
      post_type: String!
      content_title: String
      content_body: String
      parent_id: Int
      location: GeoPositionInput!
    ): Post!
    vote(post_id: Int!, vote_type: String): Post!
  }
`;

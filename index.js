require('dotenv').config();

import cors from 'cors';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { resolvers } from './resolvers';
import { typeDefs } from './schemas';
import passport from 'passport';
import passportJWT from 'passport-jwt';
import jwt from 'jsonwebtoken';
import {
  findUserByAccountId,
  findUserByDeviceId,
  createUser,
} from './database-actions';
import { generateData } from './DataGenerate';

const { PORT, JWT_SECRET } = process.env;
const { Strategy, ExtractJwt } = passportJWT;

// Parameters for jwt auth
const params = {
  secretOrKey: JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

// JWT strategy for passport
const strategy = new Strategy(params, async (payload, done) => {
  const accountId = payload.accountId; //Fetch account id
  const user = await findUserByAccountId(accountId); //Find a user based on account_id
  return done(null, user);
});

// Applying strategy
passport.use(strategy);

// Initializing passport, express
const app = express().use(cors());
passport.initialize();

// Endpoint for checking jwt auth
app.use('/graphql', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    console.log(`err: ${err}`);
    console.log(`user: ${user}`);
    if (user) {
      console.log(`User authenticated`);
      req.user = user;
      next();
    } else {
      console.log(`User not authenticated`);
      res.status(401).json({
        message:
          'Must be authorized via /auth before accessing the graphql endpoint',
      });
    }
  })(req, res, next);
});

// Endpoint for checking jwt auth
app.use('/authcheck', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (user) {
      console.log(`Auth Check: User authenticated`);
      res.sendStatus(200);
    } else {
      console.log(`Auth Check: User not authenticated`);
      res.sendStatus(401);
    }
  })(req, res, next);
});

// Initialize apollo
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    user: req.user,
  }),
});

server.applyMiddleware({ app });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for handling requests
const loggingMiddleware = (req, res, next) => {
  console.log('ip:', req.ip);
  next();
};
app.use(loggingMiddleware);

// basic health route, ping /health to determine server health
app.get('/health', (req, res) => {
  res.sendStatus(200);
});

// Route for generating a jwt using a device id
app.post('/auth', async (req, res) => {
  const deviceId = req.body.deviceId;

  // No device id found in the body, nothing we can do about it
  if (!deviceId) {
    res.status(400).json({
      message: 'No deviceId found in params or body',
    });
    return;
  }

  // Get the user details based on device id
  let user = await findUserByDeviceId(deviceId);

  console.log(`User found: ${user}`);

  // if user is null, we need to create a new user
  if (!user) {
    user = await createUser(deviceId);
  }

  console.log(user);

  // Check just in case creating a user failed for some reason
  const userJWT = user ? jwt.sign(user, JWT_SECRET) : null;

  console.log(user);
  // Return status based on success of jwt signing
  if (userJWT) {
    res.status(200).json({
      token: userJWT,
      userData: user,
      message: 'Successfully generated JWT for given device ID',
    });
  } else {
    res.status(500).json({
      token: userJWT,
      userData: null,
      message: 'Error generating JWT for given device ID',
    });
  }
});

// Start the app
app.listen(PORT, () => {
  console.log(
    `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
  );

  //generateData();
});

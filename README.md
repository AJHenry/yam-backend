# Yam Backend

> The backend for the mobile application, Yam.

<!--
[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Downloads Stats][npm-downloads]][npm-url]
-->

This is the repo for the backend that serves the mobile application Yam.

<!--
![](header.png)
-->

## Installation

First and foremost, **you must have Node/npm installed and the database up and running**

These are the variables you need in your `env` file

```env
PORT
JWT_SECRET

DATABASE_HOST
DATABASE_NAME
DATABASE_PASSWORD
DATABASE_PORT
DATABASE_USER
```

```sh
npm start
```

This will start the server in development mode, which you will be greeted with the following if everything is running correctly

```
🚀 Server ready at http://localhost:3000/graphql
Successfully connected to DB
```

## Endpoint documention

```
/auth
```

Used to create a JWT token to access the rest of the endpoints

Body

```js
{
  device_id: String;
}
```

Where device*id is the \_unique* device ID of the client

This will in return a JWT

```js
{
  token: String;
}
```

```
/graphql
```

Used for the graphql structure

Since we are using authentication headers with our graphql endpoint, I recommend https://github.com/prisma/graphql-playground to set HTTP headers correctly

_We use Nodeman to automatically restart the server upon save_

## Release History

- 0.0.1
  - Work in progress

<!--
## Contributing

1. Fork it (<https://github.com/yourname/yourproject/fork>)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request
-->

<!-- Markdown link & img dfn's -->

[npm-image]: https://img.shields.io/npm/v/datadog-metrics.svg?style=flat-square
[npm-url]: https://npmjs.org/package/datadog-metrics
[npm-downloads]: https://img.shields.io/npm/dm/datadog-metrics.svg?style=flat-square
[travis-image]: https://img.shields.io/travis/dbader/node-datadog-metrics/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/dbader/node-datadog-metrics
[wiki]: https://github.com/yourname/yourproject/wiki

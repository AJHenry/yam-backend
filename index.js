//index.js

require('dotenv').config();

import express from 'express';
const app = express();
const PORT = process.env.PORT;

app.get('/', (req, res) => {
  res.json({
    msg: 'Welcome to GraphQL',
  });
});
app.listen(PORT, () => {
  console.log(`Server is listening on PORT ${PORT}`);
});

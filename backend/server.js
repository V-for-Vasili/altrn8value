// Imports
const express = require('express');
const graphqlHTTP = require('express-graphql');
const morgan = require('morgan');
const morganBody = require('morgan-body');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const axios = require('axios');
const { buildSchema } = require('graphql');
const { makeExecutableSchema } = require('graphql-tools');
const {schema} = require('./schema.js')


// Start building express app
let app = express();

// BodyParser Config
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// serve frontend statically
app.use(express.static('frontend'));

// Enviroment Variables
const PORT =  process.env.FACEBOOK_KEY || '8080';
CONNECTION_URL = process.env.CONNECTION_URL || 'mongodb://myTester:123456@localhost:27017/test?retryWrites=true&w=majority';

// Settup Logger
morgan.token('id', function getId(req) {
  return req.id
});

let loggerFormat = ':id [:date[web]] ":method :url" :status :response-time';
app.use(morgan(loggerFormat));
morganBody(app);


app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true,
}));

// Routes
// healthcheck Function
app.get('/healthcheck/' ,async function (req, res) {
  res.status(200).send("Api is running");
});

// Server is running
console.log(`Service running on port ${PORT}`);
app.listen(PORT);

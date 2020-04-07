/*jshint esversion: 6 */
// Imports
const express = require('express');
const morgan = require('morgan');
const morganBody = require('morgan-body');
const bodyParser = require('body-parser');
const axios = require('axios');
const cookie = require('cookie');
const { v4: uuid } = require('uuid');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Db imports
const mongoose = require('mongoose');
const {User} = require('./db/User.js');

// Graphql Imports
const graphqlHTTP = require('express-graphql');
const {schema} = require('./schema.js');

// Enviroment Variables, Deployment Envirment Variables sets this to  production values
const PORT =  process.env.PORT || '8080';
const CONNECTION_URL = process.env.CONNECTION_URL || "mongodb+srv://SeanDev:kcwAPZHBtrYQkidQ@cluster0-i5kqv.mongodb.net/test?retryWrites=true&w=majority";
// JWT signature
const JWT_SECRET = process.env.JWT_SECRET || "7bzkj0iMcFU9JMnnE6SB";

// Start building express app
let app = express();

// BodyParser Config
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// serve frontend statically
app.use(express.static('frontend'));


// Settup Logger
morgan.token('id', function getId(req) {
  return req.id
});

let loggerFormat = ':id [:date[web]] ":method :url" :status :response-time';

app.use(morgan(loggerFormat));
morganBody(app);

// Mongose Settup
mongoose.connect(CONNECTION_URL, {useNewUrlParser: true, useUnifiedTopology: true}).catch(err => {
  console.log(err);
});

// User Log in
app.post('/api/signup', function (req, res, next) {
  let username = req.body.username;
  let password = req.body.password;

  User.findOne({username: username}, function(err, user){
    if (err) return res.status(500).end(err);
    if (user) return res.status(409).end("username " + username + " already exists");
    // Set up password hash
    let salt = crypto.randomBytes(16).toString('base64');
    let hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    let saltedHash = hash.digest('base64');
    let _id = uuid();
    // Build JWT
    let secret = JWT_SECRET;
    let token = jwt.sign({_id: _id},secret,{expiresIn:"7d"});
    // Set token in cookie
    res.setHeader('Set-Cookie', cookie.serialize('token', String(token), {
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    }));
    res.setHeader('Set-Cookie', cookie.serialize('username', String(username), {
      path : '/', 
      maxAge: 60 * 60 * 24 * 7 // 1 week 
    }));
    // Add new user
    let new_user = new User({_id, username, saltedHash, salt});
    new_user.save(function (err) {
     if (err) return res.status(500).end(err);
    });
   return res.status(201).json("User "+ username + " Signed Up & Logged On");
  });
})


// Signin Pulled from Lab 6
// curl -H "Content-Type: application/json" -X POST -d '{"username":"alice","password":"alice"}'  localhost:3000/api/signin/:ebf3c240-8c05-4195-9aec-83e850c8eda4
app.post('/api/signin/', function (req, res, next) {
  let username = req.body.username;
  let password = req.body.password;
  // retrieve user from the database
  User.findOne({username: username}, function(err, user){
    if (err) return res.status(500).end(err);
    if (!user) return res.status(401).end("Invalid username");
    //  Generate hash
    let salt = user.salt;
    let hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    let saltedHash = hash.digest('base64');
    // Compare password to the generated saltedHash
    if (user.saltedHash !== saltedHash) return res.status(401).end("access denied");
    // Build JWT
    let secret = JWT_SECRET;
    let token = jwt.sign({_id: user._id},secret,{expiresIn:"7d"});
    // Set token in cookie
    res.setHeader('Set-Cookie', cookie.serialize('token', (token), {
      httpOnly:true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    }));
    res.setHeader('Set-Cookie', cookie.serialize('username', String(username), {
      path : '/', 
      maxAge: 60 * 60 * 24 * 7 // 1 week 
    }));
    return res.status(200).json("User " + username + " Logged On");
  });
})

// // Auth Middleware
// app.use(function(req, res, next) {
//     let token = req.headers.token;
//     // Nullify values set by this function
//     req.uid = null;
//     req.username = null;
//     // Check if the token is valid
//     if(!token) return next();
//     try{
//       token = jwt.verify(token, JWT_SECRET);
//     } catch (err) {
//       console.log(err);
//       return next()
//     }
//     // Check if the user Exists
//     User.findOne({_id: token._id}, function(err, user){
//       if(!user || err)  next();
//       req.uid = token._id, req.username = user.username;
//       return next()
//     });
// });

// 
let isAuthenticated = function(req, res, next) {
  let cookies = cookie.parse(req.headers.cookie || '');
  if (cookies.token){
      let user =  jwt.verify(cookies.token, JWT_SECRET);
      if (!user) return res.status(401).end("access denied");
      User.findOne({_id: user._id}, function(err, user){
        if (err) return res.status(500).end(err);
        if(!user) return res.status(401).end("access denied");
        
        return next()
            });
      } 
  else {
    return res.status(401).end("access denied");
  }
  next();
};





/*
curl -X POST                                                       \
    -H "Content-Type: application/json"                            \
    -d '{ "query": "{ stock(symbol:\"AAPL\"){ symbol price } }" }' \
    http://localhost:8080/graphql
*/
app.use('/graphql', graphqlHTTP((req, res, graphQLParams) => ({
    schema: schema,
    graphiql: true,
    context: {
      username: req.username,
      uid: req.uid
    }
  }))
);

// Routes
// healthcheck Function
app.get('/healthcheck/' ,async function (req, res) {
  res.status(200).send("Api is running");
});

// Server is running
console.log(`Service running on port ${PORT}`);
app.listen(PORT);

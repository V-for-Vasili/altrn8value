// Imports
const fs = require('fs');
const https = require('https');
const express = require('express');
const morgan = require('morgan');
const morganBody = require('morgan-body');
const bodyParser = require('body-parser');
const cookie = require('cookie');
const { v4: uuid } = require('uuid');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {retrieveFromCache} = require('./cache.js');

// Db imports
const mongoose = require('mongoose');
const {User} = require('./db/User.js');

// Graphql Imports
const graphqlHTTP = require('express-graphql');
const {schema} = require('./schema.js');

// Enviroment Variables; Deployment Envirment Variables set this to production
// values
const PORT =  process.env.PORT || '443';
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
app.use('/docs', express.static('./slate/build'));


// Settup Logger
morgan.token('id', function getId(req) {
    return req.id;
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
        let token = jwt.sign({_id: _id , user:username},secret,{expiresIn:"7d"});
        // Set token in cookie
        let cookieArray = [];
        cookieArray.push(
            cookie.serialize('token', String(token), {
                path: '/',
                maxAge: 60 * 60 * 24 * 7 ,
                httpOnly:true
            })
        );
        cookieArray.push(
            cookie.serialize('username', String(username), {
                path: '/',
                maxAge: 60 * 60 * 24 * 7
            })
        );
        cookieArray.push(
            cookie.serialize('uID', String(_id), {
                path: '/',
                maxAge: 60 * 60 * 24 * 7
            })
        );
        res.setHeader('Set-Cookie', cookieArray);
        // Add new user
        let new_user = new User({_id, username, saltedHash, salt});
        new_user.save(function (err) {
            if (err) return res.status(500).end(err);
        });
        return res.status(201).json("User "+ username + " Signed Up & Logged On");
    });
});

// Signin Pulled from Lab 6
// curl -H "Content-Type: application/json" -X POST -d '{"username":"alice","password":"alice"}'  localhost:3000/api/signin/:ebf3c240-8c05-4195-9aec-83e850c8eda4
app.post('/api/signin/', function (req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    // retrieve user from the database
    User.findOne({username: username}, function(err, user){
        if (err) return res.status(500).end(err);
        if (!user) return res.status(401).end("Invalid username");
        // Generate hash
        let salt = user.salt;
        let hash = crypto.createHmac('sha512', salt);
        hash.update(password);
        let saltedHash = hash.digest('base64');
        // Compare password to the generated saltedHash
        if (user.saltedHash !== saltedHash) return res.status(401).end("access denied");
        // Build JWT
        let secret = JWT_SECRET;
        let token = jwt.sign({_id: user._id , user:username},secret,{expiresIn:"7d"});
        // Set token in cookie
        let cookieArray = [];
        cookieArray.push(
            cookie.serialize('token', String(token), {
                path: '/',
                maxAge: 60 * 60 * 24 * 7 ,
                httpOnly:true
            })
        );
        cookieArray.push(
            cookie.serialize('username', String(username), {
                path: '/',
                maxAge: 60 * 60 * 24 * 7
            })
        );
        cookieArray.push(
            cookie.serialize('uID', String(user._id), {
                path: '/',
                maxAge: 60 * 60 * 24 * 7
            })
        );
        res.setHeader('Set-Cookie', cookieArray);
        return res.status(200).json("User " + username + " Logged On");
    });
});

// Set variables to correct values to be passed into context paramater of graphql
app.use(function(req, res, next) {
    req.username = null;
    req.uid = null;
    req.isAuth = false;
    let cookies = cookie.parse(req.headers.cookie || '');
    if (cookies.token){
        let payload =  jwt.verify(cookies.token, JWT_SECRET);
        if (!payload) return res.status(401).end("access denied");
        User.findOne({_id: payload._id }, function(err, user){
            if (err) return res.status(500).end(err);
            if(!user) return res.status(401).end("access denied");
            // set context params
            req.username = payload.user;
            req.uid = payload._id;
            req.isAuth = true;
            next();
        });
    } else {
        next();
    }
});

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
        uid: req.uid,
        isAuth: req.isAuth
    }
})));

// Routes

// Direct resolver to get data from financialmodelingprep.com
// Need to pass req.query.key, req.query.url, req.query.lifetime
app.get('/financialmodelingprep_direct_resolver', async function(req, res) {
    res.status(200).json(
        await retrieveFromCache(req.query.key, req.query.url, parseInt(req.query.lifetime)));
});

// healthcheck Function
app.get('/healthcheck/' ,async function (req, res) {
    res.status(200).send("Api is running");
});

// Run the server on PORT over https
https.createServer({
    key: fs.readFileSync('app_config/server.key'),
    cert: fs.readFileSync('app_config/server.cert')
}, app)
.listen(PORT, function () {
    console.log(`Service running on port ${PORT}`);
})

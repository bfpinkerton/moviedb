const express = require('express');
const next = require('next');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');

const Auth0Strategy = require('passport-auth0'),
      passport = require('passport');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const dbservice = require('./dbservice/app.js');
const searchapi = require('./searchapi/app.js');

//passport-auth0
var strategy = new Auth0Strategy({
    domain       : process.env.AUTH0_DOMAIN,
    clientID     : process.env.OAUTH0_CLIENT_ID,
    clientSecret : process.env.OAUTH0_CLIENT_SECRET,
    callbackURL  : process.env.APP_ROOT + '/callback'
    },
    function(accessToken, refreshToken, extraParams, profile, done) {
        // accessToken is the token to call Auth0 API (not needed in the most cases)
        // extraParams.id_token has the JSON Web Token
        // profile has all the information from the user
        return done(null, profile);
    }
);

const MongoClient = require('mongodb').MongoClient;

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production';

const mongo_user = process.env.MONGO_USERNAME || null;
const mongo_pass = process.env.MONGO_PASSWORD || null;
const mongo_host = process.env.MONGO_HOSTNAME || "mongo";

var mongo_creds = mongo_user || "";

if ( mongo_pass ) mongo_creds += ":" + mongo_pass;

mongo_creds = ( mongo_creds ) ? (mongo_creds + "@") : "";

const mongo_url = "mongodb://" + mongo_creds + mongo_host + ":27017/movies_mongo";

const elasticsearch_uri = process.env.ELASTICSEARCH_URI || "http://elasticsearch:9200";

const app = next({ 
    dev,
    dir: './present'
});

const index_handler = indexRouter.getRequestHandler(app);

passport.use(strategy);

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

app.prepare()
    .then(() => {

        MongoClient.connect(mongo_url, (err, client) => {

            if (!err) {
                const db = client.db();
                const server = express();

                if (!dev) server.set('trust proxy', 1);

                server.use((req, res, next) => {
                    req.db = db;
                    next();
                });

                server.use(session({
                    secret: process.env.APP_SECRET || 'DEV_SECRET_1234' ,
                    cookie: {
                        secure: !dev,
                        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
                    },
                    resave: true,
                    saveUninitialized: true,
                    store: new MongoStore({
                        uri: mongo_url,
                        collection: 'sessions'
                    }
                    )
                }));
                server.use(passport.initialize());
                server.use(passport.session());
                server.use(flash());

                server.use(function(req, res, next) {
                    if (req && req.query && req.query.error) {
                        req.flash("error", req.query.error);
                    }
                    if (req && req.query && req.query.error_description) {
                        req.flash("error_description", req.query.error_description);
                    }
                    next();
                });

                server.use('/dbservice', dbservice(db));
                server.use('/searchapi', searchapi(db, elasticsearch_uri));
                server.use(authRouter);
                server.use(index_handler);
                server.listen(port);

            } else {
                console.log(err);
            }

        });

})

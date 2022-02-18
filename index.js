// Required dependencies
// Google Cloud Platform - Restful API with OAuth
const express = require('express');
const app = express();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const cookieSession = require('cookie-session');
const config = require('./config.js');

// cookieSession config
app.use(cookieSession({
    maxAge: 60 * 1000,
    keys:['12345']
}));

app.use(passport.initialize()); // used to initialize passport
app.use(passport.session()); // used to persist login sessions

// Strategy config
passport.use(new GoogleStrategy({
        clientID: config.oauthConfig.Google.clientID,
        clientSecret: config.oauthConfig.Google.clientSecret,
        callbackURL: 'http://localhost:8000/auth/google/callback'
    },
    (accessToken, refreshToken, profile, done) => {
        done(null,profile); // passes the profile data to the serializeUser
    }
));

// Uses to stuff a piece of information into a cookie. NOM NOM NOM!!
passport.serializeUser((user, done) => {
    done(null, user);
});

// Used to decode the received cookie and persist session 
passport.deserializeUser((user, done) => {
    done(null, user);
});

// Middleware is also called plumbing becuase of the data pipes it uses to hold two applications together by allowing data to pass via 'The Pipe'
// Middleware to check if the user is authenticted 
function isUserAuthenticated(req, res, next) {
    if (req.user) {
        next();
    } else {
        //console.log(req.user);
        // console.log(res);
        res.send('You must login before YOU SHALL PASS!');
    }
}

// Routes
app.get('/', (req, res) => {
    res.render('index.ejs');
});

// passport.authenticate middleware is used here to authenticate the request
app.get('/auth/google', passport.authenticate('google',{
    scope: ['https://www.googleapis.com/auth/userinfo.profile'] // Used to specify the required data
}));

// The middleware receives the data from Google and runs the function on Strategy config
app.get('/auth/google/callback', passport.authenticate('google'), (req, res) => {
    // console.log(req.user);
    res.redirect('/secret');
});

// Secret Route
app.get('/secret', isUserAuthenticated, (req, res) => {
    res.send('You have reached the secret route. Its not so secret anymore');

});

// Logout route
app.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/');
});

app.listen(8000, () => {
    console.log('Server Started');
});

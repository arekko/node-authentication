
// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
// load all the things we need
var FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20');

// load up the user model
var User            = require('../app/models/user');
// load the auth variables
var configAuth = require('./auth');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'


    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  email }, (err, user) => {
            // if there are any errors, return the error
            if (err)
                return done(err);
            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {

              if(!req.user){
                // if there is no user with that email
                // create the user
                let newUser            = new User();
                // set the user's local credentials
                newUser.local.email    = email;
                newUser.local.password = newUser.generateHash(password);
                newUser.save().then(newUser => done(null, newUser))
              } else {
                let user = req.user

                user.local.email    = email;
                user.local.password = user.generateHash(password);
                console.log(user.local.passport)

                user.save().then(user => done(null, user) )
              }
            }
        });








    }));

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-login', new LocalStrategy({
      // by default, local strategy uses username and password, we will override with email
      usernameField : 'email',
      passwordField : 'password',
      passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  function(req, email, password, done) { // callback with email and password from our form

      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      User.findOne({ 'local.email' :  email }, function(err, user) {
          // if there are any errors, return the error before anything else
          if (err)
              return done(err);

          // if no user is found, return the message
          if (!user)
              return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

          // if the user is found but the password is wrong
          if (!user.validPassword(password))
              return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

          // all is well, return successful user
          return done(null, user);
      });

  }));






    // code for login (use('local-login', new LocalStategy))
    // code for signup (use('local-signup', new LocalStategy))

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },

    // facebook will send back the token and profile
    function(req, token, refreshToken, profile, done) {

      if(!req.user) {


        User.findOne({'facebook.id': profile.id})
          .then(user => {
            if(user) {

                if (!user.facebook.token) {
                    user.facebook.token = token;
                    user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                    // user.facebook.email = profile.emails[0].value;

                    user.save().then(user => done(null, user))
              }

              return done(null, user);
            } else {

              const newUser = new User({
                facebook: {
                  id: profile.id,
                  token: token,
                  name: profile.displayName
                }
              }).save().then( newUser => done(null, newUser))

            }
          })
      } else {
        let user = req.user


        // update the current users facebook credentials

        user.facebook.id    = profile.id;
        user.facebook.token = token;
        user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
        // user.facebook.email = profile.emails[0].value;

        user.save().then(user => done(null, user) )
      }


      }))


      // =========================================================================
      // GOOGLE ==================================================================
      // =========================================================================

  passport.use(new GoogleStrategy({
  //options for the strategy
    clientID: configAuth.googleAuth.clientID,
    clientSecret: configAuth.googleAuth.clientSecret,
    callbackURL: configAuth.googleAuth.callbackURL,
    passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)


  }, (req, token, refreshToken, profile, done) => {
    //passport callback function
    // Check if user already exsist in our db

    if(!req.user) {
      User.findOne({googleid: profile.id})
        .then(user => {
          if(user) {
            return done(null, user);
          } else {

            const newUser = new User({
              google: {
                id:    profile.id,
                token: token,
                name:  profile.displayName,
                email: email = profile.emails[0].value
              }
            }).save().then( newUser => done(null, newUser))
          }
        })
    } else {

      let user = req.user

      user.google.id = profile.id
      user.google.name = profile.displayName
      user.google.token = token
      user.google.email = profile.emails[0].value

      user.save().then((user) => done(null, user))
    }


  })
);



};

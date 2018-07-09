// load all the things we need
// load all the things we need

// load up the user model
var User = require("../app/models/user");
// load the auth variables
var configAuth = require("./auth");

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

  // LOCAL SIGNUP ============================================================
  require("./passport-local")(passport);

  // FACEBOOK ================================================================
  require("./passport-facebook")(passport, configAuth);

  // GOOGLE ==================================================================
  require("./passport-google")(passport, configAuth);

  // Vkontakte ==================================================================
  require('./passport-vk')(passport, configAuth)
};

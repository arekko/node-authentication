// =========================================================================
// FACEBOOK ================================================================
// =========================================================================
var FacebookStrategy = require("passport-facebook").Strategy;
var User = require("../app/models/user");

module.exports = (passport, configAuth) => {
  passport.use(
    new FacebookStrategy(
      {
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL,
        passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
      },

      // facebook will send back the token and profile
      function(req, token, refreshToken, profile, done) {
        if (!req.user) {
          User.findOne({ "facebook.id": profile.id }).then(user => {
            if (user) {
              if (!user.facebook.token) {
                user.facebook.token = token;
                user.facebook.name =
                  profile.name.givenName + " " + profile.name.familyName;
                // user.facebook.email = profile.emails[0].value;

                user.save().then(user => done(null, user));
              }

              return done(null, user);
            } else {
              const newUser = new User({
                facebook: {
                  id: profile.id,
                  token: token,
                  name: profile.displayName
                }
              })
                .save()
                .then(newUser => done(null, newUser));
            }
          });
        } else {
          let user = req.user;

          // update the current users facebook credentials

          user.facebook.id = profile.id;
          user.facebook.token = token;
          user.facebook.name =
            profile.name.givenName + " " + profile.name.familyName;
          // user.facebook.email = profile.emails[0].value;

          user.save().then(user => done(null, user));
        }
      }
    )
  );
};

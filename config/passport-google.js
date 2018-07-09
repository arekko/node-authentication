// =========================================================================
// GOOGLE ==================================================================
// =========================================================================

const GoogleStrategy = require("passport-google-oauth20");
var User = require("../app/models/user");

module.exports = (passport, configAuth) => {
  passport.use(
    new GoogleStrategy(
      {
        //options for the strategy
        clientID: configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
        callbackURL: configAuth.googleAuth.callbackURL,
        passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
      },
      (req, token, refreshToken, profile, done) => {
        //passport callback function
        // Check if user already exsist in our db

        if (!req.user) {
          User.findOne({ "google.id": profile.id }).then(user => {
            if (user) {
              return done(null, user);
            } else {
              const newUser = new User({
                google: {
                  id: profile.id,
                  token: token,
                  name: profile.displayName,
                  email: (email = profile.emails[0].value)
                }
              })
                .save()
                .then(newUser => done(null, newUser));
            }
          });
        } else {
          let user = req.user;

          user.google.id = profile.id;
          user.google.name = profile.displayName;
          user.google.token = token;
          user.google.email = profile.emails[0].value;

          user.save().then(user => done(null, user));
        }
      }
    )
  );
};

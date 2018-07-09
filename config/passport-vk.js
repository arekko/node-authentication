
const VKontakteStrategy = require('passport-vkontakte').Strategy;
var User = require("../app/models/user");



module.exports = (passport, configAuth) => {
  passport.use(new VKontakteStrategy(
  {
    clientID:     configAuth.vk.clientID, // VK.com docs call it 'API ID', 'app_id', 'api_id', 'client_id' or 'apiId'
    clientSecret: configAuth.vk.clientSecret,
    callbackURL:  configAuth.vk.callbackURL,
    passReqToCallback: true, // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    scope: ['email'],
    profileFields: ['email'],
  },
  function (req, accessToken, refreshToken, params, profile, done) {
    console.log(profile, params)
    if(!req.user) {
      User.findOne({'vk.id': profile.id}).then(user => {
        if(user) {
          if(!user.vk.token) {
            user.vk.token = accessToken
            user.save().then(user => done(null, user))
          }
          return done(null, user)
        } else {
          const newUser = new User({
            vk: {
              id: profile.id,
              name: profile.displayName,
              token: accessToken,
              avatar: profile.photos[0].value,
              profileURL: profile.profileUrl
            }
          })
          .save()
          .then(newUser => done(null, newUser))
        }
      })
    } else {
      let user = req.user

      user.vk.id = profile.id
      user.vk.name = profile.displayName
      user.vk.token = accessToken
      user.vk.avatar = profile.photos[0].value
      user.save().then(user => done(null, user))

    }
  }
));

}

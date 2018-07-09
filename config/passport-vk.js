
const VKontakteStrategy = require('passport-vkontakte').Strategy;
var User = require("../app/models/user");



module.exports = (passport, configAuth) => {
  passport.use(new VKontakteStrategy(
  {
    clientID:     configAuth.vk.clientID, // VK.com docs call it 'API ID', 'app_id', 'api_id', 'client_id' or 'apiId'
    clientSecret: configAuth.vk.clientSecret,
    callbackURL:  configAuth.vk.callbackURL,
    scope: ['email'],
    profileFields: ['email'],
  },
  function (accessToken, refreshToken, params, profile, done) {
    console.log(accessToken)
    console.log(refreshToken)
    console.log(params)
    console.log(profile)


          const newUser = new User({
            vk: {
              id: profile.id,
              token: accessToken,
              name: profile.displayName,
              avatar: profile.photos[0].value
            }
          }).save()
            .then(newUser => done(null, newUser));
        }

));
}

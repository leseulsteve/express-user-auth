'use strict';

function SignIn() {

  var tokenService = require('../services/token-service');

  return {

    init: function(app, UserSchema, config) {
      
      app.route(config.signin.url).post(function(req, res) {

        UserSchema.findOne({
          username: req.body.username
        }, function(err, user) {

          if (err) throw err;

          if (!user || user.password != req.body.password) {
            return res.status(400).send({
              message: 'SignIn Failed'
            });
          }

          var tokenOptions = {
            expiresInMinutes: config.token.expiresInMinutes
          }

          res.json({
            user: user,
            token: tokenService.generate(user, config.token.secret, tokenOptions)
          });
        });
      });
    }
  }
}

module.exports = new SignIn();
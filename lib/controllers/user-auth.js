'use strict';

function UserAuth(UserSchema, MailTransporter, config) {

  var TokenService = require('../services/token-service'),
    ResetPasswordService = require('../services/reset-password')(MailTransporter, config);

  return {

    resetPassword: function(req, res) {

      UserSchema.findOne({
        username: req.body.username
      }, function(error, user) {

        if (error) throw error;

        if (!user) {
          return res.status(400).send({
            message: 'Utilisateur non existant'
          });
        }

        ResetPasswordService.reset(user).then(function(infos) {
          res.status(200).send({
            message: infos
          });
        }).catch(function(error) {
          throw error
        });
      });
    },

    signin: function(req, res) {

      UserSchema.findOne({
        username: req.body.username
      }, function(err, user) {

        if (err) throw err;

        if (!user || user.password != req.body.password) {
          return res.status(400).send({
            message: 'SignIn Failed'
          });
        }

        res.status(200).send({
          user: user,
          token: TokenService.generate(user)
        });
      });
    }
  };
}

module.exports = UserAuth;
'use strict';

function UserAuth(UserSchema, MailTransporter, config) {

  var TokenService = require('../services/token-service'),
    SendPasswordTokenService = require('../services/send-password-token')(MailTransporter, config);

  var jwt = require('jsonwebtoken');

  return {

    signin: function(req, res) {
      console.log('3489384938498')

      UserSchema.findOne({
        username: req.body.username
      }, function(err, user) {

        if (err) throw err;

        if (!user || user.password != req.body.password) {
          return res.status(400).send({
            message: 'SignIn Failed'
          });
        }

        // user.password = undefined;

        res.status(200).send({
          user: user,
          token: TokenService.generate(user)
        });
      });
    },

    sendPasswordToken: function(req, res) {

      UserSchema.findOne({
        username: req.body.username
      }, function(error, user) {

        if (error) throw error;

        if (!user) {
          return res.status(400).send({
            message: 'Utilisateur non existant'
          });
        }

        SendPasswordTokenService.reset(user, req.body.urlRedirection).then(function(infos) {
          res.status(200).send({
            message: infos
          });
        }).catch(function(error) {
          throw error;
        });
      });
    },

    changePassword: function(req, res) {

      req.user.password = req.body.newPassword;

      req.user.save(function(error) {
        
        if (error) throw error;

        res.status(200).send({
          message: 'Mot de passe changé!'
        });
      });
    }
  };
}

module.exports = UserAuth;
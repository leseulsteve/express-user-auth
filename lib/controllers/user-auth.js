'use strict';

function UserAuth(UserSchema, MailTransporter, config) {

  var TokenService = require('../services/token-service'),
    SendPasswordTokenService = require('../services/send-password-token')(MailTransporter, config),
    SendSignupConfirm = require('../services/send-signup-confirm')(MailTransporter, config);

  var jwt = require('jsonwebtoken');

  return {

    signin: function(req, res) {

      UserSchema.findOne({
        username: req.body.username
      }, function(err, user) {

        if (err) throw err;

        if (!user || user.password != req.body.password) {
          return res.status(400).send({
            code: 'BadCredentials',
            message: 'SignIn Failed'
          });
        }

        if (user.emailConfirmed = false) {
          return res.status(400).send({
            code: 'EmailNonConfirmed',
            message: 'Email non confirmé'
          });
        }

        user.password = undefined;

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
            code: 'NonExistantUser',
            message: 'Utilisateur non existant'
          });
        }

        if (user.emailConfirmed = false) {
          return res.status(400).send({
            code: 'EmailNonConfirmed',
            message: 'Email non confirmé'
          });
        }

        SendPasswordTokenService.reset(user, req.body.urlRedirection).then(function(infos) {
          res.status(200).send({
            code: 'PasswordTokenSent',
            message: infos
          });
        }).catch(function(error) {
          throw error;
        });
      });
    },

    changePassword: function(req, res) {

      if (req.user.emailConfirmed = false) {
        return res.status(400).send({
          code: 'EmailNonConfirmed',
          message: 'Email non confirmé'
        });
      }

      req.user.password = req.body.newPassword;

      req.user.save(function(error) {

        if (error) throw error;

        res.status(200).send({
          code: 'PasswordChanged',
          message: 'Mot de passe changé!'
        });
      });
    },

    signup: function(req, res) {

      var newUser = new UserSchema(req.body);

      newUser.save(function(error) {
        if (error) throw error;

        SendSignupConfirm.send(user).then(function() {
          res.status(200).send({
            code: 'UserCreated',
            message: 'Nouvel utilisateur créé'
          });
        }).catch(function(reason) {
          res.status(500).send({
            code: 'undefined',
            message: reason;
          });
        });
      });
    },

    confirmEmail: function(req, res) {

      req.user.emailConfirmed = true;

      req.user.save(function(error) {
        if (error) throw error;

        res.status(200).send({
          code: 'EmailConfirmed',
          message: 'Email confirmé!'
        });

      });
    }
  };
}

module.exports = UserAuth;
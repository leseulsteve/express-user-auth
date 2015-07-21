'use strict';

function ResetPassword() {

  var tokenService = require('../services/token-service'),
    UserSchema,
    mailOptions,
    config,
    EmailTransporter;

  return {

    init: function(User, configValues) {

      UserSchema = User;

      config = configValues;

      var mailOptions = {
        from: config.resetPassword.emailFromField,
        subject: config.resetPassword.emailSubjectField
      }
    },

    setMailTransporter: function(transporter) {
      EmailTransporter = transporter;
    },

    sendToken: function(req, res) {

      UserSchema.findOne({
        username: req.body.username
      }, function(err, user) {

        if (err) throw err;

        if (!user) {
          return res.status(400).send({
            message: 'Utilisateur non existant'
          });
        }

        var tokenOptions = {
          expiresInMinutes: config.token.expiresInMinutes
        }

        console.log(tokenService)

        var token = tokenService.generate(user, config.token.secret, tokenOptions);

        mailOptions.to = user[userEmailAttribute];
        mailOptions.text = 'Votre nouveau token: ' + token.id;

        EmailTransporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Message sent: ' + info.response);
            res.status(200).send({
              message: 'Courriel envoyé'
            });
          }
        });
      });
    }
  }
}

module.exports = new ResetPassword();
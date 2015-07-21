'use strict';

function ResetPassword() {

  var tokenService = require('../services/token-service'),
    EmailTransporter;

  return {

    init: function(app, UserSchema, config) {

      var mailOptions = {
          from: config.resetPassword.emailFromField,
          subject: config.resetPassword.emailSubjectField
        },
        userEmailAttribute = config.user.emailAttribute;

      app.route(config.resetPassword.url).post(function(req, res) {

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
      });
    },

    setMailTransporter: function(transporter) {
      EmailTransporter = transporter;
    }
  }
}

module.exports = new ResetPassword();
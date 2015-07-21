'use strict';

var resetPassword = function() {

  var tokenService = require('./lib/services/token-service'),

  return {

    init: function(app, config) {
      var UserSchema = require(config.user.schemaPath),
      mailOptions = {
        from: config.resetPassword.emailFromField,
        subject: config.resetPassword.emailSubjectField
      },
      userEmailAttribute = config.user.emailAttribute;

      app.route(config.urls.resetPassword).post(function(req, res) {

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

          var token = tokenService.generate(user, config.token.secret, tokenOptions);

          mailOptions.to = user[userEmailAttribute];
          mailOptions.text = 'Votre nouveau token: ' + token;

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

module.exports = resetPassword;
'use strict';

var signIn = function(userSchema) {

  var jwt = require('jsonwebtoken');

  return {

    process: function(req, res) {

      userSchema.findOne({
        username: req.body.username
      }, function(err, user) {

        if (err) throw err;

        if (!user || user.password != req.body.password) {
          return res.status(400).send({
            message: 'SignIn Failed'
          });
        }

        var expiresInMinutes = req.app.get('jwtConfig').expiresInMinutes;

        var token = jwt.sign(user, req.app.get('jwtConfig').secret, {
          expiresInMinutes: expiresInMinutes
        });

        res.json({
          user: user,
          token: {
            id: token,
            expiration: new Date().getTime() + expiresInMinutes * 60000
          } 
        });
      });
    }
  }
}

module.exports = signIn;
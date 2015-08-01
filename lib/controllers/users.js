'use strict';

function Users(UserSchema, config) {

  var _ = require('lodash-node');

  return {

    create: function(req, res) {

      // VÃ©rifie si l'utilisateur peut crÃ©er des users.

      if (config.signup.userCreationRoles && _.intersection(req.user.roles, config.signup.userCreationRoles).length === 0) {
        return res.status(401).send({
          code: 'UserCreationNotAuthorized',
          message: 'L\'utilisateur n\'a pas le ou les rÃ´les permis pour crÃ©er un autre utilisateur'
        });
      }

      var newUser = new UserSchema(req.body);

      newUser.save(function(error) {

        if (error) throw error;

         // TODO: MOT DE PASSE TEMPORAIRE 
        // TODO: ENVOIS COURRIEL DE CONFIRMATION 

        newUser.save(function(error) {

          if (error) throw error;

          newUser.password = undefined;
          newUser.salt = undefined;

          res.status(200).send(newUser);
        });

      });
    },

    find: function(req, res) {

      UserSchema.find({}, function(error, users) {

        if (error) throw error;

        var filteredUsers = _.filter(users, function(user) {
          user.password = undefined;
          user.salt = undefined;
          if (config.findUser.hideUserIds) {
            var show = true;
            _.forEach(config.findUser.hideUserIds, function(id) {
              show &= id != user._id;
            });
            return show;
          } else {
            return true;
          }
        });

        res.status(200).send(filteredUsers);

      });
    },

    update: function(req, res) {

      var user = _.assign(req.foundUser, req.body);

      user.save(function(error) {

        if (error) throw error;

        user.password = undefined;
        user.salt = undefined;

        res.status(200).send(user);

      });
    },

    destroy: function(req, res) {

      req.foundUser.remove(function(error) {

        if (error) throw error;

        res.status(200).send();

      });
    },

    findOne: function(req, res, userId) {

      req.foundUser.password = undefined;
      req.foundUser.salt = undefined;

      res.status(200).send(req.foundUser);
    },

    injectUser: function(req, res, next, id) {

      UserSchema.findById(id, function(error, user) {

        if (error) throw error;

        if (!user) {
          return res.status(404).send({
            message: 'L\'utilisateur ' + id + ' n\'existe pas!'
          });
        }

        req.foundUser = user;

        next();
      });
    }
  };
}

module.exports = Users;
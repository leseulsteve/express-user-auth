'use strict';

function Users(UserSchema, config) {

  var _ = require('lodash-node');

  return {

    create: function(req, res) {

      // VÃ©rifie si l'utilisateur peut crÃ©er des users.

      if (config.userApi.userCreationRoles && _.intersection(req.user.roles, config.userApi.userCreationRoles).length === 0) {
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

          var include = true;

          if (config.userApi.hideUserIds) {
            _.forEach(config.userApi.hideUserIds, function(id) {
              include &= id != user._id.toString();
            });
          }

          if (include) {
            var hasPermisionToView = false;
            _.forEach(req.user.roles, function(role) {
              var permission = config.userApi.permissions[role];

              if (_.isString(permission)) {
                hasPermisionToView = permission === 'all';
              } else {
                _.forEach(permission, function(perm) {
                  hasPermisionToView = hasPermisionToView || _.contains(['READ'], perm);
                  hasPermisionToView = hasPermisionToView || _.contains(['READ-OWN'], perm) && user._id.equals(req.user._id);
                });
              }

            });
            include = hasPermisionToView;
          }

          return include;

        });

        res.status(200).send(filteredUsers);

      });
    },

    update: function(req, res) {

      var hasPermisionToUpdate = false;
      _.forEach(req.user.roles, function(role) {
        var permission = config.userApi.permissions[role];

        if (_.isString(permission)) {
          hasPermisionToUpdate = permission === 'all';
        } else {
          _.forEach(permission, function(perm) {
            hasPermisionToUpdate = hasPermisionToUpdate || _.contains(['UPDATE'], perm);
            hasPermisionToUpdate = hasPermisionToUpdate || _.contains(['UPDATE-OWN'], perm) && req.foundUser._id.equals(req.user._id);
          });
        }
      });

      if (hasPermisionToUpdate) {
        var user = _.assign(req.foundUser, req.body);

        user.save(function(error) {

          if (error) throw error;

          user.password = undefined;
          user.salt = undefined;

          res.status(200).send(user);

        });
      } else {
        return res.status(401).send({
          code: 'UserUpdateNotAuthorized',
          message: 'L\'utilisateur n\'a pas le ou les rôles permis pour modifier cet utilisateur'
        });
      }

    },

    destroy: function(req, res) {

      var hasPermisionToDestroy = false;
      _.forEach(req.user.roles, function(role) {
        var permission = config.userApi.permissions[role];

        if (_.isString(permission)) {
          hasPermisionToDestroy = permission === 'all';
        } else {
          _.forEach(permission, function(perm) {
            hasPermisionToDestroy = hasPermisionToDestroy || _.contains(['REMOVE'], perm);
            hasPermisionToDestroy = hasPermisionToDestroy || _.contains(['REMOVE-OWN'], perm) && req.foundUser._id.equals(req.user._id);
          });
        }
      });

      if (hasPermisionToDestroy) {
        req.foundUser.remove(function(error) {
          if (error) throw error;
          res.status(200).send();
        });
      } else {
        return res.status(401).send({
          code: 'UserDeletationNotAuthorized',
          message: 'L\'utilisateur n\'a pas le ou les rôles permis pour supprimer cet utilisateur'
        });
      }
    },

    findOne: function(req, res, userId) {

      var hasPermisionToView = false;
      _.forEach(req.user.roles, function(role) {
        var permission = config.userApi.permissions[role];

        if (_.isString(permission)) {
          hasPermisionToView = permission === 'all';
        } else {
          _.forEach(permission, function(perm) {
            hasPermisionToView = hasPermisionToDestroy || _.contains(['READ'], perm);
            hasPermisionToView = hasPermisionToDestroy || _.contains(['READ-OWN'], perm) && req.foundUser._id.equals(req.user._id);
          });
        }
      });

      if (hasPermisionToView) {
        req.foundUser.password = undefined;
        req.foundUser.salt = undefined;

        res.status(200).send(req.foundUser);
      } else {
        return res.status(401).send({
          code: 'UserFindOneNotAuthorized',
          message: 'L\'utilisateur n\'a pas le ou les rôles permis pour voir cet utilisateur'
        });
      }

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

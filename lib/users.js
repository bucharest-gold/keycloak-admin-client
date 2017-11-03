'use strict';

const privates = require('./private-map');
const request = require('request');
const roleMappings = require('./role-mappings');
const groups = require('./users-groups');

/**
 * @module users
 */

module.exports = {
  find: find,
  create: create,
  update: update,
  remove: remove,
  roleMappings: roleMappings,
  groups: groups,
  resetPassword: resetPassword,
  executeActionsEmail: executeActionsEmail,
  count: count
};

/**
  A function to get the list of users or a user for a realm.
  @param {string} realmName - The name of the realm(not the realmID) - ex: master
  @param {object} [options] - The options object
  @param {string} [options.userId] - use this options to get a user by an id. If this value is populated, it overrides the querystring param options
  @param {string} [options.username] - the querystring param to search based on username
  @param {string} [options.firstName] - the querystring param to search based on firstName
  @param {string} [options.lastName] - the querystring param to search based on lastName
  @param {string} [options.email] - the querystring param to search based on email
  @returns {Promise} A promise that will resolve with an Array of user objects or just the 1 user object if userId is used
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.users.find(realmName)
        .then((userList) => {
        console.log(userList) // [{...},{...}, ...]
      })
    })
 */
function find (client) {
  return function find (realm, options) {
    return new Promise((resolve, reject) => {
      options = options || {};
      const req = {
        auth: {
          bearer: privates.get(client).accessToken
        },
        json: true
      };

      if (options.userId) {
        req.url = `${client.baseUrl}/admin/realms/${realm}/users/${options.userId}`;
      } else {
        req.url = `${client.baseUrl}/admin/realms/${realm}/users`;
        req.qs = options;
      }

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        if (resp.statusCode !== 200) {
          return reject(resp);
        }

        return resolve(resp);
      });
    });
  };
}

/**
  A function to create a new user for a realm.
  @param {string} realmName - The name of the realm(not the realmID) - ex: master
  @param {object} user - The JSON representation of a user - http://keycloak.github.io/docs/rest-api/index.html#_userrepresentation - username must be unique
  @returns {Promise} A promise that will resolve with the user object
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.users.create(realmName, user)
        .then((createdUser) => {
        console.log(createdUser) // [{...}]
      })
    })
 */
function create (client) {
  return function create (realm, user) {
    return new Promise((resolve, reject) => {
      const req = {
        url: `${client.baseUrl}/admin/realms/${realm}/users`,
        auth: {
          bearer: privates.get(client).accessToken
        },
        body: user,
        method: 'POST',
        json: true
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        if (resp.statusCode !== 201) {
          return reject(resp);
        }

        // eg "location":"https://<url>/auth/admin/realms/<realm>/users/499b7073-fe1f-4b7a-a8ab-f401d9b6b8ec"
        const uid = resp.headers.location.replace(/.*\/(.*)$/, '$1');

        // Since the create Endpoint returns an empty body, go get what we just imported.
        // *** Body is empty but location header contains user id ***
        // We need to search based on the userid, since it will be unique
        return resolve(client.users.find(realm, {
          userId: uid
        }));
      });
    });
  };
}

/**
  A function to update a user for a realm
  @param {string} realmName - The name of the realm(not the realmID) - ex: master,
  @param {object} user - The JSON representation of the fields to update for the user - This must include the user.id field.
  @returns {Promise} A promise that resolves.
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.users.update(realmName, user)
        .then(() => {
          console.log('success')
      })
    })
 */
function update (client) {
  return function update (realmName, user) {
    return new Promise((resolve, reject) => {
      user = user || {};
      const req = {
        url: `${client.baseUrl}/admin/realms/${realmName}/users/${user.id}`,
        auth: {
          bearer: privates.get(client).accessToken
        },
        json: true,
        method: 'PUT',
        body: user
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        // Check that the status cod
        if (resp.statusCode !== 204) {
          return reject(resp);
        }

        return resolve(resp);
      });
    });
  };
}

/**
  A function to delete a user in a realm
  @param {string} realmName - The name of the realm(not the realmID) to delete - ex: master,
  @param {string} userId - The id of the user to delete
  @returns {Promise} A promise that resolves.
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.users.remove(realmName, userId)
        .then(() => {
          console.log('success')
      })
    })
 */
function remove (client) {
  return function remove (realmName, userId) {
    return new Promise((resolve, reject) => {
      const req = {
        url: `${client.baseUrl}/admin/realms/${realmName}/users/${userId}`,
        auth: {
          bearer: privates.get(client).accessToken
        },
        method: 'DELETE'
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        // Check that the status code is a 204
        if (resp.statusCode !== 204) {
          return reject(resp);
        }

        return resolve(resp);
      });
    });
  };
}

/**
  A function to reset a user password for a realm
  @param {string} realmName - The name of the realm(not the realmID) - ex: master,
  @param {string} userId - The id of user
  @param {object} payload { temporary: boolean , value : string } - The JSON representation of the fields to update for the password
  @returns {Promise} A promise that resolves.
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.users.resetPassword(realmName, userId, { temporary: boolean , value : string})
        .then(() => {
          console.log('success')
      })
    })
 */
function resetPassword (c) {
  return function resetPassword (realmName, userId, payload) {
    return new Promise((resolve, reject) => {
      payload = payload || {};
      payload.type = 'password';

      if (!userId) {
        return reject(new Error('userId is missing'));
      }

      if (!payload.value) {
        return reject(new Error('value for the new password is missing'));
      }

      const req = {
        url: `${c.baseUrl}/admin/realms/${realmName}/users/${userId}/reset-password`,
        auth: {
          bearer: privates.get(c).accessToken
        },
        json: true,
        method: 'PUT',
        body: payload
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        // Check that the status cod
        if (resp.statusCode !== 204) {
          return reject(resp);
        }

        return resolve(resp);
      });
    });
  };
}

/**
  A function to execute predetermined keycloak email actions. For more information about what actions can be required by Keycloak please go here - https://keycloak.gitbooks.io/documentation/server_admin/topics/users/required-actions.html
  @param {string} realmName - The name of the realm(not the realmID) - ex: master,
  @param {string} userId - The id of user
  @param {object} [options] - The options object
  @param {string} [options.clientId] - The client ID that must be set in case of a redirect after actions
  @param {string} [options.redirectUri] - The redirect URI after the user has completed the required actions on the Keycloak server. If this variable is set, it must be a valid redirect URI for the specified clientId variable, and the clientId variable MUST be set
  @param {string} [options.verifyEmailAction] - Ask the user to verify his email address
  @param {string} [options.updateProfileAction] - Ask the user to update his/her profile
  @param {string} [options.updatePasswordAction] - Ask the user to change his/her password
  @param {string} [options.configureTOTPAction] - Ask the user to configure TOTP (Time-based One-time Password Algorithm)
  @returns {Promise} A promise that resolves.
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.users.executeActionsEmail(realmName, userId, { verifyEmail: true, updateProfile: true, updatePassword: true, configureTOTP: true })
        .then(() => {
          console.log('success')
      })
    })
 */
function executeActionsEmail (c) {
  return function executeActionsEmail (realmName, userId, options) {
    return new Promise((resolve, reject) => {
      options = options || {};

      if (!userId) {
        return reject(new Error('userId is missing'));
      }

      const payload = [];
      if (options.verifyEmailAction) {
        payload.push('VERIFY_EMAIL');
      }
      if (options.updateProfileAction) {
        payload.push('UPDATE_PROFILE');
      }
      if (options.updatePasswordAction) {
        payload.push('UPDATE_PASSWORD');
      }
      if (options.configureTOTPAction) {
        payload.push('CONFIGURE_TOTP');
      }

      if (payload.length === 0) {
        return reject(new Error('no actions defined'));
      }

      let queryParameter = '';
      if (options.redirectUri !== '') {
        if (options.clientId !== '') {
          queryParameter = `?redirect_uri=${options.redirectUri}&client_id=${options.clientId}`;
        } else {
          return reject(new Error('clientId is not set but redirectUri is. Both MUST go together'));
        }
      }

      const req = {
        url: `${c.baseUrl}/admin/realms/${realmName}/users/${userId}/execute-actions-email${queryParameter}`,
        auth: {
          bearer: privates.get(c).accessToken
        },
        json: true,
        method: 'PUT',
        body: payload
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        // Check that the status cod
        if (resp.statusCode !== 200) {
          return reject(resp);
        }

        return resolve(resp);
      });
    });
  };
}

/**
 A function to get the number of users in a realm.
 @param {string} realmName - The name of the realm(not the realmID) - ex: master
 @returns {Promise} A promise that will resolve with an integer - the number of users in the realm
 @example
 keycloakAdminClient(settings)
 .then((client) => {
      client.users.count(realmName)
        .then((numberOfUsers) => {
        console.log(numberOfUsers) // integer
      })
    })
 */
function count (client) {
  return function count (realm) {
    return new Promise((resolve, reject) => {
      const req = {
        auth: {
          bearer: privates.get(client).accessToken
        },
        json: true,
        url: `${client.baseUrl}/admin/realms/${realm}/users/count`
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        if (resp.statusCode !== 200) {
          return reject(resp);
        }

        return resolve(resp);
      });
    });
  };
}

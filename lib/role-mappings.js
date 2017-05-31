'use strict';

const privates = require('./private-map');
const request = require('request');

/**
 * @module users
 */

module.exports = {
  find: find
};

/**
  A function to get the all the role mappings of an user
  @param {string} realmName - The name of the realm (not the realmID) where the client roles exist - ex: master
  @param {string} userId - The id of the user whose role mappings should be found
  @returns {Promise} A promise that will resolve with the Array of role mappings
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.users.roleMappings.find(realmName, userId)
        .then((userRoleMappings) => {
          console.log(userRoleMappings)
      })
    })
 */
function find (client) {
  return function find (realmName, userId) {
    return new Promise((resolve, reject) => {
      const req = {
        auth: {
          bearer: privates.get(client).accessToken
        },
        json: true
      };

      req.url = `${client.baseUrl}/admin/realms/${realmName}/users/${userId}/role-mappings`;

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        if (resp.statusCode !== 200) {
          return reject(body);
        }

        return resolve(body);
      });
    });
  };
}

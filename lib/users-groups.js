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
  Returns a list of user's groups, filtered according to query parameters

  @param {string} realmName - The name of the realm(not the realmID) - ex: master
  @param {string} userId - Id of the users
  @returns {Promise} A promise that will resolve with an Array of user's group objects
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.users.groups.find(realmName, userId)
        .then((groups) => {
          console.log(groups) // [{...},{...}, ...]
        })
      });
 */
function find (client) {
  return function find (realm, userId) {
    return new Promise((resolve, reject) => {
      const req = {
        auth: {
          bearer: privates.get(client).accessToken
        },
        json: true,
        url: `${client.baseUrl}/admin/realms/${realm}/users/${userId}/groups`
      };

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

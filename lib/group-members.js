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
  Returns a list of group members, filtered according to query parameters

  @param {string} realmName - The name of the realm(not the realmID) - ex: master
  @param {string} groupId - Id of the group
  @param {object} [options] - The options object
  @param {integer} [options.first] - Pagination offset. Optional
  @param {integer} [options.max] - Maximum results size. Optional (defaults to 100)
  @returns {Promise} A promise that will resolve with an Array of group member objects
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.groups.members.find(realmName, groupId)
        .then((groupMembers) => {
          console.log(groupMembers) // [{...},{...}, ...]
        })
      });
 */
function find (client) {
  return function find (realm, groupId, options) {
    return new Promise((resolve, reject) => {
      const req = {
        auth: {
          bearer: privates.get(client).accessToken
        },
        json: true,
        url: `${client.baseUrl}/admin/realms/${realm}/groups/${groupId}/members`,
        qs: options || {}
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

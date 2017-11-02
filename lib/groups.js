'use strict';

const privates = require('./private-map');
const members = require('./group-members');
const request = require('request');

/**
 * @module users
 */

module.exports = {
  find: find,
  create: create,
  members: members
};

/**
 Get group hierarchy. Only name and ids are returned.
 @param {string} realmName - The name of the realm(not the realmID) - ex: master
 @param {object} [options] - The options object
 @param {string} [options.id] - The id of the group, this will override any query param options used
 @returns {Promise} A promise that will resolve with an Array of group objects
 @example
 keycloakAdminClient(settings)
 .then((client) => {
      client.groups.find(realmName)
        .then((groupList) => {
          console.log(groupList) // [{...},{...}, ...]
        })
      });
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

      if (options.id) {
        req.url = `${client.baseUrl}/admin/realms/${realm}/groups/${options.id}`;
      } else {
        req.url = `${client.baseUrl}/admin/realms/${realm}/groups`;
        req.qs = options;
      }

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

/**
 A function to create a new group.
 @param {string} realmName - The name of the realm(not the realmID) - ex: master
 @param {object} group - The JSON representation of a group - http://keycloak.github.io/docs/rest-api/index.html#_grouprepresentation - group_id must be unique
 @returns {Promise} A promise that will resolve with the new clients object
 @example
 keycloakAdminClient(settings)
 .then((client) => {
      client.groups.create(realmName, newGroupJSON)
        .then((createGroup) => {
        console.log(createGroup) // [{...}]
      })
    })
 */
function create (client) {
  return function create (realm, newGroup) {
    return new Promise((resolve, reject) => {
      const req = {
        url: `${client.baseUrl}/admin/realms/${realm}/groups`,
        auth: {
          bearer: privates.get(client).accessToken
        },
        body: newGroup,
        method: 'POST',
        json: true
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        if (resp.statusCode !== 201) {
          return reject(body);
        }

        const id = resp.headers.location.split('/').pop();

        // Since the create Endpoint returns an empty body, go get what we just imported.
        // But since we don't know the groups name, we need to search based on the name(yea, confusing, i know), since it will be unique
        // Then get the first element in the Array returned
        return resolve(client.groups.find(realm, {id}));
      });
    });
  };
}

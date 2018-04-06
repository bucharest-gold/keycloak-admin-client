'use strict';

const privates = require('./private-map');
const request = require('request');

/**
 * @module federatedIdentity
 */

module.exports = {
  find: find,
  create: create,
  remove: remove
};

/**
  A function to get the list of social provider logins a user is associated with
  @param {string} realmName - The name of the realm(not the realmID) - ex: master
  @param {string} userId - The id of the user to find social logins for
  @returns {Promise} A promise that will resolve with an Array of federated identity objects
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.federatedIdentity.find(realmName, userId)
        .then((identityList) => {
          console.log(identityList) // [{...},{...}, ...]
      })
    })
 */
function find (client) {
  return function find (realm, userId) {
    return new Promise((resolve, reject) => {
      const req = {
        url: `${client.baseUrl}/admin/realms/${realm}/users/${userId}/federated-identity`,
        auth: {
          bearer: privates.get(client).accessToken
        },
        json: true
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

/**
  A function to add a social provider login association for the provided user
  @param {string} realmName - The name of the realm(not the realmID) - ex: master
  @param {string} userId - The id of the user to add a social login for
  @param {string} providerId - The id of the provider to add the social login association
  @param {object} representation - The JSON representation of a federated identity - http://keycloak.github.io/docs-api/4.0/rest-api/index.html#_federatedidentityrepresentation
  @returns {Promise} A promise that will resolve with the federated identity object
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.federatedIdentity.create(realmName, userId, providerId, representation)
        .then(() => {
          console.log('success')
      })
    })
 */
function create (client) {
  return function create (realm, userId, providerId, representation) {
    return new Promise((resolve, reject) => {
      const req = {
        url: `${client.baseUrl}/admin/realms/${realm}/users/${userId}/federated-identity/${providerId}`,
        auth: {
          bearer: privates.get(client).accessToken
        },
        body: representation,
        method: 'POST',
        json: true
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        if (resp.statusCode !== 204) {
          return reject(body);
        }

        return resolve(body);

        // Since the create Endpoint returns an empty body, go get what we just imported.
        // *** Body is empty but location header contains user id ***
        // We need to search based on the userid, since it will be unique
        // return resolve(client.federatedIdentity.find(realm, userId));
      });
    });
  };
}

/**
  A function to delete a social provider login association for the provided user
  @param {string} realmName - The name of the realm(not the realmID) to delete - ex: master,
  @param {string} userId - The id of the user to remove social login association for
  @param {string} providerId - The id of the provider to remove the social login association with
  @returns {Promise} A promise that resolves.
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.federatedIdentity.remove(realmName, userId, providerId)
        .then(() => {
          console.log('success')
      })
    })
 */
function remove (client) {
  return function remove (realmName, userId, providerId) {
    return new Promise((resolve, reject) => {
      const req = {
        url: `${client.baseUrl}/admin/realms/${realmName}/users/${userId}/federated-identity/${providerId}`,
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
          return reject(body);
        }

        return resolve(body);
      });
    });
  };
}

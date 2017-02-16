'use strict';

const privates = require('./private-map');
const request = require('request');

/**
 * @module realms
 */

module.exports = {
  find: find,
  create: create,
  remove: remove,
  update: update
};

/**
  A function to get all the realms or just 1 realm for a client
  @param {string} [realmName] - The name of the realm(not the realmID) to find.  If no realm name is passed in, it will find all Realms
  @returns {Promise} A promise that will resolve with the Array of realm objects or if a realmName is specified, just the realm object
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.realms.find()
        .then((realms) => {
        console.log(realms) // [{...},{...}, ...]
      })
    })
 */
function find (client) {
  return function find (realmName) {
    return new Promise((resolve, reject) => {
      let req = {
        url: realmName ? `${client.baseUrl}/admin/realms/${realmName}` : `${client.baseUrl}/admin/realms`,
        auth: { bearer: privates.get(client).accessToken },
        json: true
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        // Check that the status cod
        if (resp.statusCode !== 200) {
          return reject(resp);
        }

        return resolve(body);
      });
    });
  };
}

/**
  A function to create/import a realm for a client
  @param {object} realm - The JSON representation of the realm to insert.
  @returns {Promise} A promise that resolves with the JSON representation of the created realm.
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.realms.create(realmName, realm)
        .then((newRealm) => {
          console.log(newRealm); //{...}
      })
    })
 */
function create (client) {
  return function create (realm) {
    return new Promise((resolve, reject) => {
      let req = {
        url: `${client.baseUrl}/admin/realms`,
        auth: { bearer: privates.get(client).accessToken },
        body: realm,
        json: true,
        method: 'POST'
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        if (resp.statusCode !== 201) {
          return reject(resp);
        }

        // Since the import Endpoint returns an empty body, go get what we just imported.
        return resolve(client.realms.find(realm.realm));
      });
    });
  };
}

/**
  A function to update a realm for a client
  @param {string} realmName - The name of the realm(not the realmID) to update - ex: master,
  @param {object} realm - The JSON representation of the fields to update.
  @returns {Promise} A promise that resolves.
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.realms.update(realmName, realm)
        .then(() => {
          console.log('success')
      })
    })
 */
function update (client) {
  return function update (realmName, realm) {
    return new Promise((resolve, reject) => {
      let req = {
        url: `${client.baseUrl}/admin/realms/${realmName}`,
        auth: { bearer: privates.get(client).accessToken },
        json: true,
        method: 'PUT',
        body: realm
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        // Check that the status cod
        if (resp.statusCode !== 204) {
          return reject(resp);
        }

        return resolve(body);
      });
    });
  };
}

/**
  A function to remove a realm for a client
  @param {string} realmName - The name of the realm(not the realmID) to delete - ex: master,
  @returns {Promise} A promise that resolves.
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.realms.remove(realmName,)
        .then(() => {
          console.log('success')
      })
    })
 */
function remove (client) {
  return function remove (realmName) {
    return new Promise((resolve, reject) => {
      let req = {
        url: `${client.baseUrl}/admin/realms/${realmName}`,
        auth: { bearer: privates.get(client).accessToken },
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

        return resolve(body);
      });
    });
  };
}

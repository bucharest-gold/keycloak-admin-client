'use strict';

const privates = require('./private-map');
const roles = require('./client-roles');
const request = require('request');
const maps = require('./client-role-mapper');
const authorizations = require('./client-authorizations');

/**
 * @module clients
 */

module.exports = {
  find: find,
  create: create,
  update: update,
  remove: remove,
  getClientSecret: getClientSecret,
  roles: roles,
  installation: installation,
  maps: maps,
  authorizations: authorizations
};

/**
  A function to get all the clients or a specific client for a realm
  @param {string} realmName - The name of the realm(not the realmID) to use - ex: master
  @param {object} [options] - The options object
  @param {string} [options.id] - The id of the client(not the client-id), this will override any query param options used
  @param {string} [options.clientId] - the querystring param to search based on clientId
  @returns {Promise} A promise that will resolve with the Array of clients or just 1 client if the id option is used
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.clients.find(realmName)
        .then((clients) => {
        console.log(clients) // [{...},{...}, ...]
      })
    })
 */
function find (client) {
  return function find (realmName, options) {
    return new Promise((resolve, reject) => {
      options = options || {};
      const req = {
        auth: {
          bearer: privates.get(client).accessToken
        },
        json: true
      };

      if (options.id) {
        req.url = `${client.baseUrl}/admin/realms/${realmName}/clients/${options.id}`;
      } else {
        req.url = `${client.baseUrl}/admin/realms/${realmName}/clients`;
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
  A function to create a new client.
  @param {string} realmName - The name of the realm(not the realmID) - ex: master
  @param {object} client - The JSON representation of a client - http://keycloak.github.io/docs/rest-api/index.html#_clientrepresentation - client_id must be unique
  @returns {Promise} A promise that will resolve with the new clients object
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.clients.create(realmName, newClientJSON)
        .then((createClient) => {
        console.log(createClient) // [{...}]
      })
    })
 */
function create (client) {
  return function create (realm, newClient) {
    return new Promise((resolve, reject) => {
      const req = {
        url: `${client.baseUrl}/admin/realms/${realm}/clients`,
        auth: {
          bearer: privates.get(client).accessToken
        },
        body: newClient,
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

        // Since the create Endpoint returns an empty body, go get what we just imported.
        // But since we don't know the clients id, we need to search based on the clientId(yea, confusing, i know), since it will be unique
        // Then get the first element in the Array returned
        return resolve(client.clients.find(realm, {clientId: newClient.clientId})
          .then((clients) => {
            return clients[0];
          }));
      });
    });
  };
}

/**
  A function to update a client for a realm
  @param {string} realmName - The name of the realm(not the realmID) - ex: master,
  @param {object} client - The JSON representation of the fields to update for the client - This must include the client.id field.
  @returns {Promise} A promise that resolves.
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.clients.update(realmName, clientToUpdate)
        .then(() => {
          console.log('success')
      })
    })
 */
function update (c) {
  return function update (realmName, client) {
    return new Promise((resolve, reject) => {
      client = client || {};
      const req = {
        url: `${c.baseUrl}/admin/realms/${realmName}/clients/${client.id}`,
        auth: { bearer: privates.get(c).accessToken },
        json: true,
        method: 'PUT',
        body: client
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        // Check that the status cod
        if (resp.statusCode !== 204) {
          return reject(body);
        }

        return resolve(body);
      });
    });
  };
}

/**
  A function to remove a client
  @param {string} realmName - The name of the realm(not the realmID) to remove - ex: master,
  @param {string} id - The id of the client aka client_id
  @returns {Promise} A promise that resolves.
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.clients.remove(realmName, id)
        .then(() => {
          console.log('success')
      })
    })
 */
function remove (client) {
  return function remove (realmName, id) {
    return new Promise((resolve, reject) => {
      const req = {
        url: `${client.baseUrl}/admin/realms/${realmName}/clients/${id}`,
        auth: { bearer: privates.get(client).accessToken },
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

/**
  A function to get the client secret of a client
  @param {string} realmName - The name of the realm(not the realmID) to remove - ex: master,
  @param {string} id - The id of the client(not the client-id) to remove
  @returns {Promise} A promise that resolves.
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.clients.getClientSecret(realmName, id)
        .then((clientSecret) => {
          console.log(clientSecret)
      })
    })
 */
function getClientSecret (client) {
  return function getClientSecret (realmName, id) {
    return new Promise((resolve, reject) => {
      const req = {
        url: `${client.baseUrl}/admin/realms/${realmName}/clients/${id}/client-secret`,
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
  A function to get the client installation
  @param {string} realmName - The name of the realm(not the realmID) to retrieve the installation - ex: master,
  @param {string} id - The id of the client aka client_id
  @returns {Promise} A promise that resolves.
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.clients.installation(realmName, id)
        .then((installation) => {
          console.log(installation)
      })
  })
  */
function installation (client) {
  return function installation (realmName, id) {
    return new Promise((resolve, reject) => {
      const req = {
        auth: {
          bearer: privates.get(client).accessToken
        },
        json: true
      };

      req.url = `${client.baseUrl}/admin/realms/${realmName}/clients/${id}/installation/providers/keycloak-oidc-keycloak-json`;

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

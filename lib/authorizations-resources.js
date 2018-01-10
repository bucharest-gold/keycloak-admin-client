'use strict';

const privates = require('./private-map');
const request = require('request');

/**
 * @module clients
 */

module.exports = {
  create: create,
  find: find,
  update: update,
  remove: remove
};

/**
  A function to create a new resource.
  @param {string} realmName - The name of the realm (not the realmID) where the client resources exist - ex: master
  @param {string} id - The id of the client (not the client-id) where the resource will be created
  @param {object} resource - The JSON representation of a resource - http://www.keycloak.org/docs-api/3.4/rest-api/index.html#_resourcerepresentation - name must be unique within the client
  @returns {Promise} A promise that will resolve with the newly created resource
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.clients.authorizations.resources.create(realmName, id, resource)
        .then((createdResource) => {
        console.log(createdResource) // [{...}]
      })
    })
 */
function create (client) {
  return function create (realm, id, resource) {
    return new Promise((resolve, reject) => {
      if (!resource) {
        return reject(new Error('resource is missing'));
      }

      const req = {
        url: `${client.baseUrl}/admin/realms/${realm}/clients/${id}/authz/resource-server/resource`,
        auth: {
          bearer: privates.get(client).accessToken
        },
        body: resource,
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

        // Since the create Endpoint returns an empty body, go get what we just created.
        return resolve(client.clients.authorizations.resources.find(realm, id, body._id));
      });
    });
  };
}

/**
  A function to get the all the resources of a client or a specific resource for a client
  @param {string} realmName - The name of the realm (not the realmID) where the client resources exist - ex: master
  @param {string} id - The id of the client (not the client-id) where the resource will be found
  @param {string} resourceId - Optional ID of a specific resource to find
  @returns {Promise} A promise that will resolve with the Array of resources or just one resource if the resourceId option is used
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.clients.authorizations.resources.find(realmName, id)
        .then((resources) => {
          console.log(resources)
      })
    })
 */
function find (client) {
  return function find (realm, id, resourceId) {
    return new Promise((resolve, reject) => {
      const req = {
        auth: {
          bearer: privates.get(client).accessToken
        },
        json: true
      };

      if (resourceId) {
        req.url = `${client.baseUrl}/admin/realms/${realm}/clients/${id}/authz/resource-server/resource/${resourceId}`;
      } else {
        req.url = `${client.baseUrl}/admin/realms/${realm}/clients/${id}/authz/resource-server/resource`;
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
  A function to update a resource.
  @param {string} realmName - The name of the realm (not the realmID) where the client resources exist - ex: master
  @param {string} id - The id of the client (not the client-id) where the resource will be found
  @param {object} resource - The JSON representation of a resource - http://www.keycloak.org/docs-api/3.4/rest-api/index.html#_resourcerepresentation - name must be unique within the client
  @returns {Promise} A promise that will resolve with the newly created client role
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.clients.authorizations.resources.update(realm, id, resourceId, resource)
        .then((updatedResource) => {
        console.log(updatedResource) // [{...}]
      })
    })
 */
function update (client) {
  return function update (realm, id, resource) {
    return new Promise((resolve, reject) => {
      if (!resource) {
        return reject(new Error('resource is missing'));
      }

      const req = {
        url: `${client.baseUrl}/admin/realms/${realm}/clients/${id}/authz/resource-server/resource/${resource._id}`,
        auth: {
          bearer: privates.get(client).accessToken
        },
        body: resource,
        method: 'PUT',
        json: true
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        if (resp.statusCode !== 204) {
          return reject(body);
        }

        // Since the create Endpoint returns an empty body, go get what we just imported.
        return resolve(client.clients.authorizations.resources.find(realm, id, resource._id));
      });
    });
  };
}

/**
  A function to remove a resource.
  @param {string} realm - The name of the realm (not the realmID) where the client roles exist - ex: master
  @param {string} id - The id of the client (not the client-id) where the resource will be found
  @param {string} resourceId - ID of a resource to update
  @returns {Promise} A promise that will resolve with empty return value if deletion was successful
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.clients.authorizations.resources.remove(realm, id, resourceId)
        .then(() => {
        console.log("Resource successfully removed");
      })
    })
 */
function remove (client) {
  return function remove (realm, id, resourceId) {
    return new Promise((resolve, reject) => {
      if (!resourceId) {
        return reject(new Error('resourceId is missing'));
      }

      const req = {
        url: `${client.baseUrl}/admin/realms/${realm}/clients/${id}/authz/resource-server/resource/${resourceId}`,
        auth: {
          bearer: privates.get(client).accessToken
        },
        method: 'DELETE',
        json: true
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        if (resp.statusCode !== 204) {
          return reject(body);
        }

        return resolve();
      });
    });
  };
}

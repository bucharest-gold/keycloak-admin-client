/**
 * @module keycloak-admin-client
 */

'use strict';
const privates = require('./private-map');
const authenticate = require('./auth');
const realms = require('./realms');
const users = require('./users');
const clients = require('./clients');
const groups = require('./groups');

function bindModule (client, input) {
  // For an
  if (typeof input === 'object') {
    const initializedModule = {};
    for (let name in input) {
      initializedModule[name] = bindModule(client, input[name]);
    }
    return initializedModule;
  } else if (typeof input === 'function') {
    return input(client);
  } else {
    throw new Error(`Unexpected input module type: ${input}`);
  }
}

/**
  Creates a new Keycloak Admin client
  @param {object} settings - an object containing the settings
  @param {string} settings.baseUrl - The baseurl for the Keycloak server - ex: http://localhost:8080/auth,
  @param {string} settings.username - The username to login to the keycloak server - ex: admin
  @param {string} settings.password - The password to login to the keycloak server - ex: *****
  @param {string} settings.grant_type - the type of authentication mechanism - ex: password,
  @param {string} settings.client_id - the id of the client that is registered with Keycloak to connect to - ex: admin-cli
  @param {string} settings.realmName - the name of the realm to login to - defaults to 'masterg'
  @param {string} settings.accessToken - An access token to use instead of authenticating via username & password
  @returns {Promise} A promise that will resolve with the client object.
  @instance
  @example

  const adminClient = require('keycloak-admin-client')
  const settings = {
    baseUrl: 'http://127.0.0.1:8080/auth',
    username: 'admin',
    password: 'admin',
    grant_type: 'password',
    client_id: 'admin-cli'
  }

  adminClient(settings)
    .then((client) => {
      client.realms()
      ...
      ...
    })
 */
function keycloakAdminClient (settings) {
  settings = settings || {};

  // setup our client and its private data
  const data = {};
  const client = {};

  // Recursively bind the modules to the client
  Object.assign(client, bindModule(client, {
    realms: realms,
    users: users,
    clients: clients,
    groups: groups
  }));

  // Make baseUrl unchanging
  Object.defineProperty(client, 'baseUrl', {
    value: settings.baseUrl
  });

  // A WeakMap reference to our private data
  // means that when all references to 'client' disappear
  // then the entry will be removed from the map
  privates.set(client, data);

  // return a promise that resolves after auth
  return authenticate(client, settings);
}

module.exports = keycloakAdminClient;

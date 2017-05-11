'use strict';

const privates = require('./private-map');
const requestToken = require('keycloak-request-token');

function getToken (baseUrl, settings) {
  if (settings.accessToken) {
    return Promise.resolve(settings.accessToken);
  }
  return requestToken(baseUrl, settings);
}

function authenticate (client, settings) {
  return getToken(client.baseUrl, settings)
    .then((token) => {
      privates.get(client).accessToken = token;

      return client;
    });
}

module.exports = authenticate;

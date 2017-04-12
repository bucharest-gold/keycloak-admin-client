'use strict';

const test = require('blue-tape');
const keycloakAdminClient = require('../index');

test('keycloakAdminClient should return a promise containing the client object', (t) => {
  const settings = {
    baseUrl: 'http://127.0.0.1:8080/auth',
    username: 'admin',
    password: 'admin',
    grant_type: 'password',
    client_id: 'admin-cli'
  };

  const kca = keycloakAdminClient(settings);

  t.equal(kca instanceof Promise, true, 'should return a Promise');
  return kca.then((client) => {
    t.equal(typeof client.baseUrl, 'string', 'client should contain a baseUrl String');
    t.equal(client.baseUrl, settings.baseUrl, 'client should contain a baseUrl String');
  });
});

test('keycloakAdminClient failed login, wrong user creds', (t) => {
  const settings = {
    baseUrl: 'http://127.0.0.1:8080/auth',
    username: 'admin',
    password: 'wrongpassword',
    grant_type: 'password',
    client_id: 'admin-cli'
  };

  const kca = keycloakAdminClient(settings);

  return kca.then(() => t.fail('should rejected'), (err) => {
    t.equal(err.error_description, 'Invalid user credentials', 'error description should be invalid credentials');
    t.equal(err.error, 'invalid_grant', 'error invalid_grant');
  });
});

test('keycloakAdminClient should be able to log in successfully into another realms admin-cli', (t) => {
  // You need to make sure to have a user with the correct roles and privileges for this to work
  const settings = {
    baseUrl: 'http://127.0.0.1:8080/auth',
    username: 'admin',
    password: 'admin',
    realmName: 'other',
    grant_type: 'password',
    client_id: 'admin-cli'
  };

  const kca = keycloakAdminClient(settings);

  t.equal(kca instanceof Promise, true, 'should return a Promise');
  return kca;
});

'use strict';

const test = require('blue-tape');
const keycloakAdminClient = require('../index');

const settings = {
  baseUrl: 'http://127.0.0.1:8080/auth',
  username: 'admin',
  password: 'admin',
  grant_type: 'password',
  client_id: 'admin-cli'
};

test('Test getting the list of federated identities for a user ', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    t.equal(typeof client.federatedIdentity.find, 'function', 'The client object returned should have a federatedIdentity find function');

    // Use the master realm
    const realmName = 'master';
    const userId = 'f9ea108b-a748-435f-9058-dab46ce59771';

    return client.federatedIdentity.find(realmName, userId).then((listOfIdentities) => {
      // The listOfIdentities should be an Array
      t.equal(listOfIdentities instanceof Array, true, 'the list of federated identities should be an array');

      // The list of identities in the master realm should be 0 for the user
      t.equal(listOfIdentities.length, 0, 'There should be 0 federated identities for the user');
    });
  });
});

test('Test adding a federated identity link to a user ', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    t.equal(typeof client.federatedIdentity.create, 'function', 'The client object returned should have a federatedIdentity create function');

    // Use the master realm
    const realmName = 'master';
    const userId = 'f9ea108b-a748-435f-9058-dab46ce59771';
    const providerId = 'test-oidc';
    const representation = {
      identityProvider: 'test-oidc',
      userId: 'ffe61c10-d3d3-4953-8587-c956d189c35a',
      userName: 'test-user-idp'
    };

    // The create API returns an empty response, so return it and let the test handle any error
    return client.federatedIdentity.create(realmName, userId, providerId, representation);
  });
});

test('Test new link to a federated identity link for a user ', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    // Use the master realm
    const realmName = 'master';
    const userId = 'f9ea108b-a748-435f-9058-dab46ce59771';

    return client.federatedIdentity.find(realmName, userId).then((listOfIdentities) => {
      // The listOfIdentities should be an Array
      t.equal(listOfIdentities instanceof Array, true, 'the list of federated identities should be an array');

      // The list of identities in the master realm should be 1 for the user
      t.equal(listOfIdentities.length, 1, 'There should be 1 federated identity for the user');
      t.equal(listOfIdentities[0].identityProvider, 'test-oidc', 'The identity provider of the relation should be test-oidc');
      t.equal(listOfIdentities[0].userId, 'ffe61c10-d3d3-4953-8587-c956d189c35a', 'The userId of the federated identity should be ffe61c10-d3d3-4953-8587-c956d189c35a');
      t.equal(listOfIdentities[0].userName, 'test-user-idp', 'The userName of the federated identity should be test-user-idp');
    });
  });
});

test('Test removing a federated identity link from a user ', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    t.equal(typeof client.federatedIdentity.remove, 'function', 'The client object returned should have a federatedIdentity remove function');

    // Use the master realm
    const realmName = 'master';
    const userId = 'f9ea108b-a748-435f-9058-dab46ce59771';
    const providerId = 'test-oidc';

    // The remove API returns an empty response, so return it and let the test handle any error
    return client.federatedIdentity.remove(realmName, userId, providerId);
  });
});

test('Test listing the federated identities for a user', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    // Use the master realm
    const realmName = 'master';
    const userId = 'f9ea108b-a748-435f-9058-dab46ce59771';

    return client.federatedIdentity.find(realmName, userId).then((listOfIdentities) => {
      // The listOfIdentities should be an Array
      t.equal(listOfIdentities instanceof Array, true, 'the list of federated identities should be an array');

      // The list of identities in the master realm should be 0 for the user
      t.equal(listOfIdentities.length, 0, 'There should be 0 federated identities for the user');
    });
  });
});

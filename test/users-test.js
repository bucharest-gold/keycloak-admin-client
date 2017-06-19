'use strict';

const test = require('blue-tape');
const keycloakAdminClient = require('../index');
const kcSetupForTests = require('../scripts/kc-setup-for-tests.json');

const _ = require('./sleep');

const settings = {
  baseUrl: 'http://127.0.0.1:8080/auth',
  username: 'admin',
  password: 'admin',
  grant_type: 'password',
  client_id: 'admin-cli'
};

test('Test getting the list of users for a Realm', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    t.equal(typeof client.users.find, 'function', 'The client object returned should have a users function');

    // Use the master realm
    const realmName = 'master';

    return client.users.find(realmName).then((listOfUsers) => {
      // The listOfUsers should be an Array
      t.equal(listOfUsers instanceof Array, true, 'the list of users should be an array');

      // The list of users in the master realm should have 4 people
      t.equal(listOfUsers.length, 4, 'There should be 4 users in master');
      t.equal(listOfUsers[0].username, 'admin', 'The first username should be the admin user');
    });
  });
});

test('Test getting the list of users for a Realm that doesn\'t exist', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    // Use the master realm
    const realmName = 'notarealrealm';

    return t.shouldFail(client.users.find(realmName), 'Realm not found.', 'Realm not found should be returned if the realm wasn\'t found');
  });
});

test('Test getting the one user for a Realm', (t) => {
  _.sleep(5000);
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    // Use the master realm
    const realmName = 'master';
    const userId = 'f9ea108b-a748-435f-9058-dab46ce59771'; // This is the admin user id from /scripts/kc-setup-for-tests.json

    return client.users.find(realmName, {userId: userId}).then((user) => {
      t.equal(user.id, userId, 'The userId we used and the one returned should be the same');
      t.equal(user.username, 'admin', 'The username returned should be admin');
    });
  });
});

test('Test getting the users role mappins', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    // Use the master realm
    const realmName = 'master';
    const userId = 'f9ea108b-a748-435f-9058-dab46ce59771'; // This is the admin user id from /scripts/kc-setup-for-tests.json

    return client.users.roleMappings.find(realmName, userId).then((roleMappings) => {
      t.equal(roleMappings.realmMappings[0].name, 'offline_access', 'Realm role "offline_access" should be present');
      t.equal(roleMappings.realmMappings[1].name, 'admin', 'Realm role "admin" should be present');
      t.equal(roleMappings.clientMappings.account.mappings[0].name, 'view-profile', 'Client role "view-profile" for client "account" should be present');
      t.equal(roleMappings.clientMappings.account.mappings[1].name, 'manage-account', 'Client role "manage-account" for client "account" should be present');
    });
  });
});

test('Test getting the users role mappins - userId doesn\'t exist', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    // Use the master realm
    const realmName = 'master';
    const userId = 'not-an-id'; // This is the admin user id from /scripts/kc-setup-for-tests.json

    return t.shouldFail(client.users.roleMappings.find(realmName, userId), 'User not found', 'A User not found error should be thrown');
  });
});

test('Test getting the one user for a Realm - userId doesn\'t exist', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    // Use the master realm
    const realmName = 'master';
    const userId = 'not-an-id';

    return t.shouldFail(client.users.find(realmName, {userId: userId}), 'User not found', 'A User not found error should be thrown');
  });
});

test('Test update a users info', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    t.equal(typeof client.users.update, 'function', 'The client object returned should have a update function');
    // Use the master realm
    const realmName = 'master';
    const testUser = Object.assign({}, kcSetupForTests[0].users.find((user) => {
      return user.id === '3ff724a6-90a8-4050-9981-4a6def74870a';
    })); // This is the test1 user id from /scripts/kc-setup-for-tests.json

    // just making sure we have the correct thing
    t.equal(testUser.id, '3ff724a6-90a8-4050-9981-4a6def74870a', 'The userId should be the one we want');
    t.equal(testUser.firstName, 'Test User 1', 'The firstName returned should be Test User 1');

    // Update the test user
    testUser.firstName = 'Test User 1 is my first name';
    testUser.lastName = 'This is my last name';

    return client.users.update(realmName, testUser).then(() => {
      // The update doesn't return anything so we need to go get what we just updated
      return client.users.find(realmName, {userId: testUser.id});
    }).then((user) => {
      t.equal(user.firstName, testUser.firstName, 'The firstName returned should be Test User 1 is my first name');
      t.equal(user.lastName, testUser.lastName, 'The lastName returned should be This is my last name');
    });
  });
});

test('Test update a users info - same username error', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    // Use the master realm
    const realmName = 'master';
    const testUser = Object.assign({}, kcSetupForTests[0].users.filter((user) => {
      return user.id === '3ff724a6-90a8-4050-9981-4a6def74870a';
    })[0]); // This is the test1 user id from /scripts/kc-setup-for-tests.json

    // just making sure we have the correct thing
    t.equal(testUser.id, '3ff724a6-90a8-4050-9981-4a6def74870a', 'The userId should be the one we want');

    // Change the user id to the admin user id, this will create an error since the username/email already exists
    testUser.id = 'f9ea108b-a748-435f-9058-dab46ce59771';

    return client.users.update(realmName, testUser).catch((err) => {
      t.equal(err.errorMessage, 'User exists with same username or email', 'Should return an error message');
    });
  });
});

test('Test update a users info - update a user that does not exist', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    // Use the master realm
    const realmName = 'master';
    const testUser = Object.assign(kcSetupForTests[0].users.filter((user) => {
      return user.id === '3ff724a6-90a8-4050-9981-4a6def74870a';
    })[0]); // This is the test1 user id from /scripts/kc-setup-for-tests.json

    // just making sure we have the correct thing
    t.equal(testUser.id, '3ff724a6-90a8-4050-9981-4a6def74870a', 'The userId should be the one we want');

    // Change the user id to something that doesn't exist
    testUser.id = 'f9ea108b-a748-435f-9058-dab46ce5977-not-real';

    return t.shouldFail(client.users.update(realmName, testUser), 'User not found', 'Should return an error that no user is found');
  });
});

test('Test delete a user', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    t.equal(typeof client.users.remove, 'function', 'The client object returned should have a deleteUser function');

    // Use the master realm
    const realmName = 'Test Realm 1';
    const userId = '677e99fd-b854-479f-afa6-74f295052770';

    return client.users.remove(realmName, userId);
  });
});

test('Test delete a user that doesn\'t exist', (t) => {
  const kca = keycloakAdminClient(settings);

  const userId = 'not-a-real-id';
  const realmName = 'master';
  return kca.then((client) => {
    // Call the deleteRealm api to remove this realm
    return t.shouldFail(client.users.remove(realmName, userId), 'User not found', 'Should return an error that no user is found');
  });
});

test('Test listing groups of user', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    t.equal(typeof client.users.groups.find, 'function', 'The client object returned should have a users function');

    // Use the master realm
    const realmName = 'master';
    const userId = 'f9ea108b-a748-435f-9058-dab46ce59771';

    return client.users.groups.find(realmName, userId).then((listOfGroups) => {
      // The listOfGroups should be an Array
      t.equal(listOfGroups instanceof Array, true, 'the list of groups should be an array');

      // The list of users in the master realm should have 4 people
      t.equal(listOfGroups.length, 1, 'User should have one group');
      t.equal(listOfGroups[0].name, 'Test group 1', 'The name of the group should be Test group 1');
    });
  });
});

test('Test reset password of user', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    t.equal(typeof client.users.resetPassword, 'function', 'The client object returned should have a resetPassword function');

    // Use the master realm
    const realmName = 'master';
    const userId = 'f9ea108b-a748-435f-9058-dab46ce59771';
    const password = 'newPassword';

    return client.users.resetPassword(realmName, userId, {
      temporary: true,
      value: password
    });
  });
});

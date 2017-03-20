'use strict';

const test = require('tape');
const keycloakAdminClient = require('../index');
const kcSetupForTests = require('../scripts/kc-setup-for-tests.json');

const settings = {
  baseUrl: 'http://127.0.0.1:8080/auth',
  username: 'admin',
  password: 'admin',
  grant_type: 'password',
  client_id: 'admin-cli'
};

test('Test getting the list of users for a Realm', (t) => {
  const kca = keycloakAdminClient(settings);

  kca.then((client) => {
    t.equal(typeof client.users.find, 'function', 'The client object returned should have a users function');

    // Use the master realm
    const realmName = 'master';

    client.users.find(realmName).then((listOfUsers) => {
      // The listOfUsers should be an Array
      t.equal(listOfUsers instanceof Array, true, 'the list of users should be an array');

      // The list of users in the master realm should have 4 people
      t.equal(listOfUsers.length, 4, 'There should be 4 users in master');
      t.equal(listOfUsers[0].username, 'admin', 'The first username should be the admin user');
      t.end();
    });
  });
});

test('Test getting the list of users for a Realm that doesn\'t exist', (t) => {
  const kca = keycloakAdminClient(settings);

  kca.then((client) => {
    // Use the master realm
    const realmName = 'notarealrealm';

    client.users.find(realmName).catch((err) => {
      t.equal(err.statusCode, 404, 'Realm not found should be returned if the realm wasn\'t found');
      t.end();
    });
  });
});

test('Test getting the one user for a Realm', (t) => {
  const kca = keycloakAdminClient(settings);

  kca.then((client) => {
    // Use the master realm
    const realmName = 'master';
    const userId = 'f9ea108b-a748-435f-9058-dab46ce59771'; // This is the admin user id from /scripts/kc-setup-for-tests.json

    client.users.find(realmName, {userId: userId}).then((user) => {
      t.equal(user.id, userId, 'The userId we used and the one returned should be the same');
      t.equal(user.username, 'admin', 'The username returned should be admin');
      t.end();
    });
  });
});

test('Test getting the one user for a Realm - userId doesn\'t exist', (t) => {
  const kca = keycloakAdminClient(settings);

  kca.then((client) => {
    // Use the master realm
    const realmName = 'master';
    const userId = 'not-an-id';

    client.users.find(realmName, {userId: userId}).catch((err) => {
      t.equal(err.statusCode, 404, 'A User not found error should be thrown');
      t.end();
    });
  });
});

test('Test update a users info', (t) => {
  const kca = keycloakAdminClient(settings);

  kca.then((client) => {
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

    client.users.update(realmName, testUser).then(() => {
      // The update doesn't return anything so we need to go get what we just updated
      return client.users.find(realmName, {userId: testUser.id});
    }).then((user) => {
      t.equal(user.firstName, testUser.firstName, 'The firstName returned should be Test User 1 is my first name');
      t.equal(user.lastName, testUser.lastName, 'The lastName returned should be This is my last name');
      t.end();
    });
  });
});

test('Test update a users info - same username error', (t) => {
  const kca = keycloakAdminClient(settings);

  kca.then((client) => {
    // Use the master realm
    const realmName = 'master';
    const testUser = Object.assign({}, kcSetupForTests[0].users.filter((user) => {
      return user.id === '3ff724a6-90a8-4050-9981-4a6def74870a';
    })[0]); // This is the test1 user id from /scripts/kc-setup-for-tests.json

    // just making sure we have the correct thing
    t.equal(testUser.id, '3ff724a6-90a8-4050-9981-4a6def74870a', 'The userId should be the one we want');

    // Change the user id to the admin user id, this will create an error since the username/email already exists
    testUser.id = 'f9ea108b-a748-435f-9058-dab46ce59771';

    client.users.update(realmName, testUser).catch((err) => {
      t.equal(err.statusCode, 409, 'Should return an error message');
      t.end();
    });
  });
});

test('Test update a users info - update a user that does not exist', (t) => {
  const kca = keycloakAdminClient(settings);

  kca.then((client) => {
    // Use the master realm
    const realmName = 'master';
    const testUser = Object.assign(kcSetupForTests[0].users.filter((user) => {
      return user.id === '3ff724a6-90a8-4050-9981-4a6def74870a';
    })[0]); // This is the test1 user id from /scripts/kc-setup-for-tests.json

    // just making sure we have the correct thing
    t.equal(testUser.id, '3ff724a6-90a8-4050-9981-4a6def74870a', 'The userId should be the one we want');

    // Change the user id to something that doesn't exist
    testUser.id = 'f9ea108b-a748-435f-9058-dab46ce5977-not-real';

    client.users.update(realmName, testUser).catch((err) => {
      t.equal(err.statusCode, 404, 'Should return an error that no user is found');
      t.end();
    });
  });
});

test('Test delete a user', (t) => {
  const kca = keycloakAdminClient(settings);

  kca.then((client) => {
    t.equal(typeof client.users.remove, 'function', 'The client object returned should have a deleteUser function');

    // Use the master realm
    const realmName = 'Test Realm 1';
    const userId = '677e99fd-b854-479f-afa6-74f295052770';

    client.users.remove(realmName, userId).then(() => {
      t.end();
    });

    client.users.find(realmName, {userId: userId}).catch((err) => {
      t.equal(err.statusCode, 404, 'A User not found error should be thrown');
      t.end();
    });
  });
});

test('Test delete a user that doesn\'t exist', (t) => {
  const kca = keycloakAdminClient(settings);

  const userId = 'not-a-real-id';
  const realmName = 'master';
  kca.then((client) => {
    // Call the deleteRealm api to remove this realm
    client.users.remove(realmName, userId).catch((err) => {
      t.equal(err.statusCode, 404, 'Should return an error that no user is found');
      t.end();
    });
  });
});

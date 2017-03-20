'use strict';

const test = require('tape');
const keycloakAdminClient = require('../index');

const settings = {
  baseUrl: 'http://127.0.0.1:8080/auth',
  username: 'admin',
  password: 'admin',
  grant_type: 'password',
  client_id: 'admin-cli'
};

test('Test getting the list of Realms', (t) => {
  const kca = keycloakAdminClient(settings);

  kca.then((client) => {
    t.equal(typeof client.realms.find, 'function', 'The client object returned should have a realms.find function');

    client.realms.find().then((listOfRealms) => {
      // The listOfRealms should be an Array
      t.equal(listOfRealms instanceof Array, true, 'the list of realms should be an array');

      // There should be a master realm and it should be the first in the list.
      t.equal(listOfRealms[0].realm, 'master', 'The realm should be named master');
      t.end();
    });
  });
});

test('Top-Level Realm Test - Test getting the just the Master Realm', (t) => {
  const kca = keycloakAdminClient(settings);

  kca.then((client) => {
    // Realm takes the Realms name *not* the Realm Id
    client.realms.find('master').then((realm) => {
      // The realm reutned should be an object and be the master realm
      t.equal(realm instanceof Object, true, 'the list of realms should be an array');
      t.equal(realm.realm, 'master', 'The realm should be named master');
      t.end();
    });
  });
});

test('Top-Level Realm Test - wrong realm name should through an error', (t) => {
  const kca = keycloakAdminClient(settings);

  kca.then((client) => {
    // Realm takes the Realms name *not* the Realm Id
    client.realms.find('notmaster').catch((err) => {
      t.equal(err.statusCode, 404, 'Realm not found should be returned if the realm wasn\'t found');
      t.end();
    });
  });
});

test('Test create a realm - just using a realm name', (t) => {
  const kca = keycloakAdminClient(settings);

  // A minimal JSON representation of a realm,  just using the name property
  const realmToAdd = {
    realm: 'testRealm'
  };

  kca.then((client) => {
    t.equal(typeof client.realms.create, 'function', 'The client object returned should have a create function');

    client.realms.create(realmToAdd).then((addedRealm) => {
      // The .realms.create Endpoint does not return anything in the body.
      // But our api "fakes it" by calling the client.realm(realm) function after a succesfull create.
      t.equal(addedRealm.realm, realmToAdd.realm, 'The realm should be named ' + realmToAdd.realm);

      // clean up the realm we just added. This is only really needed when running tests locally.
      // remove is tested later on
      // TODO: find a better way
      client.realms.remove(realmToAdd.realm);
      t.end();
    });
  });
});

test('Test create a realm - a not unique name', (t) => {
  const kca = keycloakAdminClient(settings);

  // A minimal JSON representation of a realm,  just using the name property
  const realmToAdd = {
    realm: 'master'
  };

  kca.then((client) => {
    client.realms.create(realmToAdd).catch((err) => {
      t.equal(err.statusCode, 409, 'Error message should be returned when using a non-unique realm name');
      t.end();
    });
  });
});

test('Test delete a realm', (t) => {
  const kca = keycloakAdminClient(settings);

  // First we need to create a realm to delete
  // A minimal JSON representation of a realm,  just using the name property
  const realmToAdd = {
    realm: 'testRealmForDeleting'
  };

  kca.then((client) => {
    client.realms.create(realmToAdd).then((addedRealm) => {
      // just a quick quick that the realm is there
      t.equal(addedRealm.realm, realmToAdd.realm, 'The realm should be named ' + realmToAdd.realm);

      // Call the remove api to remove this realm
      client.realms.remove(realmToAdd.realm).then(() => {
        // There is no return value on a delete
        t.end();
      });
    });
  });
});

test('Test delete a realm that doesn\'t exist', (t) => {
  const kca = keycloakAdminClient(settings);

  // A minimal JSON representation of a realm,  just using the name property, This realm shouldn't exist
  const realmToAdd = {
    realm: 'testRealmThatDoesntExist'
  };

  kca.then((client) => {
    // Call the realms.remove api to remove this realm
    client.realms.remove(realmToAdd.realm).catch((err) => {
      t.equal(err.statusCode, 404, 'Realm not found should be returned if the realm wasn\'t found to delete');
      t.end();
    });
  });
});

test('Test update a realm', (t) => {
  const kca = keycloakAdminClient(settings);

  // First we need to create a realm to update
  // A minimal JSON representation of a realm,  just using the name property
  const realmToAdd = {
    realm: 'testRealmForUpdating'
  };

  kca.then((client) => {
    client.realms.create(realmToAdd).then((addedRealm) => {
      // just a quick quick that the realm is there
      t.equal(addedRealm.realm, realmToAdd.realm, 'The realm should be named ' + realmToAdd.realm);
      t.equal(addedRealm.enabled, false, 'initial enabled is false');

      // Update a property in the realm we just created
      addedRealm.enabled = true;
      // Call the realms.update api to update just the realm
      client.realms.update(realmToAdd.realm, addedRealm).then(() => {
        // There is no return value on an update
        // Get the realm we just updated to test
        return client.realms.find(realmToAdd.realm);
      }).then((realm) => {
        t.equal(realm.enabled, addedRealm.enabled, 'the value we updated should\'ve been updated');

        // clean up the realm we just added. This is only really needed when running tests locally.
        // realms.remove is tested later on
        // TODO: find a better way
        client.realms.remove(realmToAdd.realm);
        t.end();
      });
    });
  });
});

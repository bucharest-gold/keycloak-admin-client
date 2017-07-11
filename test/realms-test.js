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

test('Test getting the list of Realms', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    t.equal(typeof client.realms.find, 'function', 'The client object returned should have a realms.find function');

    return client.realms.find().then((listOfRealms) => {
      // The listOfRealms should be an Array
      t.equal(listOfRealms instanceof Array, true, 'the list of realms should be an array');

      // There should be a master realm and it should be the first in the list.
      t.equal(listOfRealms[0].realm, 'master', 'The realm should be named master');
    });
  });
});

test('Top-Level Realm Test - Test getting the just the Master Realm', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    // Realm takes the Realms name *not* the Realm Id
    return client.realms.find('master').then((realm) => {
      // The realm reutned should be an object and be the master realm
      t.equal(realm instanceof Object, true, 'the list of realms should be an array');
      t.equal(realm.realm, 'master', 'The realm should be named master');
    });
  });
});

test('Top-Level Realm Test - wrong realm name should through an error', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    // Realm takes the Realms name *not* the Realm Id
    return t.shouldFail(client.realms.find('notmaster'), 'Realm not found.', 'Realm not found should be returned if the realm wasn\'t found');
  });
});

test('Test create a realm - just using a realm name', (t) => {
  const kca = keycloakAdminClient(settings);

  // A minimal JSON representation of a realm,  just using the name property
  const realmToAdd = {
    realm: 'testRealm'
  };

  return kca.then((client) => {
    t.equal(typeof client.realms.create, 'function', 'The client object returned should have a create function');

    return client.realms.create(realmToAdd).then((addedRealm) => {
      // The .realms.create Endpoint does not return anything in the body.
      // But our api "fakes it" by calling the client.realm(realm) function after a succesfull create.
      t.equal(addedRealm.realm, realmToAdd.realm, `The realm should be named ${realmToAdd.realm}`);

      // clean up the realm we just added. This is only really needed when running tests locally.
      // remove is tested later on
      // TODO: find a better way
      client.realms.remove(realmToAdd.realm);
    });
  });
});

// test('Test create a realm - a not unique name', (t) => {
//   const kca = keycloakAdminClient(settings);

//   // A minimal JSON representation of a realm,  just using the name property
//   const realmToAdd = {
//     realm: 'master'
//   };

//   return kca.then((client) => {
//     return t.shouldFail(client.realms.create(realmToAdd), 'Realm with same name exists', 'Error message should be returned when using a non-unique realm name');
//   });
// });

test('Test delete a realm', (t) => {
  const kca = keycloakAdminClient(settings);

  // First we need to create a realm to delete
  // A minimal JSON representation of a realm,  just using the name property
  const realmToAdd = {
    realm: 'testRealmForDeleting'
  };

  return kca.then((client) => {
    return client.realms.create(realmToAdd).then((addedRealm) => {
      // just a quick quick that the realm is there
      t.equal(addedRealm.realm, realmToAdd.realm, `The realm should be named ${realmToAdd.realm}`);

      // Call the remove api to remove this realm
      return client.realms.remove(realmToAdd.realm);
    });
  });
});

// test('Test delete a realm that doesn\'t exist', (t) => {
//   const kca = keycloakAdminClient(settings);

//   // A minimal JSON representation of a realm,  just using the name property, This realm shouldn't exist
//   const realmToAdd = {
//     realm: 'testRealmThatDoesntExist'
//   };

//   return kca.then((client) => {
//     // Call the realms.remove api to remove this realm
//     return t.shouldFail(client.realms.remove(realmToAdd.realm), 'Realm not found.', 'Realm not found should be returned if the realm wasn\'t found to delete');
//   });
// });

// test('Test update a realm', (t) => {
//   const kca = keycloakAdminClient(settings);

//   // First we need to create a realm to update
//   // A minimal JSON representation of a realm,  just using the name property
//   const realmToAdd = {
//     realm: 'testRealmForUpdating'
//   };

//   return kca.then((client) => {
//     return client.realms.create(realmToAdd).then((addedRealm) => {
//       // just a quick quick that the realm is there
//       t.equal(addedRealm.realm, realmToAdd.realm, `The realm should be named ${realmToAdd.realm}`);
//       t.equal(addedRealm.enabled, false, 'initial enabled is false');

//       // Update a property in the realm we just created
//       addedRealm.enabled = true;
//       // Call the realms.update api to update just the realm
//       return client.realms.update(realmToAdd.realm, addedRealm).then(() => {
//         // There is no return value on an update
//         // Get the realm we just updated to test
//         return client.realms.find(realmToAdd.realm);
//       }).then((realm) => {
//         t.equal(realm.enabled, addedRealm.enabled, 'the value we updated should\'ve been updated');

//         // clean up the realm we just added. This is only really needed when running tests locally.
//         // realms.remove is tested later on
//         // TODO: find a better way
//         return client.realms.remove(realmToAdd.realm);
//       });
//     });
//   });
// });

// test("Test getting realm's roles", (t) => {
//   const kca = keycloakAdminClient(settings);

//   return kca.then((client) => {
//     // Use the master realm
//     const realmName = 'master';

//     return client.realms.roles.find(realmName).then((roles) => {
//       t.equal(roles.length, 4, 'Should return 4 roles');

//       const expectedRole = {
//         id: 'e2892f14-c143-4b65-a3d3-7014c6270d7b',
//         name: 'offline_access',
//         description: `\${role_offline-access}`,
//         scopeParamRequired: true,
//         composite: false,
//         clientRole: false,
//         containerId: 'master'
//       };
//       t.deepEqual(roles.find((r) => r.id === expectedRole.id), expectedRole, 'Should have the offline_access role');
//     });
//   });
// });

// test("Test getting a realm's role", (t) => {
//   const kca = keycloakAdminClient(settings);

//   return kca.then((client) => {
//     // Use the master realm
//     const realmName = 'master';
//     const roleName = 'offline_access';

//     return client.realms.roles.find(realmName, roleName).then((role) => {
//       const expectedRole = {
//         id: 'e2892f14-c143-4b65-a3d3-7014c6270d7b',
//         name: 'offline_access',
//         description: `\${role_offline-access}`,
//         scopeParamRequired: true,
//         composite: false,
//         clientRole: false,
//         containerId: 'master'
//       };
//       t.deepEqual(role, expectedRole, 'Should return the offline_access role');
//     });
//   });
// });

// test("Test getting a realms's role - realm doesn't exist", (t) => {
//   const kca = keycloakAdminClient(settings);

//   const realmName = 'not-a-valid-realm';
//   const roleName = 'not-a-real-role-name';
//   return kca.then((client) => {
//     return t.shouldFail(client.realms.roles.find(realmName, roleName), 'Could not find realm', 'Should return an error that no realm is found');
//   });
// });

// test("Test getting a realms's role - role name doesn't exist", (t) => {
//   const kca = keycloakAdminClient(settings);

//   const realmName = 'master';
//   const roleName = 'not-a-real-role-name';
//   return kca.then((client) => {
//     return t.shouldFail(client.realms.roles.find(realmName, roleName), 'Could not find role', 'Should return an error that no role is found');
//   });
// });

// test("Test create a realm's role", (t) => {
//   const kca = keycloakAdminClient(settings);

//   return kca.then((client) => {
//     const realmName = 'master';
//     const newRole = {
//       name: 'my-new-role',
//       description: 'A new role'
//     };

//     return client.realms.roles.create(realmName, newRole).then((addedRole) => {
//       t.equal(addedRole.name, newRole.name, `The name should be named ${newRole.name}`);
//       t.equal(addedRole.description, newRole.description, `The description should be named ${newRole.description}`);
//     });
//   });
// });

// test("Test create a realm's role - realm doesn't exist", (t) => {
//   const kca = keycloakAdminClient(settings);

//   return kca.then((client) => {
//     const realmName = 'not-a-valid-realm';
//     const newRole = {
//       name: 'my-new-role',
//       description: 'A new role'
//     };

//     return kca.then((client) => {
//       return t.shouldFail(client.realms.roles.create(realmName, newRole), 'Could not find realm', 'Should return an error that no realm is found');
//     });
//   });
// });

// test("Test create a realm's role - a non-unique role name", (t) => {
//   const kca = keycloakAdminClient(settings);

//   return kca.then((client) => {
//     const realmName = 'master';
//     const newRole = {
//       name: 'offline_access'
//     };

//     return kca.then((client) => {
//       return t.shouldFail(client.realms.roles.create(realmName, newRole), `Role ${newRole.name} already exists`, 'Error message should be returned when using a non-unique role name');
//     });
//   });
// });

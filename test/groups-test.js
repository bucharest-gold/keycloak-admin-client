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

test('Test getting the list of groups for a Realm', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    t.equal(typeof client.groups.find, 'function', 'The client object returned should have a groups function');

    // Use the master realm
    const realmName = 'master';

    return client.groups.find(realmName).then((listOfGroups) => {
      // The listOfUsers should be an Array
      t.equal(listOfGroups instanceof Array, true, 'the list of groups should be an array');

      // The list of groups in the master realm should have 2
      t.equal(listOfGroups.length, 2, 'There should be 2 groups in master');

      // List is returned in random order, so we sort to it make tests stable
      listOfGroups.sort((group1, group2) => {
        return group1.name - group2.name;
      });

      t.equal(listOfGroups[0].name, 'Test group 1', 'The name of the first group should be Test group 1');
      t.equal(listOfGroups[1].path, '/Test group 2', 'The path of the second group should be /Test group 2');
    });
  });
});

test('Test getting the list of group members from Test group 1 for a Realm', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    t.equal(typeof client.groups.members.find, 'function', 'The client object returned should have a groups.members function');

    // Use the master realm
    const realmName = 'master';
    // First groups id
    const groupId = '5a54a050-1b9d-4cfa-bf7f-048dd0ba7135';

    return client.groups.members.find(realmName, groupId).then((listOfMembers) => {
      // The listOfUsers should be an Array
      t.equal(listOfMembers instanceof Array, true, 'the list of groups should be an array');

      // The list of groups in the master realm should have 2
      t.equal(listOfMembers.length, 1, 'There should be 1 member in the group');
      t.equal(listOfMembers[0].username, 'admin', 'The username of the member should be admin');
    });
  });
});

test('Test getting the one group for a Realm', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    // Use the master realm
    const realmName = 'master';
    const id = '5a54a050-1b9d-4cfa-bf7f-048dd0ba7135'; // This is the test group id from /scripts/kc-setup-for-tests.json

    return client.groups.find(realmName, {id}).then((group) => {
      t.equal(group.id, id, 'The group id we used and the one returned should be the same');
    });
  });
});

test('Test create a Group', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    t.equal(typeof client.groups.create, 'function', 'The client object returned should have a create function');

    // Use the master realm
    const realmName = 'master';
    const newGroup = {
      name: 'group-test'
    };

    return client.groups.create(realmName, newGroup)
      .then(group => {
        t.equal(group.name, newGroup.name, 'The group name we used and the one returned should be the same');
      })
      .catch((err) => {
        t.equal(err.errorMessage, 'Client group-test already exists', 'Error message should be returned when using a non-unique name');
      });
  });
});

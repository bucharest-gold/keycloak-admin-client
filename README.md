### Keycloak Admin Client

[![Greenkeeper badge](https://badges.greenkeeper.io/bucharest-gold/keycloak-admin-client.svg)](https://greenkeeper.io/)

[![Coverage Status](https://coveralls.io/repos/github/bucharest-gold/keycloak-admin-client/badge.svg)](https://coveralls.io/github/bucharest-gold/keycloak-admin-client)
[![Build Status](https://travis-ci.org/bucharest-gold/keycloak-admin-client.svg?branch=master)](https://travis-ci.org/bucharest-gold/keycloak-admin-client)
[![Known Vulnerabilities](https://snyk.io/test/npm/keycloak-admin-client/badge.svg)](https://snyk.io/test/npm/keycloak-admin-client)
[![dependencies Status](https://david-dm.org/bucharest-gold/keycloak-admin-client/status.svg)](https://david-dm.org/bucharest-gold/keycloak-admin-client)

[![NPM](https://nodei.co/npm/keycloak-admin-client.png)](https://npmjs.org/package/keycloak-admin-client)

An _Extremely Experimental_ client for connecting to the Keycloak Admin REST API - http://keycloak.github.io/docs/rest-api/index.html

|                 | Project Info  |
| --------------- | ------------- |
| License:        | Apache-2.0 |
| Build:          | make |
| Documentation:  | http://bucharest-gold.github.io/keycloak-admin-client/ |
| Issue tracker:  | https://github.com/bucharest-gold/keycloak-admin-client/issues |
| Engines:        | Node.js 4.x, 6.x, 8.x |

## Installation

```
npm install keycloak-admin-client -S
```

## Usage

```js
'use strict';

let adminClient = require('./');

let settings = {
  baseUrl: 'http://127.0.0.1:8080/auth',
  username: 'admin',
  password: 'admin',
  grant_type: 'password',
  client_id: 'admin-cli'
};

adminClient(settings)
  .then((client) => {
  console.log('client', client);
  client.realms.find()
    .then((realms) => {
    console.log('realms', realms);
    });
  })
  .catch((err) => {
    console.log('Error', err);
  });
```

## Development & Testing

To run the tests, you'll need to have a keycloak server running. No worries!
This is all taken care of for you. Just run `./scripts/start-server.sh`.
If you don't already have a server downloaded, this script will download one
for you, start it, initialize the admin user, and then restart.

Then just run the tests.

```
make test
```

To stop the server, run `./scripts/stop-server.sh`.


### Notable Changes from 0.1.0 to 0.2.0

The API has been changed to logically group up(namespace) functionality.

For example,  the 0.1.0 way of getting a list of all realms was by calling the `client.realms` function.

Now in 0.2.0, you would do something like this: `client.realms.find`

`find` can also be used to get 1 realm by passing in the realmName: `client.realms.find('master')`

The other methods have been renamed too, for example, instead of calling `client.updateRealm` you would now call `client.realms.update`

### Other

The current RFC is located here: https://github.com/bucharest-gold/entente/blob/master/rfcs/keycloak-admin-rest-api-node-client.md

## Contributing

Please read the [contributing guide](./CONTRIBUTING.md)

var request = require('request');

var url = '/realms/master/protocol/openid-connect/token';
var baseUrl = 'http://192.168.99.100:8080/auth';

var config = {
  username: 'admin',
  password: 'admin',
  grant_type: 'password',
  client_id: 'admin-cli'
};

// First We need a token
request.post({url: baseUrl + url, form: config}, function (err, resp, body) {
  if (err) {
    console.log(err);
    return;
  }

  var jsonBody = JSON.parse(body);
  var accessToken = jsonBody.access_token;

  var auth = {
    bearer: accessToken
  };

  request({
    url: `${baseUrl}/admin/realms`,
    auth: auth
  }, function (err, response, body) {
    if (err) {
      console.log(err);
      return;
    }

    var realms = JSON.parse(body);

    console.log('Got All Realms', realms);

    request({
      url: `${baseUrl}/admin/realms/${realms[0].realm}`,
      auth: auth
    }, function (err, response, body) {
      if (err) {
        console.log(err);
        return;
      }

      console.log('Got First Realm', JSON.parse(body));
    });
  });
});

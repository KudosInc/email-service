const https = require('https');

const successCodes = [200, 201, 202];

const compileResponse = (data) => {
  try {
    return JSON.parse(data.join(','));
  } catch (e) {
    return data.join(',');
  }
};

const callback = (res, resolve, reject) => {
  const data = [];
  res.setEncoding('utf8');
  res.on('data', (response) => data.push(response));
  res.on('error', reject);
  res.on('end', () => {
    if (successCodes.includes(res.statusCode)) {
      resolve(compileResponse(data));
    } else {
      reject(compileResponse(data));
    }
  });
};

const get = ({ headers, uri }) => new Promise((resolve, reject) => {
  const req = https.request(uri, { headers, method: 'GET' }, (res) => callback(res, resolve, reject));
  req.on('error', reject);
  req.end();
});

const post = ({ headers, uri, body }) => new Promise((resolve, reject) => {
  const req = https.request(uri, { headers, method: 'POST' }, (res) => callback(res, resolve, reject));
  req.on('error', reject);
  req.write(JSON.stringify(body));
  req.end();
});

module.exports = { get, post };

const https = require('https');

const callback = (res, resolve, reject) => {
  const buffers = [];
  res.setEncoding('utf8');
  res.on('data', (buffer) => buffers.push(buffer));
  res.on('error', reject);
  res.on('end', () => {
    if (res.statusCode === 200) {
      resolve(Buffer.concat(buffers));
    } else {
      reject(Buffer.concat(buffers));
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

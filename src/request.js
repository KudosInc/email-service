const get = ({ headers, uri }) => {
  return new Promise((resolve, reject) => {
    const req = http.request(uri, { headers, method: 'GET' }, (res) => {
      const buffers = [];
      res.on('data', (buffer) => buffers.push(buffer));
      res.on('error', reject);
      res.on('end', () => res.statusCode === 200 
          ? resolve(Buffer.concat(buffers))
          : reject(Buffer.concat(buffers)));
    });
    req.on('error', reject);
    req.end();
  });
};

const post = ({ headers, uri, body }) => {
  return new Promise((resolve, reject) => {
    const req = http.request(uri, { headers, method: 'POST' }, (res) => {
      const buffers = [];
      res.on('data', (buffer) => buffers.push(buffer));
      res.on('error', reject);
      res.on('end', () => res.statusCode === 200 
          ? resolve(Buffer.concat(buffers))
          : reject(Buffer.concat(buffers)));
    });
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
};

module.exports = { get, post };

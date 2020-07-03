const express = require('express');
const http = require('http');
const { processImage } = require('./processImage');

const app = express();

const getServerOptions = (method, path) => {
  return {
    host: 'localhost',
    port: 8000,
    path,
    method,
  };
};

let agentId;

const informWorkerFree = ({ id, tags }) => {
  const path = `/complete-job/${agentId}/${id}`;
  const options = getServerOptions('POST', path);

  const req = http.request(options, (res) => {});
  req.write(JSON.stringify(tags));
  req.end();
};

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.post('/process', (req, res) => {
  let data = '';

  req.on('data', (chunk) => (data += chunk));
  req.on('end', () => {
    const params = JSON.parse(data);
    processImage(params)
      .then((tags) => {
        res.end();
        return { id: params.id, tags };
      })
      .then(informWorkerFree);
  });
});

const main = (port, id) => {
  agentId = id;
  const PORT = port || 5000;
  app.listen(PORT, () => console.log(`Server Listening at ${PORT}`));
};

main(+process.argv[2], +process.argv[3]);

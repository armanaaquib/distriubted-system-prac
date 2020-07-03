const http = require('http');
const express = require('express');
const redis = require('redis');
const { processImage } = require('./processImage');
const imageSets = require('./imageSets');

const app = express();
const redisClient = redis.createClient({ db: 1 });

const getServerOptions = (method, path) => {
  return {
    host: 'localhost',
    port: 8000,
    path,
    method,
  };
};

let agentId;

const informWorkerFree = () => {
  const path = `/complete-job/${agentId}`;
  const options = getServerOptions('POST', path);
  const req = http.request(options);
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
    imageSets
      .get(redisClient, params.id)
      .then((imageSet) => processImage(imageSet))
      .then((tags) =>
        imageSets.completedProcessing(redisClient, params.id, tags)
      )
      .then(informWorkerFree);
  });

  res.end();
});

const main = (port, id) => {
  agentId = id;
  const PORT = port || 5000;
  app.listen(PORT, () => console.log(`Server Listening at ${PORT}`));
};

main(+process.argv[2], +process.argv[3]);

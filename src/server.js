const http = require('http');
const express = require('express');
const redis = require('redis');
const imageSets = require('./imageSets');

const redisClient = redis.createClient({ db: 1 });
const app = express();

const getQueueBrokerOptions = (method, path) => {
  return {
    host: 'localhost',
    port: 8001,
    path,
    method,
  };
};

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.post('/process/:user/:count/:width/:height/:tags', (req, res) => {
  imageSets.add(redisClient, req.params).then((job) => {
    res.end(`id:${job.id}\n`);

    const options = getQueueBrokerOptions('POST', `/queue-job/${job.id}`);
    const qbReq = http.request(options, (res) => {
      console.log('Got from queue broker', res.statusCode);
    });
    qbReq.end();
  });
});

app.get('/status/:id', (req, res) => {
  imageSets.get(redisClient, req.params.id).then((imageSet) => {
    res.end(JSON.stringify(imageSet));
  });
});

const main = () => {
  const PORT = 8000;
  app.listen(PORT, () => console.log(`Server Listening at ${PORT}`));
};

main();

const express = require('express');
const redis = require('redis');
const imageSets = require('./imageSets');

const redisClient = redis.createClient({ db: 1 });
const app = express();

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.post('/process/:user/:count/:width/:height/:tags', (req, res) => {
  imageSets.add(redisClient, req.params).then((job) => {
    res.end(`id:${job.id}\n`);
    redisClient.rpush('ipQueue', job.id);
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

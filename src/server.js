const express = require('express');
const redis = require('redis');
const imageSets = require('./imageSets');
const { Scheduler } = require('./scheduler');
const { Agent } = require('./agent');

const redisClient = redis.createClient({ db: 1 });
const app = express();

const getAgentOptions = (port) => {
  return {
    host: 'localhost',
    port,
    path: '/process',
    method: 'POST',
  };
};

const scheduler = new Scheduler();
scheduler.addAgent(new Agent(1, getAgentOptions(5000)));
scheduler.addAgent(new Agent(2, getAgentOptions(5001)));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.post('/process/:user/:count/:width/:height/:tags', (req, res) => {
  imageSets.add(redisClient, req.params).then((job) => {
    res.end(`id:${job.id}\n`);
    scheduler.schedule(job);
  });
});

app.post('/complete-job/:agentId', (req, res) => {
  scheduler.setAgentFree(+req.params.agentId);
  res.end();
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

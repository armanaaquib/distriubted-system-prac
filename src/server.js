const express = require('express');
const { ImageSets } = require('./imageSets');
const { Scheduler } = require('./scheduler');
const { Agent } = require('./agent');

const app = express();

const getAgentOptions = (port) => {
  return {
    host: 'localhost',
    port,
    path: '/process',
    method: 'POST',
  };
};

const imageSets = new ImageSets();
const scheduler = new Scheduler();
scheduler.addAgent(new Agent(1, getAgentOptions(5000)));
scheduler.addAgent(new Agent(2, getAgentOptions(5001)));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.post('/process/:user/:count/:width/:height/:tags', (req, res) => {
  const job = imageSets.add(req.params);
  res.end(`id:${job.id}\n`);
  scheduler.schedule(job);
});

app.post('/complete-job/:agentId/:id', (req, res) => {
  let data = '';
  req.on('data', (chunk) => (data += chunk));
  req.on('end', () => {
    const tags = JSON.parse(data);
    imageSets.completedProcess(req.params.id, tags);
    scheduler.setAgentFree(+req.params.agentId);
    res.end();
  });
});

app.get('/status/:id', (req, res) => {
  const imageSet = imageSets.get(req.params.id);
  res.end(JSON.stringify(imageSet));
});

const main = () => {
  const PORT = 8000;
  app.listen(PORT, () => console.log(`Server Listening at ${PORT}`));
};

main();

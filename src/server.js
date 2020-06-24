const express = require('express');
const { ImageSets } = require('./imageSets');
const { Scheduler } = require('./scheduler');

const app = express();
const imageSets = new ImageSets();
const scheduler = new Scheduler();
scheduler.start();

const PORT = 8000;

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.post('/process/:user/:count/:width/:height/:tags', (req, res) => {
  const job = imageSets.add(req.params);
  res.end(`id:${job.id}\n`);
  scheduler.schedule(job);
});

app.post('/complete-job/:id', (req, res) => {
  let data = '';
  req.on('data', (chunk) => (data += chunk));
  req.on('end', () => {
    const tags = JSON.parse(data);
    imageSets.completedProcess(req.params.id, tags);
    scheduler.setWorkerFree();
    res.end();
  });
});

app.get('/status/:id', (req, res) => {
  const imageSet = imageSets.get(req.params.id);
  res.end(JSON.stringify(imageSet));
});

app.listen(PORT, () => console.log(`Server Listening at ${PORT}`));

const express = require('express');
const http = require('http');

const app = express();
const PORT = 8000;

let id = 0;
let isWorkerFree = true;
const jobs = [];

const getWorkerOptions = (method, path) => {
  return {
    host: 'localhost',
    port: 5000,
    path,
    method,
  };
};

const delegateToWorker = (id, { count, width, height, tags }) => {
  const path = `/process/${id}/${count}/${width}/${height}/${tags}`;
  const options = getWorkerOptions('POST', path);

  const req = http.request(options, (res) => {
    console.log('Got from worker: ', res.statusCode);

    res.setEncoding('utf8');

    let tags = '';

    res.on('data', (chunk) => {
      tags += chunk;
    });

    res.on('data', () => {
      console.log(tags);
      isWorkerFree = true;
    });
  });

  isWorkerFree = false;
  req.end();
};

setInterval(() => {
  if (isWorkerFree && jobs.length > 0) {
    const job = jobs.shift();
    console.log('Scheduling job on worker: ', job.id);
    delegateToWorker(job.id, job.params);
  }
}, 1000);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.post('/process/:user/:count/:width/:height/:tags', (req, res) => {
  res.end(`id:${id}\n`);
  jobs.push({ id, params: req.params });
  id++;
});

app.listen(PORT, () => console.log(`Server Listening at ${PORT}`));

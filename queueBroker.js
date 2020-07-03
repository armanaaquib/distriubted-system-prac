const express = require('express');

const app = express();
const jobs = [];

app.get('/request-job', (req, res) => {
  let job = {};
  if (jobs.length > 0) {
    job = jobs.shift();
  }
  res.write(JSON.stringify(job));
  res.end();
});

app.post('/queue-job:id', (req, res) => {
  jobs.push({ id: req.params.id });
  res.end();
});

const main = () => {
  const PORT = 8001;
  app.listen(PORT, `QB: listening at ${PORT}`);
};

main();

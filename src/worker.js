const express = require('express');
const http = require('http');
const { processImage } = require('./processImage');

const app = express();
const PORT = 5000;

const getServerOptions = (method, path) => {
  return {
    host: 'localhost',
    port: 8000,
    path,
    method,
  };
};

const informWorkerFree = ({ id, tags }) => {
  const path = `/complete-job/${id}`;
  const options = getServerOptions('POST', path);

  const req = http.request(options, (res) => {});
  req.write(JSON.stringify(tags));
  req.end();
};

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.post('/process/:id/:count/:width/:height/:tags', (req, res) => {
  processImage(req.params)
    .then((tags) => {
      res.end();
      return { id: req.params.id, tags };
    })
    .then(informWorkerFree);
});

app.listen(PORT, () => console.log(`Server Listening at ${PORT}`));

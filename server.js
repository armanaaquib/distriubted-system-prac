const express = require('express');
const { processImage } = require('./processImage');

const app = express();
const PORT = 8000;

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.post('/process/:user/:count/:width/:height/:tags', (req, res) => {
  processImage(req.params).then((tags) => {
    res.write(JSON.stringify(tags));
    res.end();
  });
});

app.listen(PORT, () => console.log(`Server Listening at ${PORT}`));

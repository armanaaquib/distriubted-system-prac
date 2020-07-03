const http = require('http');
const redis = require('redis');
const { processImage } = require('./processImage');
const imageSets = require('./imageSets');

const redisClient = redis.createClient({ db: 1 });

const getServerOptions = (method, path) => {
  return {
    host: 'localhost',
    port: 8000,
    path,
    method,
  };
};

const getJob = () => {
  return new Promise((resolve, reject) => {
    const options = getServerOptions('GET', '/request-job');
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (JSON.parse(data).id) {
          resolve(data);
        } else {
          reject('no job');
        }
      });
    });
    req.end();
  });
};

const runLoop = () => {
  getJob()
    .then((data) => {
      console.log(data);
      const params = JSON.parse(data);
      imageSets
        .get(redisClient, params.id)
        .then((imageSet) => processImage(imageSet))
        .then((tags) =>
          imageSets.completedProcessing(redisClient, params.id, tags)
        )
        .then(runLoop);
    })
    .catch(() => {
      setTimeout(runLoop, 1000);
    });
};

runLoop();

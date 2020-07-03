const redis = require('redis');
const { processImage } = require('./processImage');
const imageSets = require('./imageSets');

const redisClient = redis.createClient({ db: 1 });

const getJob = () => {
  return new Promise((resolve, reject) => {
    redisClient.blpop('ipQueue', 1, (err, res) => {
      console.log('Got from QB', res);
      if (res) {
        resolve(res[1]);
      } else {
        reject('no job');
      }
    });
  });
};

const runLoop = () => {
  getJob()
    .then((id) => {
      imageSets
        .get(redisClient, id)
        .then((imageSet) => processImage(imageSet))
        .then((tags) => imageSets.completedProcessing(redisClient, id, tags))
        .then(runLoop);
    })
    .catch(runLoop);
};

runLoop();

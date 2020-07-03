const redis = require('redis');
const client = redis.createClient({ db: 1 });

const getCurrId = () => {
  return new Promise((resolve) => {
    client.incr('curr_id', (err, res) => {
      resolve(res);
    });
  });
};

const createJob = (id, imageSet) => {
  return new Promise((resolve) => {
    const status = ['status', 'scheduled'];
    const receivedAt = ['receivedAt', new Date()];

    client.hmset(`job_${id}`, status.concat(receivedAt), (err, res) => {
      resolve({ id, ...imageSet });
    });
  });
};

const add = (imageSet) => {
  return getCurrId().then((id) => createJob(id, imageSet));
};

const completedProcessing = (id, tags) => {
  const status = ['status', 'completed'];
  const tagsField = ['tags', JSON.stringify(tags)];

  client.hmset(`job_${id}`, status.concat(tagsField));
};

const get = (id) => {
  return new Promise((resolve) => {
    client.hgetall(`job_${id}`, (err, res) => {
      console.log(res);
      resolve(res);
    });
  });
};

module.exports = { add, completedProcessing, get };

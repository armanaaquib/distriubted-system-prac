const getCurrId = (client) => {
  return new Promise((resolve) => {
    client.incr('curr_id', (err, res) => {
      resolve(res);
    });
  });
};

const createJob = (client, id, imageSet) => {
  return new Promise((resolve) => {
    const status = ['status', 'scheduled'];
    const receivedAt = ['receivedAt', new Date()];
    const imageDetails = Object.keys(imageSet).reduce((list, key) => {
      return list.concat([key, imageSet[key]]);
    }, []);
    const jobDetails = imageDetails.concat(status, receivedAt);

    client.hmset(`job_${id}`, jobDetails, (err, res) => {
      resolve({ id });
    });
  });
};

const add = (client, imageSet) => {
  return getCurrId(client).then((id) => createJob(client, id, imageSet));
};

const completedProcessing = (client, id, tags) => {
  const status = ['status', 'completed'];
  const tagsField = ['tags', JSON.stringify(tags)];

  client.hmset(`job_${id}`, status.concat(tagsField));
};

const get = (client, id) => {
  return new Promise((resolve) => {
    client.hgetall(`job_${id}`, (err, res) => {
      resolve(res);
    });
  });
};

module.exports = { add, completedProcessing, get };

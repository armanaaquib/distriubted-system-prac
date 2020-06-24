const http = require('http');

const getWorkerOptions = (method, path) => {
  return {
    host: 'localhost',
    port: 5000,
    path,
    method,
  };
};

class Scheduler {
  constructor() {
    this.isWorkerFree = true;
    this.jobs = [];
  }

  schedule(job) {
    this.jobs.push(job);
  }

  delegateToWorker({ id, count, width, height, tags }) {
    const path = `/process/${id}/${count}/${width}/${height}/${tags}`;
    const options = getWorkerOptions('POST', path);

    const req = http.request(options, (res) => {
      console.log('Got from worker: ', res.statusCode);
    });
    req.end();
    this.isWorkerFree = false;
  }

  start() {
    setInterval(() => {
      if (this.isWorkerFree && this.jobs.length > 0) {
        const job = this.jobs.shift();
        console.log('Scheduling job on worker: ', job.id);
        this.delegateToWorker(job);
      }
    }, 1000);
  }

  setWorkerFree() {
    this.isWorkerFree = true;
  }
}

module.exports = { Scheduler };

const http = require('http');

class Scheduler {
  constructor() {
    this.jobs = [];
    this.agents = [];
  }

  addAgent(agent) {
    this.agents.push(agent);
  }

  schedule(job) {
    const agent = this.agents.find((agent) => agent.isFree);

    if (agent) {
      this.delegateToAgent(agent, job);
    } else {
      this.jobs.push(job);
    }
  }

  delegateToAgent(agent, data) {
    const options = agent.getOptions();
    const req = http.request(options, (res) => {
      console.log('Got from worker: ', res.statusCode);
    });

    req.write(JSON.stringify(data));
    req.end();

    agent.setBusy();
  }

  setAgentFree(id) {
    const agent = this.agents.find((agent) => agent.id === id);
    agent.isFree = true;

    if (this.jobs.length > 0) {
      const job = this.jobs.shift();
      this.delegateToAgent(agent, job);
    }
  }
}

module.exports = { Scheduler };

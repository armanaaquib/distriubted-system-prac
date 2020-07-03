class Agent {
  constructor(id, options) {
    this.id = id;
    this.options = options;
    this.isFree = true;
  }

  getOptions() {
    return this.options;
  }

  setBusy() {
    this.isFree = false;
  }
}

module.exports = { Agent };

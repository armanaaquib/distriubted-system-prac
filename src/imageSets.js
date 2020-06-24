class ImageSets {
  constructor() {
    this.imageSets = {};
    this.id = 0;
  }

  add(imageSet) {
    this.imageSets[this.id] = {
      ...imageSet,
      status: 'scheduled',
      receivedAt: new Date(),
    };

    return { id: this.id++, ...imageSet };
  }

  completedProcess(id, tags) {
    this.imageSets[id].tags = tags;
    this.imageSets[id].status = 'completed';
  }

  get(id) {
    return { ...this.imageSets[id] };
  }
}

module.exports = { ImageSets };

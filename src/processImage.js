const processImage = (image) => {
  return new Promise((res, rej) => {
    let b = 0;
    let c = 0;

    for (let idx = 0; idx < image.count; idx++) {
      for (let w = 0; w < image.width; w++) {
        for (let h = 0; h < image.height; h++) {
          b = 1 - b;
          c = b * b;
        }
      }
    }

    const tags = image.tags.split('_');
    res(tags);
  });
};

module.exports = { processImage };

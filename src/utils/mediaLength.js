const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfprobePath(ffprobePath);

// TODO: fix
const mediaLength = (filePath) => {
  const prom = ffmpeg(filePath)
    .duration()
    .on('end');
  return prom;
};

module.exports = {
  mediaLength,
};

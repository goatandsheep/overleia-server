const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfprobePath(ffprobePath);

// TODO: fix
const mediaLength = (filePath) => {
  const prom = ffmpeg.ffprobe(filePath, function(err, metadata) {
    metadata.format.duration});
  return prom;
};
  /*
  const prom = ffmpeg(filePath)
    .duration()
    .on('end');
  return prom;
  */

module.exports = {
  mediaLength,
};

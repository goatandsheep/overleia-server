const ffmpeg = require('ffmpeg.js/ffmpeg-mp4.js');
const fs = require('fs');
const { INPUT_DIRECTORY } = require('./constants');

const mp4ToMemfs = (data, mp4FileName = 'in.mp4', mp3FileName = 'out.mp3') => {
  try {
    const result = ffmpeg({
      MEMFS: [{ name: mp4FileName, data }],
      arguments: ['-i', mp4FileName, '-vn', '-acodec', 'libmp3lame', mp3FileName],
    });

    return result.MEMFS[0];
  } catch (e) {
    console.log(e);
    return e;
  }
};

const memfsToMp3 = (memfsData) => {
  try {
    fs.writeFileSync(INPUT_DIRECTORY + memfsData.name, Buffer.from(memfsData.data));
  } catch (e) {
    console.error(e);
    throw e;
  }
};

module.exports = {
  mp4ToMemfs,
  memfsToMp3,
};

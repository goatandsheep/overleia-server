const ffmpeg = require('ffmpeg.js/ffmpeg-mp4');
const fs = require('fs').promises;
// const { INPUT_DIRECTORY } = require('./constants');

const mp4ToMemfs = (data, mp4FileName = 'in.mp4', mp3FileName = 'out.mp3') => {
  try {
    const result = ffmpeg({
      MEMFS: [{ name: mp4FileName, data }],
      arguments: ['-i', mp4FileName, '-vn', '-acodec', 'libmp3lame', mp3FileName],
    });

    return result.MEMFS[0];
  } catch (e) {
    console.log('mp4ToMemfs', e);
    return e;
  }
};

const memfsToMp3 = async (filePath, memfsData) => {
  try {
    if (!memfsData) {
      throw new Error('blank memfsData');
    }
    await fs.writeFile(filePath, Buffer.from(memfsData.data));
  } catch (e) {
    console.error('memfsToMp3', e);
    throw e;
  }
};

module.exports = {
  mp4ToMemfs,
  memfsToMp3,
};

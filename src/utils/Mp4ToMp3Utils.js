const ffmpeg = require('ffmpeg.js/ffmpeg-mp4.js');
const fs = require('fs');
const { INPUT_MP3_DIR } = require('../settings');

export const mp4ToMemfs = (mp4FileName, mp4FilePath, mp3FileName) => {
  const testData = new Uint8Array(fs.readFileSync(mp4FilePath));

  try {
    const result = ffmpeg({
      MEMFS: [{ name: mp4FileName, data: testData }],
      arguments: ['-i', mp4FileName, '-vn', '-acodec', 'libmp3lame', mp3FileName],
    });

    return result.MEMFS[0];
  } catch (e) {
    console.log(e);
    return e;
  }
};

export const memfsToMp3 = (memfsData) => {
  try {
    fs.writeFileSync(INPUT_MP3_DIR + memfsData.name, Buffer(memfsData.data));
  } catch (e) {
    console.log(e);
    return e;
  }
};

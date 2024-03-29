const fs = require('fs');
const { mp3ToData } = require('../src/utils/Mp3ToJsonUtils');
const {
  DEFAULT_META, DEFAULT_VALIDITY,
  INPUT_MP3_DIR, INPUT_MP3_FILENAME, INPUT_MP4_FILENAME, INPUT_MP4_PATH, TEST_MP3_PATH,
} = require('../src/utils/constants');
const { buildNodeWebvttCues, buildNodeWebvttInput, buildWebvtt } = require('../src/utils/JsonToWebvttUtils');
const expectedWebvtt = require('../test-data/expectedWebvtt');

const { memfsToMp3, mp4ToMemfs, removeFile } = require('../src/utils/Mp4ToMp3Utils');

describe('End to end media conversions', () => {
  it('should create an MP3 file from an MP4 file', async (done) => {
    const expectedMp3FileSize = fs.statSync(TEST_MP3_PATH).size;
    const mp3FilePath = INPUT_MP3_DIR + INPUT_MP3_FILENAME;

    if (fs.existsSync(mp3FilePath)) {
      removeFile(mp3FilePath);
    }

    memfsToMp3(mp4ToMemfs(INPUT_MP4_FILENAME, INPUT_MP4_PATH, INPUT_MP3_FILENAME));
    let fileExists = false;
    let fileSize = 0;

    try {
      if (fs.existsSync(mp3FilePath)) {
        fileExists = true;
        fileSize = fs.statSync(mp3FilePath).size;
      }
    } catch (err) {
      console.error(err);
    } finally {
      expect(fileExists).toBe(true);
      expect(fileSize).toBe(expectedMp3FileSize);
      done();
    }
  }, 99999);

  it('should create a webvtt file from an mp3 file', async () => {
    const testBeats = await mp3ToData(INPUT_MP3_DIR + INPUT_MP3_FILENAME, 0.3);
    const cues = buildNodeWebvttCues(testBeats);
    const input = buildNodeWebvttInput(DEFAULT_META, cues, DEFAULT_VALIDITY);
    expect(buildWebvtt(input).replace(/ /g, '')).toEqual(expectedWebvtt.replace(/ /g, ''));
  }, 99999);
});

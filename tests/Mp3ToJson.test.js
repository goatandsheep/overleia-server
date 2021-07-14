const { INPUT_MP3_DIR, INPUT_MP3_FILENAME } = require('../src/utils/constants');
const testBeats = require('../test-data/testBeats.json');
const { mp3ToData } = require('../src/utils/Mp3ToJsonUtils');

describe('MP3 to JSON', () => {
  it('should create a JSON file with a list of cues from an MP3 file', async () => {
    expect(await mp3ToData(INPUT_MP3_DIR + INPUT_MP3_FILENAME, 0.3)).toEqual(testBeats);
  }, 99999);
});

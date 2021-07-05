const inputMp4Path = 'video.mp4';

const constants = {
  DEFAULT_META: {
    Kind: 'captions',
    Language: 'en',
  },
  DEFAULT_VALIDITY: true,
  INPUT_DIRECTORY: '/data/',
  INPUT_MP3_FILENAME: 'audio.mp3',
  INPUT_MP3_DIR: 'tests/input/mp3/',
  INPUT_MP4_FILENAME: inputMp4Path,
  INPUT_MP4_PATH: `tests/input/mp4/${inputMp4Path}`,
  TEST_MP3_PATH: 'tests/test-data/audio.mp3',
};

module.exports = constants;

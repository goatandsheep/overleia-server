// Utils for passing mp3 files through beatcaps-library
// Not currently implemented
const getTimeSegments = require('beatcaps-library');

const mp3ToData = (fileName, interval, advance = 0) => getTimeSegments(fileName, interval, advance);

module.exports = {
  mp3ToData,
};

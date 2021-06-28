// Utils for passing mp3 files through beatcaps-library
// Not currently implemented
const getTimeSegments = require('beatcaps-library');

export const mp3ToData = (fileName, interval) => getTimeSegments(fileName, interval);

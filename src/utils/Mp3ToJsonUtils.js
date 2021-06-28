// Utils for passing mp3 files through beatcaps-library
const getTimeSegments = require("beatcaps-library");

export const mp3ToData = (fileName, interval) => {
    return getTimeSegments(fileName, interval)
}
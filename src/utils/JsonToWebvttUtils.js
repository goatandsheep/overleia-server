const webvtt = require('node-webvtt');

const EMPTY_CUES_ERROR = new Error('Please provide a list of cues');
const NULL_META_ERROR = new Error("Please provide a 'meta' parameter");
const NULL_CUES_ERROR = new Error("Please provide a 'cues' parameter");
const NULL_VALIDITY_ERROR = new Error("Please provide a 'valid' parameter");

const buildNodeWebvttCues = (cues) => {
  if (!cues || !cues.length) throw EMPTY_CUES_ERROR;
  return cues.map((cue) => {
    const out = cue;
    out.identifier = cue.identifier || '';
    out.text = cue.text || '';
    out.styles = cue.styles || '';
    return out;
  });
};

/**
 * @param {Object} meta
 * @param {Object[]} cues
 * @param {Boolean} valid
 * @returns {Object} Node-Webvtt Input Object
 */
const buildNodeWebvttInput = (meta, cues, valid) => {
  if (!meta) throw NULL_META_ERROR;
  if (!cues) throw NULL_CUES_ERROR;
  if (!valid) throw NULL_VALIDITY_ERROR;
  return { meta, cues, valid };
};

/**
 * @param {Object} ttObj Node-WebVTT input object
 * @returns {String} WebVTT Plain text
 */
const buildWebvtt = (ttObj) => webvtt.compile(ttObj);

module.exports = {
  buildWebvtt,
  buildNodeWebvttCues,
  buildNodeWebvttInput,
  EMPTY_CUES_ERROR,
  NULL_CUES_ERROR,
  NULL_META_ERROR,
  NULL_VALIDITY_ERROR,
};

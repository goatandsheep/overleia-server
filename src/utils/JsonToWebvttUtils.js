import webvtt from 'node-webvtt';

export const EMPTY_CUES_ERROR = new Error('Please provide a list of cues');
export const NULL_META_ERROR = new Error("Please provide a 'meta' parameter");
export const NULL_CUES_ERROR = new Error("Please provide a 'cues' parameter");
export const NULL_VALIDITY_ERROR = new Error("Please provide a 'valid' parameter");

export const buildNodeWebvttCues = (cues) => {
  if (!cues || !cues.length) throw EMPTY_CUES_ERROR;
  return cues.map((cue) => {
    cue.identifier = cue.identifier || '';
    cue.text = cue.text || '';
    cue.styles = cue.styles || '';
    return cue;
  });
};

/**
 * @param {Object} meta
 * @param {Object[]} cues
 * @param {Boolean} valid
 * @returns {Object} Node-Webvtt Input Object
 */
export const buildNodeWebvttInput = (meta, cues, valid) => {
  if (!meta) throw NULL_META_ERROR;
  if (!cues) throw NULL_CUES_ERROR;
  if (!valid) throw NULL_VALIDITY_ERROR;
  return { meta, cues, valid };
};

/**
 * @param {Object} ttObj Node-WebVTT input object
 * @returns {String} WebVTT Plain text
 */
export const buildWebvtt = (ttObj) => webvtt.compile(ttObj);

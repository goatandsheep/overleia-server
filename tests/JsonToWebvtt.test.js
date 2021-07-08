import testBeats from '../test-data/testBeats.json';
import {
  DEFAULT_META, DEFAULT_VALIDITY, EMPTY_CUES_ERROR, NULL_CUES_ERROR, NULL_META_ERROR, NULL_VALIDITY_ERROR,
} from '../../settings';
import { buildNodeWebvttCues, buildNodeWebvttInput, buildWebvtt } from '../../utils/JsonToWebvttUtils';
import expectedAudioCues from '../test-data/expectedAudioCues';
import expectedWebvtt from '../test-data/expectedWebvtt';
import expectedNodeWebvttInput from '../test-data/expectedNodeWebvttInput';

describe('JSON to WebVtt', () => {
  it('should create a JSON file of time segments from audio', async () => {
    const cues = buildNodeWebvttCues(testBeats);
    const input = buildNodeWebvttInput(DEFAULT_META, cues, DEFAULT_VALIDITY);
    expect(buildWebvtt(input).replace(/ /g, '')).toEqual(expectedWebvtt.replace(/ /g, ''));
  });

  describe('buildNodeWebvttCues', () => {
    it('should build a list of cues with the appropriate metadata', () => {
      expect(buildNodeWebvttCues(testBeats)).toEqual(expectedAudioCues);
    });
    it('should not modify a valid list of cues', () => {
      expect(buildNodeWebvttCues(expectedAudioCues)).toEqual(expectedAudioCues);
    });
    it('should throw an error if no cues are provided', () => {
      expect(() => { buildNodeWebvttCues(); }).toThrow(EMPTY_CUES_ERROR);
    });
  });

  describe('buildNodeWebvttInput', () => {
    it('should build an object with "meta", "valid", and "cues" attribues ', () => {
      expect(buildNodeWebvttInput(DEFAULT_META, expectedAudioCues, DEFAULT_VALIDITY)).toEqual(expectedNodeWebvttInput);
    });
    it('should throw an error if paramters are missing', () => {
      expect(() => { buildNodeWebvttInput(null, expectedAudioCues, DEFAULT_VALIDITY); }).toThrow(NULL_META_ERROR);
      expect(() => { buildNodeWebvttInput(DEFAULT_META, 0, DEFAULT_VALIDITY); }).toThrow(NULL_CUES_ERROR);
      expect(() => { buildNodeWebvttInput(DEFAULT_META, expectedAudioCues, undefined); }).toThrow(NULL_VALIDITY_ERROR);
    });
  });
});

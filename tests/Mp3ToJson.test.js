import { INPUT_MP3_DIR, INPUT_MP3_FILENAME } from '../../settings';
import testBeats from '../test-data/testBeats.json'
import { mp3ToData } from '../../utils/Mp3ToJsonUtils'

describe('MP3 to JSON', () => {
    it('should create a JSON file with a list of cues from an MP3 file', async () => {
        expect(await mp3ToData(INPUT_MP3_DIR + INPUT_MP3_FILENAME, 0.3)).toEqual(testBeats)
    })
})
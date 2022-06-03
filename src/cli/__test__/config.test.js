// @flow
import {validateConfigFile} from '../config';

describe('json schema validation should work', () => {
    it('should accept a minimal config file', () => {
        validateConfigFile({
            crawl: {
                root: '.',
            },
            generate: {
                schemaFilePath: 'ok',
                generatedDirectory: '__types',
            },
        });
    });

    it('should report errors', () => {
        // $FlowIgnore
        expect(() => validateConfigFile({bad: 'news', crawl: 'what'}))
            .toThrowErrorMatchingInlineSnapshot(`
            "Invalid config file:
             - instance is not allowed to have the additional property \\"bad\\"
             - instance.crawl is not of a type(s) object
             - instance requires property \\"generate\\""
        `);
    });
});

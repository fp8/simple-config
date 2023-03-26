import { readConfigFiles } from '@fp8proj/core';

import {expect} from './testlib';

describe('core-readConfigFiles', () => {
    it('test env', () => {
        const loadedConfig = readConfigFiles({env: 'test'});
        // console.log('loadedConfig: ', loadedConfig);
        expect(loadedConfig.configJson.name).to.eql('test/config.json');
        expect(loadedConfig.templateTagsFound).to.be.true;
    });
    it('test test-yaml', () => {
        const loadedConfig = readConfigFiles({env: 'test-yaml'});
        // console.log('loadedConfig: ', loadedConfig);
        expect(loadedConfig.configJson.name).to.eql('test-yaml/app.yaml');
        expect(loadedConfig.templateTagsFound).to.be.true;
        
    });
    it('test utest', () => {
        const loadedConfig = readConfigFiles({env: 'utest'});
        // console.log('loadedConfig: ', loadedConfig);
        expect(loadedConfig.configJson.name).to.eql('utest/app.json');
        expect(loadedConfig.templateTagsFound).to.be.false;
    });
});

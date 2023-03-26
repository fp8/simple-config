import {
    readConfig
} from '@fp8proj/core';

import {expect} from './testlib';

describe('core-readConfig', () => {
    // app.json takes priority over config.json
    it('default: utest env', () => {
        const config = readConfig({env: 'utest'});
        expect(config.source?.endsWith('etc/utest/app.json')).to.be.true;
        expect(config.configJson.name).eql('utest/app.json');
    });

    it('default: test-yaml env', () => {
        const config = readConfig({env: 'test-yaml'});
        expect(config.source?.endsWith('etc/test-yaml/app.yaml')).to.be.true;
        expect(config.configJson.name).eql('test-yaml/app.yaml');
        expect(config.configJson.fp8TestVal).eql('Eyf04tCAAJ');
    });

    // config.json is read when app.json doesn't exists
    it('default: test env', () => {
        const config = readConfig({env: 'test'});
        expect(config.source?.endsWith('etc/test/config.json')).to.be.true;
        expect(config.configJson.name).eql('test/config.json');

        expect(config.configJson.fp8TestVal).eql('Eyf04tCAAJ');
    });

    // read config.json explicitly
    it('config: uteset env', () => {
        const config = readConfig({env: 'utest', configFileName: 'config.json'});
        expect(config.source?.endsWith('etc/utest/config.json')).to.be.true;
        expect(config.configJson.name).eql('utest/config.json');
    });

    it('default: test-yaml env', () => {
        const config = readConfig({env: 'test-yaml', configFileName: 'config.yaml'});
        expect(config.source?.endsWith('etc/test-yaml/config.yaml')).to.be.true;
        expect(config.configJson.name).eql('test-yaml/config.yaml');
    });

    // read from outside of the FP8_ENV
    it('utest.json: uteset env', () => {
        const config = readConfig({env: 'utest', configFileName: 'utest.json'});
        expect(config.source?.endsWith('etc/utest.json')).to.be.true;
        expect(config.configJson.name).eql('utest.json');
    });
});

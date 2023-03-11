import { readConfig } from '@fp8proj/core';

import {expect} from './testlib';

describe('core', () => {
    describe('readConfig - uteset env', () => {
        // app.json takes priority over config.json
        it('default: utest env', () => {
            const config = readConfig('utest');
            expect(config.source?.endsWith('etc/utest/app.json')).to.be.true;
            expect(config.configJson.name).eql('utest/app.json');
        });

        // config.json is read when app.json doesn't exists
        it('default: test env', () => {
            const config = readConfig('test');
            expect(config.source?.endsWith('etc/test/config.json')).to.be.true;
            expect(config.configJson.name).eql('test/config.json');
        });

        // read config.json explicitly
        it('config: uteset env', () => {
            const config = readConfig('utest', 'config.json');
            expect(config.source?.endsWith('etc/utest/config.json')).to.be.true;
            expect(config.configJson.name).eql('utest/config.json');
        });

        // read from outside of the FP8_ENV
        it('utest.json: uteset env', () => {
            const config = readConfig('utest', 'utest.json');
            expect(config.source?.endsWith('etc/utest.json')).to.be.true;
            expect(config.configJson.name).eql('utest.json');
        });
    });
});

import {expect} from './testlib';

import { IsNumber } from 'class-validator';
import { ConfigStore } from '@fp8proj';

class ConfigData {
    @IsNumber()
    port!: number;
}

class BadConfigData {
    port!: number;
}

/**
 * Test the config loaded from ./etc/utest-simple
 * 
 * Also testing the class without any decorator that would raise error, and
 */
describe('config-simple', () => {
    it('Simple Config', () => {
        const store = new ConfigStore(ConfigData, {env: 'utest-simple'});
        expect(store.data.port).to.eql(9589);
        expect(store.get('port')).to.eql(9589);
    });
    it('Improper Config', () => {
        expect(() => {
            new ConfigStore(BadConfigData, {env: 'utest-simple'});
        }).to.throw('Validation failed for BadConfigData')
    });
    it('Skip Validation', () => {
        const store = new ConfigStore(BadConfigData, {env: 'utest-simple', validateOptions: {forbidUnknownValues: false}});
        expect(store.data.port).to.eql(9589);
        expect(store.get('port')).to.eql(9589);
    });
});
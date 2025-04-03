import { expect, readJsonFile, ConfigData, BadConfigData } from './testlib';

import { ConfigStore, EntityCreationError } from '@fp8proj';
import {IFieldValidationError} from '@fp8proj/entity'



function readExpectedIFieldValidationErrorFile(name: string): IFieldValidationError {
    const expected = readJsonFile(name) as IFieldValidationError;

    // Need to ensure .value alway exists
    for (const key of Object.keys(expected)) {
        if (!('value' in expected[key])) {
            (expected[key] as unknown as any).value = undefined;
        }
    }

    return expected;
}

describe('validation scenarios', () => {
    it('badConfig', () => {
        // Make sure that exception is thrown
        let errorThrown = false;
        const expectedFields = readExpectedIFieldValidationErrorFile('bad-config-fields.json');

        try {
            const store = new ConfigStore(BadConfigData, { configFileName: 'badConfig.json' });
        } catch (err) {
            expect(err).to.be.instanceOf(EntityCreationError);

            const error = err as EntityCreationError;
            expect(error.fields).to.eql(expectedFields);

            errorThrown = true;
        }

        expect(errorThrown).to.be.true;
    });

    it('extraConfig', () => {
        const store = new ConfigStore(ConfigData, { configFileName: 'extraConfig.json' });
        expect(store.data.name).to.eql('extraConfig');
        expect(store.data.db.username).to.eql('user-LJ7tXjYsF5');
        
        // Intentially, extra is loaded but doesn't fail validation
        expect((store.data as any).extra).to.eql('extra-LJ7tXjYsF5');
        expect(store.get('extra')).to.eql('extra-LJ7tXjYsF5');
    });

    it('extraConfig no validation', () => {
        const store = new ConfigStore<any>(undefined, { configFileName: 'extraConfig.json' });
        expect(store.data.name).to.eql('extraConfig');
        expect(store.data.db.username).to.eql('user-LJ7tXjYsF5');

        // extra should be loaded
        expect(store.data.extra).to.eql('extra-LJ7tXjYsF5');
    });
});
import {expect, DatabaseConfig} from './testlib';

import {createEntityAndValidate} from '@fp8proj';


describe('models.createAndValidate', () => {
    it('simple', () => {
        const data = {
            username: 'user-WC1wpDRnYL',
            password: 'pwd-WC1wpDRnYL'
        };

        const result = createEntityAndValidate(DatabaseConfig, data);
        expect(result.username).to.eql('user-WC1wpDRnYL');
        expect(result.password).to.eql('pwd-WC1wpDRnYL');
    });

    it('extra', () => {
        const data = {
            username: 'user-9FCAWnRuts',
            password: 'pwd-9FCAWnRuts',
            extra: 'extra-9FCAWnRuts'
        };

        const result = createEntityAndValidate(DatabaseConfig, data);
        expect(result.username).to.eql('user-9FCAWnRuts');
        expect(result.password).to.eql('pwd-9FCAWnRuts');

        // intentionally allowing extra
        expect((result as any).extra).to.eql('extra-9FCAWnRuts');
    });
});

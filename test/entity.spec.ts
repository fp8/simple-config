import {expect} from './testlib';

import { ValidationError } from 'class-validator';
import { generateIFieldValidationDetail } from '@fp8proj/entity';


describe('models.createAndValidate', () => {
    describe('generateIFieldValidationDetail', () => {
        it('should yield correct field and details when parentFields is provided', () => {
            const errors: ValidationError[] = [{
                property: 'testProperty',
                value: 'testValue',
                constraints: { constraint1: 'constraint1Value' }
            }];
            const generator = generateIFieldValidationDetail(errors, 'parentField');

            const result = generator.next();
            expect(result.value).to.eql(['parentField.testProperty', { value: 'testValue', constraints: { constraint1: 'constraint1Value' } }]);
            expect(result.done).to.be.false;
        });

        it('should yield correct field and details when parentFields is not provided', () => {
            const errors: ValidationError[] = [{
                property: 'testProperty',
                value: 'testValue',
                constraints: { constraint1: 'constraint1Value' }
            }];
            const generator = generateIFieldValidationDetail(errors);

            const result = generator.next();
            expect(result.value).to.eql(['testProperty', { value: 'testValue', constraints: { constraint1: 'constraint1Value' } }]);
            expect(result.done).to.be.false;
        });

        it('should yield correct field and details when error.children is empty', () => {
            const errors: ValidationError[] = [{
                property: 'testProperty',
                value: 'testValue',
                constraints: { constraint1: 'constraint1Value' },
                children: []
            }];
            const generator = generateIFieldValidationDetail(errors);

            const result = generator.next();
            expect(result.value).to.eql(['testProperty', { value: 'testValue', constraints: { constraint1: 'constraint1Value' } }]);
            expect(result.done).to.be.false;
        });

        it('should yield correct field and details when error.children is not empty', () => {
            const errors: ValidationError[] = [{
                property: 'testProperty',
                value: 'testValue',
                constraints: { constraint1: 'constraint1Value' },
                children: [{
                    property: 'childProperty',
                    value: 'childValue',
                    constraints: { childConstraint1: 'childConstraint1Value' }
                }]
            }];
            const generator = generateIFieldValidationDetail(errors);

            // Note that only testProperty.childProperty is yielded and not testProperty itself
            const result = generator.next();
            expect(result.value).to.eql(['testProperty.childProperty', { value: 'childValue', constraints: { childConstraint1: 'childConstraint1Value' } }]);
            expect(result.done).to.be.false;

            const result2 = generator.next();
            expect(result2.value).to.be.undefined;
            expect(result2.done).to.be.true;
        });
    });
});
import {expect} from './testlib';

import { ValidationError } from 'class-validator';
import { generateIFieldValidationDetail, EntityCreationError } from '@fp8proj/entity';


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

        it('EntityCreationError from ValidationError', () => {
            const validationError = new ValidationError();
            validationError.property = 's5iUkXkzTd_property';
            validationError.value = 'a1SSmDVS4o_value';
            validationError.constraints = { IsArray: 'error-CySY0i07Op' };

            const err = EntityCreationError.fromValidationError('cdC6gloPQW Error', validationError);

            expect(err.message).to.equal('cdC6gloPQW Error');
            expect(err.fields).to.eql({
                s5iUkXkzTd_property: {
                    value: 'a1SSmDVS4o_value',
                    constraints: {
                        IsArray: 'error-CySY0i07Op'
                    }
                }
            });
        });

        it('EntityCreationError manual', () => {
            const err = EntityCreationError.from('Error kIhQGkApXB not a string', 'IsString', 'name', 123);
            expect(err.message).to.equal('Error kIhQGkApXB not a string');
            expect(err.fields).to.eql({
                name: {
                    value: 123,
                    constraints: {
                        IsString: 'Error kIhQGkApXB not a string'
                    }
                }
            });
        });
    });
});
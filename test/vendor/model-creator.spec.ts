
import { IJson } from 'jlog-facade';
import {expect} from '../testlib';

import {
    createEntityAndValidate,
    validateModel,
    ValidateModelOptions
} from '@fp8proj'
import * as crypto from 'node:crypto';

import { IsBase64, IsInt, IsNumber, IsString } from 'class-validator';

/*
Class used test abstract method inheritance
*/
class TestClassA {
    name: string;
    protected constructor(name: string) {
        // The following code doesn't work
        // this.name = this.constructor.convert(name);

        // There is no way to cleanly override nested static method
        this.name = TestClassA.convert(name);
    }

    static convert(name: string): string {
        return `a-${name}`;
    }

    static create(name: string): TestClassA {
        return new TestClassA(name);
    }
}

class TestClassB extends TestClassA {
    // This method is not used by the .create below
    static convert(name: string): string {
        return `ClassB-${name}`;
    }

    static create(name: string): TestClassB {
        return super.create(name);
    }
}

class TestClassC extends TestClassA {
    static create(name: string): TestClassB {
        const nameToUse = `ClassC-${name}`;
        return super.create(nameToUse);
    }
}

abstract class BaseModel {
    static convert(data: IJson): IJson {
        return data;
    }
    public validate(options?: ValidateModelOptions): void {
        validateModel(this, options);
    }
}

/*
Model creation
 */
class OrderModel extends BaseModel {
    @IsBase64()
    id!: string;

    @IsInt()
    productId!: number;

    @IsString()
    desc!: string;

    @IsNumber()
    price!: number;

    @IsInt()
    quantity!: number;

    static convert(data: IJson): IJson {
        // clone
        const output = {...data};
        const id = data.id?.toString();
        if (id === undefined) {
            throw new Error('id is required');
        }

        output.id = crypto.createHash('sha256').update(Buffer.from(id)).digest('base64');
        return output;
    }
}


function modelCreator<T extends BaseModel>(cls: { new(): T }, data: IJson, options?: ValidateModelOptions): T {
    /**
     * Force convert cls to BaseModel
     */
    const klass = (cls as unknown) as typeof BaseModel;

    const input = klass.convert(data);
    const instance = createEntityAndValidate(cls, input, options);
    return instance;
}

// START TEST
describe('ModelCreator', () => {
    it('Static Inheritance', () => {
        const a = TestClassA.create('A');
        expect(a.name).to.eql('a-A');

        // Note that override .convert method doesn't work
        const b = TestClassB.create('B');
        expect(b.name).to.eql('a-B');

        const c = TestClassC.create('C');
        expect(c.name).to.eql('a-ClassC-C');
    });

    it('modelCreator', () => {
        const data = {
            id: 1,
            productId: 1,
            desc: 'Sale of product 1',
            price: 123.45,
            quantity: 1
        };

        const expectedId = 'a4ayc/80/OGda4BO/1o/V0etpOqiLx1JwB5S3beHW0s=';
        const expected = {
            ...data,
            id: expectedId
        };

        const order = modelCreator(OrderModel, data);
        expect(order).to.be.instanceOf(OrderModel);

        // console.log(expected);
        
        expect(order).to.eql(expected);
    });
});

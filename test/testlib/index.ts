import 'reflect-metadata';

// tslint:disable-next-line
import 'mocha';

import * as fs from 'fs';
import * as nodePath from 'path';

import chai = require('chai');
import sinon = require('sinon');
import sinonChai = require('sinon-chai');
import chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
chai.use(sinonChai);

export const {expect} = chai;
export {sinon, chai};

// export models
export * from './test-models';

// Enable logging
import { SimpleTextDestination } from 'jlog-facade';
SimpleTextDestination.use();

// Read data
export function readJsonFile<T>(filename: string): T {
    const filepath = nodePath.join('./test/data', filename);
    const data = fs.readFileSync(filepath, {encoding: 'utf8'});
    return JSON.parse(data);
}
  
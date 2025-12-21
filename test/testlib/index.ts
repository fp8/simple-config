import 'reflect-metadata';

import * as fs from 'fs';
import * as nodePath from 'path';

// export models
export * from './test-models';

// Enable logging
import { SimpleTextDestination, LogLevel } from 'jlog-facade';
SimpleTextDestination.use(LogLevel.DEBUG);

// Read data
export function readJsonFile<T>(filename: string): T {
  const filepath = nodePath.join('./test/data', filename);
  const data = fs.readFileSync(filepath, { encoding: 'utf8' });
  return JSON.parse(data);
}

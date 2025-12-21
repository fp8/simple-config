import { readConfig } from '@proj/core';

describe('core-readConfig', () => {
  // app.json takes priority over config.json
  it('default: utest env', () => {
    const config = readConfig({ env: 'utest' });
    expect(config.source?.endsWith('etc/utest/app.json')).toBe(true);
    expect(config.configJson.name).toEqual('utest/app.json');
  });

  it('default: test-yaml env', () => {
    const config = readConfig({ env: 'test-yaml' });
    expect(config.source?.endsWith('etc/test-yaml/app.yaml')).toBe(true);
    expect(config.configJson.name).toEqual('test-yaml/app.yaml');
    expect(config.configJson.fp8TestVal).toEqual('Eyf04tCAAJ');
  });

  // config.json is read when app.json doesn't exists
  it('default: test env', () => {
    const config = readConfig({ env: 'test' });
    expect(config.source?.endsWith('etc/test/config.json')).toBe(true);
    expect(config.configJson.name).toEqual('test/config.json');

    expect(config.configJson.fp8TestVal).toEqual('Eyf04tCAAJ');
  });

  // read config.json explicitly
  it('config: uteset env', () => {
    const config = readConfig({ env: 'utest', configFileName: 'config.json' });
    expect(config.source?.endsWith('etc/utest/config.json')).toBe(true);
    expect(config.configJson.name).toEqual('utest/config.json');
  });

  it('default: test-yaml env', () => {
    const config = readConfig({
      env: 'test-yaml',
      configFileName: 'config.yaml',
    });
    expect(config.source?.endsWith('etc/test-yaml/config.yaml')).toBe(true);
    expect(config.configJson.name).toEqual('test-yaml/config.yaml');
  });

  // read from outside of the FP8_ENV
  it('utest.json: uteset env', () => {
    const config = readConfig({ env: 'utest', configFileName: 'utest.json' });
    expect(config.source?.endsWith('etc/utest.json')).toBe(true);
    expect(config.configJson.name).toEqual('utest.json');
  });
});

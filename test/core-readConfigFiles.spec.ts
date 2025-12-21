import { readConfigFiles } from '@proj/core';

describe('core-readConfigFiles', () => {
  it('test env', () => {
    const loadedConfig = readConfigFiles({ env: 'test' });
    // console.log('loadedConfig: ', loadedConfig);
    expect(loadedConfig.configJson.name).toEqual('test/config.json');
    expect(loadedConfig.templateTagsFound).toBe(true);
  });
  it('test test-yaml', () => {
    const loadedConfig = readConfigFiles({ env: 'test-yaml' });
    // console.log('loadedConfig: ', loadedConfig);
    expect(loadedConfig.configJson.name).toEqual('test-yaml/app.yaml');
    expect(loadedConfig.templateTagsFound).toBe(true);
  });
  it('test utest', () => {
    const loadedConfig = readConfigFiles({ env: 'utest' });
    // console.log('loadedConfig: ', loadedConfig);
    expect(loadedConfig.configJson.name).toEqual('utest/app.json');
    expect(loadedConfig.templateTagsFound).toBe(false);
  });
});

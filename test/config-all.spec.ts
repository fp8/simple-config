import { ConfigStore, IConfigStoreOptions } from '@proj';

import {
  ConfigDataAll,
  ConfigData,
  DatabaseConfig,
  ExtraConfig,
  ConfigDataYaml,
  JustName,
  JustNameWithTestEntry,
  JustNameWithEntry,
} from './testlib';

/**
 * Validate of ConfigDataAll data structure.  The actual data
 * might not actually be instance defined in the ConfigDataAll class
 *
 * @param store
 */
function testConfigDataAll(store: ConfigStore<ConfigDataAll>) {
  it('name', () => {
    expect(store.data.config.name).toEqual('light-config-local');
    expect(store.get('config.name')).toEqual('light-config-local');

    expect(store.data.badConfig.name).toEqual('bad2');
    expect(store.get('badConfig.name')).toEqual('bad2');

    expect(store.data.extraConfig.name).toEqual('extraConfig');
    expect(store.get('extraConfig.name')).toEqual('extraConfig');
  });

  it('db username', () => {
    expect(store.data.config.db.username).toEqual('user-lOVx1VJiEP');
    expect(store.get('config.db.username')).toEqual('user-lOVx1VJiEP');

    expect(store.data.extraConfig.db.username).toEqual('user-LJ7tXjYsF5');
    expect(store.get('extraConfig.db.username')).toEqual('user-LJ7tXjYsF5');
  });

  it('db password', () => {
    expect(store.data.config.db.password).toEqual('pwd-VITOlv5aPU');
    expect(store.get('config.db.password')).toEqual('pwd-VITOlv5aPU');

    expect(store.data.extraConfig.db.password).toEqual('pwd-LJ7tXjYsF5');
    expect(store.get('extraConfig.db.password')).toEqual('pwd-LJ7tXjYsF5');
  });

  it('city', () => {
    expect(store.data.city).toEqual('Milan-q4PvB16Fpe');
    expect(store.get('city')).toEqual('Milan-q4PvB16Fpe');
  });

  it('configStore.source', () => {
    expect(store.source?.endsWith('/etc/local/config.json')).toBe(true);
  });

  it('configStore.configDir', () => {
    expect(store.configDir?.endsWith('/etc/local')).toBe(true);
  });

  it('ConfigStore.get array', () => {
    expect(store.get('config.tags[0]')).toEqual('tag1');
    expect(store.get('config.tags[1]')).toEqual('tag2');
    expect(store.get('config.tags[2]')).toBeUndefined();
  });

  it('ConfigStore.get invalid path', () => {
    expect(store.get('..')).toBeUndefined();
    expect(store.get('..name')).toBeUndefined();
    expect(store.get('.name.')).toBeUndefined();
    expect(store.get('.name.')).toBeUndefined();
  });

  /*
  The ENV is removed starting from 0.6.x version.

  it('ENV', () => {
    expect(store.get('ENV.FP8_TESTVAL')).toEqual('Eyf04tCAAJ');
    expect(store.get('ENV.HOSTNAME')).toEqual(process.env.HOSTNAME);
  });
  */
}

describe('config-all', () => {
  const configOptions: IConfigStoreOptions = {
    loadAll: true,
    entries: { city: 'Milan-q4PvB16Fpe' },
  };

  /**
   * Test load all without validation.  The nested class are not the correct instances
   */
  describe('no validation', () => {
    const store = new ConfigStore<ConfigDataAll>(undefined, configOptions);
    // console.log('### store.data:', store.data);

    // Check instance
    it('db', () => {
      // when type is not passed entry for constructor of ConfigStore, nested type is not created
      expect(store.data.config).not.toBeInstanceOf(ConfigData);
      expect(store.data.config.db).not.toBeInstanceOf(DatabaseConfig);
      expect(store.data.extraConfig).not.toBeInstanceOf(ExtraConfig);

      const configDb: any = store.get('config.db');
      expect(configDb.username).toEqual('user-lOVx1VJiEP');

      const extraDb: any = store.get('extraConfig.db');
      expect(extraDb.password).toEqual('pwd-LJ7tXjYsF5');
    });

    testConfigDataAll(store);
  });

  /**
   * Test load all with validation.  The nested class should be the expected instances
   */
  describe('validate', () => {
    const store = new ConfigStore(ConfigDataAll, configOptions);
    // console.log('### store.data:', store.data);

    // Check instance
    it('db', () => {
      // when type is not passed entry for constructor of ConfigStore, nested type is not created
      expect(store.data.config).toBeInstanceOf(ConfigData);
      expect(store.data.config.db).toBeInstanceOf(DatabaseConfig);
      expect(store.data.extraConfig).toBeInstanceOf(ExtraConfig);

      const configDb: any = store.get('config.db');
      expect(configDb.username).toEqual('user-lOVx1VJiEP');

      const extraDb: any = store.get('extraConfig.db');
      expect(extraDb.password).toEqual('pwd-LJ7tXjYsF5');
    });

    testConfigDataAll(store);
  });

  /**
   * Make sure that loadAll also work for mixed yaml and json files
   */
  describe('yaml', () => {
    const store = new ConfigStore(ConfigDataYaml, {
      env: 'test-yaml',
      loadAll: true,
    });

    it('ConfigDataYaml.app', () => {
      expect(store.data.app).toBeInstanceOf(JustNameWithTestEntry);

      expect(store.data.app.name).toEqual('test-yaml/app.yaml');
      expect(store.get('app.name')).toEqual('test-yaml/app.yaml');

      expect(store.data.app.fp8TestVal).toEqual('Eyf04tCAAJ');
      expect(store.get('app.fp8TestVal')).toEqual('Eyf04tCAAJ');
    });

    it('ConfigDataYaml.config', () => {
      expect(store.data.config).toBeInstanceOf(JustName);
      expect(store.data.config.name).toEqual('test-yaml/config.yaml');
      expect(store.get('config.name')).toEqual('test-yaml/config.yaml');
    });

    it('ConfigDataYaml.extra', () => {
      expect(store.data.extra).toBeInstanceOf(JustNameWithEntry);

      expect(store.data.extra.name).toEqual('test-yaml/extra.json');
      expect(store.get('extra.name')).toEqual('test-yaml/extra.json');

      expect(store.data.extra.entry).toEqual('Eyf04tCAAJ');
      expect(store.get('extra.entry')).toEqual('Eyf04tCAAJ');
    });
  });
});

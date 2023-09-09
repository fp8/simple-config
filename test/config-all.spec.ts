import { ConfigStore, IConfigStoreOptions } from '@fp8proj';

import {
  expect, ConfigDataAll,
  ConfigData, DatabaseConfig,
  ExtraConfig, ConfigDataYaml, JustName, JustNameWithTestEntry, JustNameWithEntry
} from './testlib';


/**
 * Validate of ConfigDataAll data structure.  The actual data
 * might not actually be instance defined in the ConfigDataAll class
 *
 * @param store 
 */
function testConfigDataAll(store: ConfigStore<ConfigDataAll>) {
  it('name', () => {
    expect(store.data.config.name).to.eql('light-config-local');
    expect(store.get('config.name')).to.eql('light-config-local');

    expect(store.data.badConfig.name).to.eql('bad2');
    expect(store.get('badConfig.name')).to.eql('bad2');

    expect(store.data.extraConfig.name).to.eql('extraConfig');
    expect(store.get('extraConfig.name')).to.eql('extraConfig');
  });

  it('db username', () => {
    expect(store.data.config.db.username).to.eql('user-lOVx1VJiEP');
    expect(store.get('config.db.username')).to.eql('user-lOVx1VJiEP');

    expect(store.data.extraConfig.db.username).to.eql('user-LJ7tXjYsF5');
    expect(store.get('extraConfig.db.username')).to.eql('user-LJ7tXjYsF5');
  });

  it('db password', () => {
    expect(store.data.config.db.password).to.eql('pwd-VITOlv5aPU');
    expect(store.get('config.db.password')).to.eql('pwd-VITOlv5aPU');

    expect(store.data.extraConfig.db.password).to.eql('pwd-LJ7tXjYsF5');
    expect(store.get('extraConfig.db.password')).to.eql('pwd-LJ7tXjYsF5');
  });

  it('city', () => {
    expect(store.data.city).to.eql('Milan-q4PvB16Fpe');
    expect(store.get('city')).to.eql('Milan-q4PvB16Fpe');
  });

  it('configStore.source', () => {
    expect(store.source?.endsWith('/etc/local/config.json')).to.be.true;
  });

  it('configStore.configDir', () => {
    expect(store.configDir?.endsWith('/etc/local')).to.be.true;
  });

  it('ConfigStore.get array', () => {
    expect(store.get('config.tags[0]')).to.eql('tag1');
    expect(store.get('config.tags[1]')).to.eql('tag2');
    expect(store.get('config.tags[2]')).to.be.undefined;
  });

  it('ConfigStore.get invalid path', () => {
    expect(store.get('..')).to.be.undefined;
    expect(store.get('..name')).to.be.undefined;
    expect(store.get('.name.')).to.be.undefined;
    expect(store.get('.name.')).to.be.undefined;
  });

  it('ENV', () => {
    expect(store.get('ENV.FP8_TESTVAL')).to.eql('Eyf04tCAAJ');
    expect(store.get('ENV.HOSTNAME')).to.eql(process.env.HOSTNAME);
  });
}


describe('config-all', () => {
  const configOptions: IConfigStoreOptions = {
    loadAll: true,
    entries: { city: 'Milan-q4PvB16Fpe' }
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
      expect(store.data.config).not.to.be.instanceOf(ConfigData);
      expect(store.data.config.db).not.to.be.instanceOf(DatabaseConfig);
      expect(store.data.extraConfig).not.to.be.instanceOf(ExtraConfig);
  
      const configDb: any = store.get('config.db');
      expect(configDb.username).to.eql('user-lOVx1VJiEP');
  
      const extraDb: any = store.get('extraConfig.db');
      expect(extraDb.password).to.eql('pwd-LJ7tXjYsF5');
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
      expect(store.data.config).to.be.instanceOf(ConfigData);
      expect(store.data.config.db).to.be.instanceOf(DatabaseConfig);
      expect(store.data.extraConfig).to.be.instanceOf(ExtraConfig);
  
      const configDb: any = store.get('config.db');
      expect(configDb.username).to.eql('user-lOVx1VJiEP');
  
      const extraDb: any = store.get('extraConfig.db');
      expect(extraDb.password).to.eql('pwd-LJ7tXjYsF5');
    });

    testConfigDataAll(store);
  });

  /**
   * Make sure that loadAll also work for mixed yaml and json files
   */
  describe('yaml', () => {
    const store = new ConfigStore(ConfigDataYaml, {
      env: 'test-yaml',
      loadAll: true
    });

    it('ConfigDataYaml.app', () => {
      expect(store.data.app).to.be.instanceOf(JustNameWithTestEntry);

      expect(store.data.app.name).to.eql('test-yaml/app.yaml');
      expect(store.get('app.name')).to.eql('test-yaml/app.yaml');

      expect(store.data.app.fp8TestVal).to.eql('Eyf04tCAAJ');
      expect(store.get('app.fp8TestVal')).to.eql('Eyf04tCAAJ');
    });

    it('ConfigDataYaml.config', () => {
      expect(store.data.config).to.be.instanceOf(JustName);
      expect(store.data.config.name).to.eql('test-yaml/config.yaml');
      expect(store.get('config.name')).to.eql('test-yaml/config.yaml');
    });

    it('ConfigDataYaml.extra', () => {
      expect(store.data.extra).to.be.instanceOf(JustNameWithEntry);

      expect(store.data.extra.name).to.eql('test-yaml/extra.json');
      expect(store.get('extra.name')).to.eql('test-yaml/extra.json');

      expect(store.data.extra.entry).to.eql('Eyf04tCAAJ');
      expect(store.get('extra.entry')).to.eql('Eyf04tCAAJ');
    });

  });

});

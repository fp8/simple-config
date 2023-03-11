import { ConfigStore, IConfigStoreOptions } from '@fp8proj';

import {
  expect, ConfigDataAll,
  ConfigData, DatabaseConfig,
  ExtraConfig,
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

    expect(store.data.badConfig.name).to.eql('bad');
    expect(store.get('badConfig.name')).to.eql('bad');

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
}


describe('config-all', () => {
  const configOptions: IConfigStoreOptions = {
    loadAll: true,
    entries: { city: 'Milan-q4PvB16Fpe' }
  };

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

  describe('validate', () => {
    const store = new ConfigStore(ConfigDataAll, configOptions);
    console.log('### store.data:', store.data);

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

});

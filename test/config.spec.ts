import {expect, ConfigData, DatabaseConfig} from './testlib';

import { ConfigStore } from '@fp8proj';

/**
 * Test the config loaded from ./etc/local
 */
describe('config', () => {
  describe('no validation', () => {
    const store = new ConfigStore<ConfigData>(undefined, {entries: { city: 'Rome-QjickF4JAF'}});
    it('name', () => {
      expect(store.data.name).to.eql('light-config-local');
      expect(store.get('name')).to.eql('light-config-local');
    });

    it('db', () => {
      // when type is not passed entry for constructor of ConfigStore, nested type is not created
      expect(store.data.db).not.to.be.instanceOf(DatabaseConfig);

      const db: any = store.get('db');
      // console.log('### db', db);
      expect(db.username).to.eql('user-lOVx1VJiEP');
    });

    it('db username', () => {
      expect(store.data.db.username).to.eql('user-lOVx1VJiEP');
      expect(store.get('db.username')).to.eql('user-lOVx1VJiEP');
    });
  
    it('db password', () => {
      expect(store.data.db.password).to.eql('pwd-VITOlv5aPU');
      expect(store.get('db.password')).to.eql('pwd-VITOlv5aPU');
    });

    it('city', () => {
      expect(store.data.city).to.eql('Rome-QjickF4JAF');
      expect(store.get('city')).to.eql('Rome-QjickF4JAF');
    });
  
    it('configStore.source', () => {
      expect(store.source?.endsWith('/etc/local/config.json')).to.be.true;
    });
  
    it('configStore.configDir', () => {
      expect(store.configDir?.endsWith('/etc/local')).to.be.true;
    });

    it('ConfigStore.get array', () => {
      expect(store.get('tags[0]')).to.eql('tag1');
      expect(store.get('tags[1]')).to.eql('tag2');
      expect(store.get('tags[2]')).to.be.undefined;
    });

    it('ConfigStore.get invalid path', () => {
      expect(store.get('..')).to.be.undefined;
      expect(store.get('..name')).to.be.undefined;
      expect(store.get('.name.')).to.be.undefined;
      expect(store.get('.name.')).to.be.undefined;
    });
  });

  describe('validate', () => {
    const store = new ConfigStore(ConfigData);
    it('name', () => {
      expect(store.data.name).to.eql('light-config-local');
    });

    it('db', () => {
      // When ConfigData is passed as type to ConfigStore, nested type must be created
      expect(store.data.db).to.be.instanceOf(DatabaseConfig);
    });
  
    it('db username', () => {
      expect(store.data.db.username).to.eql('user-lOVx1VJiEP');
    });
  
    it('db password', () => {
      expect(store.data.db.password).to.eql('pwd-VITOlv5aPU');
    });

    it('city', () => {
      expect(store.data.city).to.be.undefined;
    });
  
    it('configStore.source', () => {
      expect(store.source?.endsWith('/etc/local/config.json')).to.be.true;
    });
  
    it('configStore.configDir', () => {
      expect(store.configDir?.endsWith('/etc/local')).to.be.true;
    });
  });
});

import {expect, ConfigData, DatabaseConfig} from './testlib';

import { ConfigStore, EntityCreationError } from '@fp8proj';

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

  describe('with createOptions', () => {
    it('create should succeed if excludeExtraneousValues flag is not set', () => {
      const store = new ConfigStore(ConfigData, {
        entries: { 
          customField: 'custom-abdo1j6QDq',
        }
      });

      expect(store.data).to.be.instanceOf(ConfigData);
      expect((store.data as any).customField).to.equal('custom-abdo1j6QDq');
    });

    it('create should fail if excludeExtraneousValues flag is set', () => {
      // Test that ConfigStore constructor properly accepts createOptions
      // in the IConfigStoreOptions parameter
      expect(() => {
        const store = new ConfigStore(ConfigData, {
          entries: {
            customField: 'custom-abdo1j6QDq',
          },
          createOptions: {
            excludeExtraneousValues: true,
          }
        });
      }).to.throw(EntityCreationError);
    });
  });

  // Primary tests for disabling validation via ConfigStore using disableValidation
  describe('ConfigStore with disableValidation', () => {
    it('skips validation when disableValidation is true', () => {
      // Create a ConfigStore with invalid data that would normally fail validation
      const store = new ConfigStore(ConfigData, {
        env: 'nonexistent-test-env-validation',
        entries: {
          name: 'ab', // too short, violates MinLength(5)
          db: { username: 'user', password: 'pass' }
        },
        disableValidation: true
      });

      expect(store.data).to.be.instanceOf(ConfigData);
      expect(store.data.name).to.eql('ab');
    });

    it('still validates when disableValidation is false', () => {
      expect(() => {
        new ConfigStore(ConfigData, {
          env: 'nonexistent-test-env-validation-2',
          entries: {
            name: 'ab', // too short
            db: { username: 'user', password: 'pass' }
          },
          disableValidation: false
        });
      }).to.throw(EntityCreationError);
    });

    it('validates by default when disableValidation is not specified', () => {
      expect(() => {
        new ConfigStore(ConfigData, {
          env: 'nonexistent-test-env-validation-3',
          entries: {
            name: 'ab', // too short
            db: { username: 'user', password: 'pass' }
          }
        });
      }).to.throw(EntityCreationError);
    });
  });

  // Tests for deprecated ValidateModelOptions.disable via ConfigStore
  describe('ConfigStore with deprecated validateModelOptions.disable', () => {
    it('skips validation when validateModelOptions.disable is true', () => {
      const store = new ConfigStore(ConfigData, {
        env: 'nonexistent-test-env-validation-4',
        entries: {
          name: 'ab', // too short
          db: { username: 'user', password: 'pass' }
        },
        validateModelOptions: { disable: true }
      });

      expect(store.data).to.be.instanceOf(ConfigData);
      expect(store.data.name).to.eql('ab');
    });

    it('validates when deprecated disable is false', () => {
      expect(() => {
        new ConfigStore(ConfigData, {
          env: 'nonexistent-test-env-validation-5',
          entries: {
            name: 'ab', // too short
            db: { username: 'user', password: 'pass' }
          },
          validateModelOptions: { disable: false }
        });
      }).to.throw(EntityCreationError);
    });
  });
});

import { ConfigStore } from '@fp8proj';

import {expect, ConfigData, DatabaseConfig} from './testlib';
import { EntityCreationError } from '@fp8proj';


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


  describe('validation scenarios', () => {
    it('badConfig', () => {
      // Make sure that exception is thrown
      expect(() => {
        const store = new ConfigStore(ConfigData, {configFileName: 'badConfig.json'});
      }).to.throw(EntityCreationError);

      /*
      Check exception details
      [
          {
              "target": {
                  "name": "bad",
                  "db": {
                      "username": "user-lOVx1VJiEP",
                      "password": 123
                  }
              },
              "value": "bad",
              "property": "name",
              "children": [],
              "constraints": {
                  "minLength": "name must be longer than or equal to 5 characters"
              }
          },
          {
              "target": {
                  "name": "bad",
                  "db": {
                      "username": "user-lOVx1VJiEP",
                      "password": 123
                  }
              },
              "value": {
                  "username": "user-lOVx1VJiEP",
                  "password": 123
              },
              "property": "db",
              "children": [
                  {
                      "target": {
                          "username": "user-lOVx1VJiEP",
                          "password": 123
                      },
                      "value": 123,
                      "property": "password",
                      "children": [],
                      "constraints": {
                          "isString": "password must be a string"
                      }
                  }
              ]
          }
      ]
      */
      try {
        const store = new ConfigStore(ConfigData, {configFileName: 'badConfig.json'});
      } catch(err) {
        if (err instanceof EntityCreationError) {
          expect(err.details).has.lengthOf(2);

          const errorName: any = err._details[0];
          expect(errorName).to.have.property('property', 'name');
          expect(errorName).to.have.property('constraints');
          expect(errorName.constraints).to.have.property('minLength', 'name must be longer than or equal to 5 characters');

          const errorDb: any = err._details[1];
          expect(errorDb).to.have.property('property', 'db');
          expect(errorDb.children).has.lengthOf(1);
          expect(errorDb.children[0]).to.have.property('property', 'password');
          expect(errorDb.children[0]).to.have.property('constraints');
          expect(errorDb.children[0].constraints).to.have.property('isString', 'password must be a string');
        }
      }
    });

    it('extraConfig', () => {
      const store = new ConfigStore(ConfigData, {configFileName: 'extraConfig.json'});
      expect(store.data.name).to.eql('extraConfig');
      expect(store.data.db.username).to.eql('user-LJ7tXjYsF5');

      // Intentially, extra is loaded but doesn't fail validation
      expect(store.get('extra')).to.eql('extra-LJ7tXjYsF5');
    });

    it('extraConfig no validation', () => {
      const store = new ConfigStore<any>(undefined, {configFileName: 'extraConfig.json'});
      expect(store.data.name).to.eql('extraConfig');
      expect(store.data.db.username).to.eql('user-LJ7tXjYsF5');

      // extra should be loaded
      expect(store.data.extra).to.eql('extra-LJ7tXjYsF5');
    });
  });

});

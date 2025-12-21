import { ConfigData, DatabaseConfig } from './testlib';

import { ConfigStore, EntityCreationError } from '@fp8proj';

/**
 * Test the config loaded from ./etc/local
 */
describe('config', () => {
  describe('no validation', () => {
    const store = new ConfigStore<ConfigData>(undefined, {
      entries: { city: 'Rome-QjickF4JAF' },
    });
    it('name', () => {
      expect(store.data.name).toEqual('light-config-local');
      expect(store.get('name')).toEqual('light-config-local');
    });

    it('db', () => {
      // when type is not passed entry for constructor of ConfigStore, nested type is not created
      expect(store.data.db).not.toBeInstanceOf(DatabaseConfig);

      const db: any = store.get('db');
      // console.log('### db', db);
      expect(db.username).toEqual('user-lOVx1VJiEP');
    });

    it('db username', () => {
      expect(store.data.db.username).toEqual('user-lOVx1VJiEP');
      expect(store.get('db.username')).toEqual('user-lOVx1VJiEP');
    });

    it('db password', () => {
      expect(store.data.db.password).toEqual('pwd-VITOlv5aPU');
      expect(store.get('db.password')).toEqual('pwd-VITOlv5aPU');
    });

    it('city', () => {
      expect(store.data.city).toEqual('Rome-QjickF4JAF');
      expect(store.get('city')).toEqual('Rome-QjickF4JAF');
    });

    it('configStore.source', () => {
      expect(store.source?.endsWith('/etc/local/config.json')).toBe(true);
    });

    it('configStore.configDir', () => {
      expect(store.configDir?.endsWith('/etc/local')).toBe(true);
    });

    it('ConfigStore.get array', () => {
      expect(store.get('tags[0]')).toEqual('tag1');
      expect(store.get('tags[1]')).toEqual('tag2');
      expect(store.get('tags[2]')).toBeUndefined();
    });

    it('ConfigStore.get invalid path', () => {
      expect(store.get('..')).toBeUndefined();
      expect(store.get('..name')).toBeUndefined();
      expect(store.get('.name.')).toBeUndefined();
      expect(store.get('.name.')).toBeUndefined();
    });
  });

  describe('validate', () => {
    const store = new ConfigStore(ConfigData);
    it('name', () => {
      expect(store.data.name).toEqual('light-config-local');
    });

    it('db', () => {
      // When ConfigData is passed as type to ConfigStore, nested type must be created
      expect(store.data.db).toBeInstanceOf(DatabaseConfig);
    });

    it('db username', () => {
      expect(store.data.db.username).toEqual('user-lOVx1VJiEP');
    });

    it('db password', () => {
      expect(store.data.db.password).toEqual('pwd-VITOlv5aPU');
    });

    it('city', () => {
      expect(store.data.city).toBeUndefined();
    });

    it('configStore.source', () => {
      expect(store.source?.endsWith('/etc/local/config.json')).toBe(true);
    });

    it('configStore.configDir', () => {
      expect(store.configDir?.endsWith('/etc/local')).toBe(true);
    });
  });

  describe('with createOptions', () => {
    it('create should succeed if excludeExtraneousValues flag is not set', () => {
      const store = new ConfigStore(ConfigData, {
        entries: {
          customField: 'custom-abdo1j6QDq',
        },
      });

      expect(store.data).toBeInstanceOf(ConfigData);
      expect((store.data as any).customField).toBe('custom-abdo1j6QDq');
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
          },
        });
      }).toThrow(EntityCreationError);
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
          db: { username: 'user', password: 'pass' },
        },
        disableValidation: true,
      });

      expect(store.data).toBeInstanceOf(ConfigData);
      expect(store.data.name).toEqual('ab');
    });

    it('still validates when disableValidation is false', () => {
      expect(() => {
        new ConfigStore(ConfigData, {
          env: 'nonexistent-test-env-validation-2',
          entries: {
            name: 'ab', // too short
            db: { username: 'user', password: 'pass' },
          },
          disableValidation: false,
        });
      }).toThrow(EntityCreationError);
    });

    it('validates by default when disableValidation is not specified', () => {
      expect(() => {
        new ConfigStore(ConfigData, {
          env: 'nonexistent-test-env-validation-3',
          entries: {
            name: 'ab', // too short
            db: { username: 'user', password: 'pass' },
          },
        });
      }).toThrow(EntityCreationError);
    });
  });

  // Tests for deprecated ValidateModelOptions.disable via ConfigStore
  describe('ConfigStore with deprecated validateModelOptions.disable', () => {
    it('skips validation when validateModelOptions.disable is true', () => {
      const store = new ConfigStore(ConfigData, {
        env: 'nonexistent-test-env-validation-4',
        entries: {
          name: 'ab', // too short
          db: { username: 'user', password: 'pass' },
        },
        validateModelOptions: { disable: true },
      });

      expect(store.data).toBeInstanceOf(ConfigData);
      expect(store.data.name).toEqual('ab');
    });

    it('validates when deprecated disable is false', () => {
      expect(() => {
        new ConfigStore(ConfigData, {
          env: 'nonexistent-test-env-validation-5',
          entries: {
            name: 'ab', // too short
            db: { username: 'user', password: 'pass' },
          },
          validateModelOptions: { disable: false },
        });
      }).toThrow(EntityCreationError);
    });
  });

  // Tests for custom createAndValidateFunction
  describe('ConfigStore with custom createAndValidateFunction', () => {
    it('uses custom createAndValidate function when provided', () => {
      let customFunctionCalled = false;
      let receivedType: any;
      let receivedData: any;
      let receivedOptions: any;

      const customCreateAndValidate = (type: any, data: any, options: any) => {
        customFunctionCalled = true;
        receivedType = type;
        receivedData = data;
        receivedOptions = options;

        // Return a custom instance with marker
        const instance = new type();
        Object.assign(instance, data);
        (instance as any).__customCreated = true;
        return instance;
      };

      const store = new ConfigStore(ConfigData, {
        env: 'nonexistent-custom-fn-test',
        entries: {
          name: 'CustomFunctionTest',
          db: { username: 'user123', password: 'pass123' },
        },
        createAndValidateFunction: customCreateAndValidate,
      });

      // Verify custom function was called
      expect(customFunctionCalled).toBe(true);
      expect(receivedType).toBe(ConfigData);
      expect(receivedData).toHaveProperty('name', 'CustomFunctionTest');
      expect(receivedOptions).toHaveProperty('createAndValidateFunction');

      // Verify the custom marker exists
      expect((store.data as any).__customCreated).toBe(true);
      expect(store.data.name).toEqual('CustomFunctionTest');
    });

    it('allows custom function to skip validation for invalid data', () => {
      const customCreateAndValidate = (type: any, data: any) => {
        // Custom function that doesn't validate - just creates instance
        const instance = new type();
        Object.assign(instance, data);
        return instance;
      };

      // This would normally fail validation (name too short)
      const store = new ConfigStore(ConfigData, {
        env: 'nonexistent-custom-fn-test-2',
        entries: {
          name: 'ab', // too short
          db: { username: 'user', password: 'pass' },
        },
        createAndValidateFunction: customCreateAndValidate,
      });

      expect(store.data).toBeInstanceOf(ConfigData);
      expect(store.data.name).toEqual('ab');
    });

    it('allows custom function to apply custom validation logic', () => {
      const customCreateAndValidate = (type: any, data: any, options: any) => {
        const instance = new type();
        Object.assign(instance, data);

        // Custom validation: name must start with "CUSTOM-"
        if (!(instance as any).name?.startsWith('CUSTOM-')) {
          throw new EntityCreationError('Name must start with CUSTOM-', []);
        }

        return instance;
      };

      // Should succeed with correct prefix
      const store1 = new ConfigStore(ConfigData, {
        env: 'nonexistent-custom-fn-test-3',
        entries: {
          name: 'CUSTOM-ValidName',
          db: { username: 'user', password: 'pass' },
        },
        createAndValidateFunction: customCreateAndValidate,
      });
      expect(store1.data.name).toEqual('CUSTOM-ValidName');

      // Should fail without correct prefix
      expect(() => {
        new ConfigStore(ConfigData, {
          env: 'nonexistent-custom-fn-test-4',
          entries: {
            name: 'InvalidName',
            db: { username: 'user', password: 'pass' },
          },
          createAndValidateFunction: customCreateAndValidate,
        });
      }).toThrow('Name must start with CUSTOM-');
    });

    it('falls back to default createAndValidate when custom function not provided', () => {
      // This should use default validation and fail
      expect(() => {
        new ConfigStore(ConfigData, {
          env: 'nonexistent-custom-fn-test-5',
          entries: {
            name: 'ab', // too short
            db: { username: 'user', password: 'pass' },
          },
          // No createAndValidateFunction provided
        });
      }).toThrow(EntityCreationError);
    });
  });
});

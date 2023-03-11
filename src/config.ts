import { localDebug, IJson, KV, isArray, isEmpty } from 'jlog-facade';

import { createEntityAndValidate, EntityCreationError } from './entity';
import { logger, readConfig } from './core';



/**
 * ConfigStore creation option
 */
export interface IConfigStoreOptions {
  /**
   * Provide env string to use to look for config file.  Default to `FP8_ENV` environmental variable
   * or `local`.
   */
  env?: string;

  /**
   * Set the name of config file to read.  Must be a .json file and defaults to `config.json`
   */
  configFileName?: string;

  /**
   * Addtional entries to be added to data loaded
   */
  entries?: IJson

  /**
   * If set, load all config files from the config directory
   */
  loadAll?: boolean
}

/**
 * Load the configuration from `./etc` or `./config` directory, searching
 * sub directory defined in `FP8_ENV` environmental variable if exists.
 * 
 * Tye
 */
export class ConfigStore<T extends object> {
  /**
   * Configuration Data
   */
  public readonly data: T;

  /**
   * Source file used to load the configuration data
   */
  public readonly source?: string;

  /**
   * Configuration file directory
   */
  public readonly configDir?: string;

  protected getArrayCheckRegex = new RegExp("(.+)\\[([0-9]*)\\]");

  constructor(type?: { new(): T; }, options?: IConfigStoreOptions) {
    // Load data from config file, expect configJson to be at least {}
    const { configJson, source, configDir } = readConfig(options?.env, options?.configFileName);

    // Append to loaded data if necesary
    let configDataToUse: object;
    if (options?.entries) {
      configDataToUse = Object.assign({}, options.entries, configJson);
    } else {
      configDataToUse = configJson;
    }

    // Create 
    let data: T;
    if (type === undefined) {
      // If type is not provide, just force the result into data
      data = configDataToUse as T;
    } else {
      // Validate the internal data if type passed
      try {
        data = createEntityAndValidate(type, configDataToUse)
      } catch (err) {
        if (err instanceof EntityCreationError) {
          logger.debug(err, KV.of('validationError', err.details));
        } else {
          logger.debug(`createAndValidate of config data failed: ${err}`);
        }
        throw err;
      }
    }

    this.source = source;
    this.configDir = configDir;
    this.data = data;
  }

  /**
   * Allow retrieval of the loaded config data using the dot notation. Ie:
   * - 'config.db.username'
   * 
   * The first entry `config` in this case is the name of the file loaded `config.json`.
   * 
   * This method is not optmized and created for retro compability of FPLogger.  Avoid
   * this method and use an actual configuration class instead.
   * 
   * @param path 
   * @returns 
   */
  public get<O>(path: string): O {
    // source: https://stackoverflow.com/a/19048967/2355087
    const keys = path.split(".");

    // Create a clone of the data so that result can be built
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let obj: any = Object.assign({}, this.data);
    localDebug(() => `ConfigStore.get obj: ${JSON.stringify(obj)}`, 'ConfigStore.get');

    while (keys.length) {
      const currentKey = keys.shift();
      if (obj == undefined || currentKey === undefined || isEmpty(currentKey)) {
        localDebug(() => `ConfigStore.get unexpected undefined currentKey.  Exit`, 'ConfigStore.get');
        obj = undefined;
        break;
      }
      localDebug(() => `ConfigStore.get currentKey: ${currentKey}`, 'ConfigStore.get');

      // Array check is expensive as it uses regex.  Only do it if needed
      if (currentKey.includes('[')) {
        const match = this.getArrayCheckRegex.exec(currentKey);
        localDebug(() => `ConfigStore.get search array: ${match}}`, 'ConfigStore.get');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let arrayEntry: any | undefined = undefined;

        if (match && match.length >= 3) {
          const entryKey = match[1];
          try {
            const entryIndex: number = parseInt(match[2]);
            localDebug(() => `ConfigStore.get search array entry on ${entryKey}[${entryIndex}]`, 'ConfigStore.get');

            const arrayResult = obj[entryKey];
            if (isArray(arrayResult)) {
              arrayEntry = arrayResult[entryIndex];
            }
          } catch (err) {
            localDebug(() => `ConfigStore.get error while parsing array for ${entryKey}: ${err}`, 'ConfigStore.get');
          }
        }

        if (arrayEntry === undefined) {
          localDebug(() => `ConfigStore.get fail to find array entry for ${currentKey}`, 'ConfigStore.get');
          obj = undefined;
          break;
        } else {
          obj = arrayEntry;
        }
      } else {
        obj = obj[currentKey];
      }
    }

    return obj;
  }
}

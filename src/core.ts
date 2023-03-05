import * as fs from 'fs';
import * as nodePath from 'path';

import {
    localDebug,
    LoggerFactory, IJson
} from 'jlog-facade';

export const logger = LoggerFactory.getLogger('light-config');


/**
 * Load json from from file system.  If file passed doesn't exists or doesn't ends with .json,
 * return undefined.
 * 
 * @param filepath 
 * @returns 
 */
export function loadJsonFile(filepath: string): IJson | undefined {
    if (!filepath.endsWith('.json')) {
        localDebug(() => `loadJsonFile not loading ${filepath} as it doesn't end with .json`);
        return undefined;
    }

    let loaded: IJson;
    try {
        const content = fs.readFileSync(filepath, {encoding: 'utf8'});
        localDebug(() => `data read: ${content}`);
        loaded = JSON.parse(content);
    } catch(e) {
        logger.error(`Failed to config file ${filepath}`, e as Error);
        return undefined;
    }

    return loaded;
}


/**
 * Read the config file from the ../../etc/${FP8_ENV}/config.json
 */
export function readConfig(
    env?: string, filename?: string
): { configJson: IJson, source?: string, configDir?: string } {
    // Set paths to find the logger.json file
    const fp8env = env ?? process.env.FP8_ENV ?? 'local';
    const configFileName = filename ?? 'config.json';
  
    const paths = [
      nodePath.join('etc', fp8env, configFileName),
      nodePath.join('etc', configFileName),
      nodePath.join('config', fp8env, configFileName),
      nodePath.join('config', configFileName)
    ];
  
    // Return first config found from configured paths
    let source: string | undefined;
    let configDir: string | undefined;
    let configJson: IJson = {};
    for (const path of paths) {
      const absPath = nodePath.resolve(path);
      localDebug(() => `Looking for file ${absPath}`);
        if (fs.existsSync(absPath)) {
            const jsonFile = loadJsonFile(absPath);
            if (jsonFile !== undefined) {
                configJson = jsonFile;
                source = absPath;
                configDir = nodePath.dirname(source);
                logger.info(`Config found and read from ${absPath}`);
                break;
            }
        }
    }
  
    // Return 
    return {configJson, source, configDir};
  }
  
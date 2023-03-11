import * as fs from 'fs';
import * as nodePath from 'path';
import {parse as parseYaml} from 'yaml';

import {
    localDebug,
    LoggerFactory, IJson
} from 'jlog-facade';

export const logger = LoggerFactory.getLogger('light-config');

const DEFAULT_CONFIG_FILE_NAMES = ['app', 'config'];
const DEFAULT_CONFIG_FILE_EXTENSIONS = ['.json', '.yaml'];
const DEFAULT_CONFIG_DIR_NAMES = ['etc', 'config'];

/**
 * Check the config file extension based on DEFAULT_CONFIG_FILE_EXTENSIONS
 *
 * @param filepath 
 * @returns 
 */
function checkConfigFileExtension(filepath: string): boolean {
    let valid = false;
    for (const ext of DEFAULT_CONFIG_FILE_EXTENSIONS) {
        if (filepath.endsWith(ext)) {
            valid = true;
            break;
        }
    }

    if (!valid) {
        localDebug(() => `${filepath} not loaded as extension not one of ${DEFAULT_CONFIG_FILE_EXTENSIONS}`);
    }
    return valid;
}

/**
 * Load json from from file system.  If file passed doesn't exists or doesn't ends with .json,
 * return undefined.
 * 
 * @param filepath 
 * @returns 
 */
export function loadConfigFile(filepath: string): IJson | undefined {
    if (!checkConfigFileExtension(filepath)) {
        return undefined;
    }

    const content = fs.readFileSync(filepath, {encoding: 'utf8'});
    localDebug(() => `data read: ${content}`);

    let loaded: IJson;
    try {
        if (filepath.endsWith('.yaml') || filepath.endsWith('.yml')) {
            loaded = parseYaml(content);
        } else if (filepath.endsWith('.json')) {
            loaded = JSON.parse(content);
        } else {
            // If unexpected extension then just return the content
            loaded = {content};
        }
    } catch(e) {
        logger.error(`Failed to config file ${filepath}`, e as Error);
        return undefined;
    }

    return loaded;
}



/**
 * Generate the config file names to look for based on the internally configured
 * arrays that would result in looking for file in the following pattern:
 * 
 * [app|config].[json|yaml]
 * 
 * If a `filename` is provided, return just that filename
 * 
 * @param filename 
 * @returns 
 */
function generateConfigFiles(filename: string | undefined) {
    const configFiles = [];
    if (filename === undefined) {
        for (const name of DEFAULT_CONFIG_FILE_NAMES) {
            for (const ext of DEFAULT_CONFIG_FILE_EXTENSIONS) {
                configFiles.push(`${name}${ext}`);
            }
        }
    } else {
        configFiles.push(filename);
    }
    return configFiles;
}
  
/**
 * Generate a list of file paths to search for the config file given an env
 * and optionally a file name.  The resulting pattern would be:
 * 
 * ./[etc|config]/[.|${fp8env}]/[app|config].[json|yaml]
 *
 * @param filename 
 * @param fp8env 
 * @returns 
 */
function generateConfigFilesToSearch(fp8env: string, filename: string | undefined) {
    const configFiles = generateConfigFiles(filename);

    // Defind path to search for the config files
    const paths = [];
    for (const dirName of DEFAULT_CONFIG_DIR_NAMES) {
        for (const configFile of configFiles) {
            // Search first for file in FP8_ENV
            paths.push(
                nodePath.join(dirName, fp8env, configFile)
            );

            // Following by file directly under config dir
            paths.push(
                nodePath.join(dirName, configFile)
            );
        }
    }
    return paths;
}



/**
 * Read the config file from the ../../etc/${FP8_ENV}/config.json
 */
export function readConfig(
    env?: string, filename?: string
): { configJson: IJson, source?: string, configDir?: string } {
    // Set paths to find the logger.json file
    const fp8env = env ?? process.env.FP8_ENV ?? 'local';

    // Build the configuration file to look for of pattern ./[etc|config]/[.|${fp8env}]/[app|config].[json|yaml]
    const paths = generateConfigFilesToSearch(fp8env, filename);
  
    // Return first config found from configured paths
    let source: string | undefined;
    let configDir: string | undefined;
    let configJson: IJson = {};
    for (const path of paths) {
      const absPath = nodePath.resolve(path);
      localDebug(() => `Looking for file ${absPath}`);
        if (fs.existsSync(absPath)) {
            const jsonFile = loadConfigFile(absPath);
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

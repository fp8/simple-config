import * as fs from 'fs';
import * as nodePath from 'path';
import * as mustache from 'mustache';
import { parse as parseYaml } from 'yaml';

import {
    localDebug,
    LoggerFactory, IJson
} from 'jlog-facade';

export const logger = LoggerFactory.getLogger('light-config');

const DEFAULT_CONFIG_FILE_NAMES = ['app', 'config'];
const DEFAULT_CONFIG_FILE_EXTENSIONS = ['.json', '.yaml'];
const DEFAULT_CONFIG_DIR_NAMES = ['etc', 'config'];
const DEFAULT_MUSTACHE_TAGS: [string, string] = ['{{', '}}'];

interface IConfigFileReadResult {
    source: string | undefined;
    configDir: string | undefined;
    configJson: IJson;
    templateTagsFound: boolean;
}

interface ILoadConfigResult {
    data: IJson,
    templateTagsFound: boolean;
}

/**
 * Basic options for reading config file
 */
export interface IReadConfigOptions {
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
     * If set, load all config files from the config directory
     */
    loadAll?: boolean;

    /**
     * Define open and closing tag for mustache.  Default to ['{{', '}}']
     */
    templateTags?: [string, string];
}

/**
 * Return the filename trucating the extension
 * 
 * @param source 
 * @returns 
 */
function getFilenameWithoutExtension(source: string) {
    const parts = nodePath.parse(source);
    const primaryName = parts.name;
    return primaryName;
}


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
export function loadConfigFile(filepath: string, templateTags?: [string, string]): ILoadConfigResult | undefined {
    // Make sure that config file to be loaded ends with the expected extension
    if (!checkConfigFileExtension(filepath)) {
        return undefined;
    }

    // templateTags shouldn't ever be undefined
    if (templateTags === undefined) {
        templateTags = DEFAULT_MUSTACHE_TAGS;
    } 

    let data: IJson;
    let templateTagsFound = false;
    try {
        const content = fs.readFileSync(filepath, { encoding: 'utf8' });
        if (content.includes(templateTags[0])) {
            templateTagsFound = true;
        }
        localDebug(() => `data read: ${content}`);

        if (filepath.endsWith('.yaml') || filepath.endsWith('.yml')) {
            data = parseYaml(content);
        } else if (filepath.endsWith('.json')) {
            data = JSON.parse(content);
        } else {
            // If unexpected extension then just return the content
            data = { content };
        }
    } catch (e) {
        logger.error(`Failed to config file ${filepath}`, e as Error);
        return undefined;
    }

    return {
        data, templateTagsFound
    };
}

/**
 * Generate the config file names to look for based on the internally configured
 * arrays that would result in looking for file in the following pattern:
 * 
 * [app|config].[json|yaml]
 * 
 * If a `filename` is provided, return just that filename
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
function generateConfigFilesToSearch(fp8env: string, filename?: string) {
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
 * Read the primary config file based on the FP8_ENV and optional file name
 *
 * @param fp8env 
 * @param filename 
 * @returns 
 */
function readPrimaryConfigFile(fp8env: string, options: IReadConfigOptions): IConfigFileReadResult {
    const filename = options.configFileName;
    const paths = generateConfigFilesToSearch(fp8env, filename);
    let templateTagsFound = false;

    // Return first config found from configured paths
    let source: string | undefined;
    let configDir: string | undefined;
    let configJson: IJson = {};
    for (const path of paths) {
        const absPath = nodePath.resolve(path);
        localDebug(() => `Looking for file ${absPath}`);
        if (fs.existsSync(absPath)) {
            const loadedResult = loadConfigFile(absPath, options.templateTags);
            if (loadedResult !== undefined) {
                configJson = loadedResult.data;
                source = absPath;
                configDir = nodePath.dirname(source);
                templateTagsFound = loadedResult.templateTagsFound;

                logger.info(`Config found and read from ${absPath}`);
                break;
            }
        }
    }
    return { configJson, source, configDir, templateTagsFound};
}

/**
 * Read all the config file in the config directory.  This is to be called after
 * the primary configuration has been read and therefore configDir must exists
 * 
 * @param primaryFile 
 * @param configDir 
 */
function readAllConfigFiles(primaryFile: string, configDir: string, templateTags?: [string, string]): ILoadConfigResult {
    const data: IJson = {};

    const configFiles = fs.readdirSync(configDir);
    let templateTagsFound = false;

    for (const file of configFiles) {
        const configFile = nodePath.join(configDir, file);

        // don't load the primary config file again
        if (configFile.endsWith(primaryFile)) {
            continue;
        }

        // Attempt to load the config file
        const loadedResult = loadConfigFile(configFile, templateTags);
        if (loadedResult !== undefined) {
            const name = getFilenameWithoutExtension(configFile);
            if (loadedResult.templateTagsFound) {
                templateTagsFound = true;
            }
            data[name] = loadedResult.data;
        }
    }

    return {
        data,
        templateTagsFound
    };
}

/**
 * Read the config file with pattern of ./[etc|config]/[.|${fp8env}]/[app|config].[json|yaml].
 * Read all config file in the configDir if options.loadAll is set
 */
export function readConfigFiles(options: IReadConfigOptions): IConfigFileReadResult {
    // Set paths to find the logger.json file
    const fp8env = options.env ?? process.env.FP8_ENV ?? 'local';

    // Build the configuration file to look for of pattern ./[etc|config]/[.|${fp8env}]/[app|config].[json|yaml]
    const { configJson, source, configDir, templateTagsFound } = readPrimaryConfigFile(fp8env, options);

    // Only load all configs if primary config found
    if (options.loadAll === true && source !== undefined && configDir !== undefined) {
        // get the name of primary config file without extension
        const primaryName = getFilenameWithoutExtension(source);

        // Load all other config
        const loadedConfig = readAllConfigFiles(source, configDir, options.templateTags);

        // Add primary config to the configData
        const configData = loadedConfig.data;
        configData[primaryName] = configJson;

        return {
            configJson: loadedConfig.data,
            source, configDir,
            templateTagsFound: templateTagsFound || loadedConfig.templateTagsFound
        };
    } else {
        return {
            configJson,
            source,
            configDir, 
            templateTagsFound
        };
    }
}

/**
 * Read and return the config data
 *
 * @param options 
 * @returns 
 */
export function readConfig(options: IReadConfigOptions): IConfigFileReadResult {
    // Option tags must always exists
    if (options.templateTags === undefined) {
        options.templateTags = DEFAULT_MUSTACHE_TAGS;
    }
    
    /* eslint-disable @typescript-eslint/no-explicit-any */
    /**
     * Set render options:
     * - disable html espace
     * - tags from options.templateTags
     */
    const mustacheOptions: mustache.RenderOptions = {
        escape: (value: any) => value,
        tags: options.templateTags
    };

    const result = readConfigFiles(options);

    // add env variables into data to be loaded for mustache rendering
    result.configJson = Object.assign({}, result.configJson, {'ENV': process.env});

    return result;
}
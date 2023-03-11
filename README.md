# Simple Config Reader

Read the config file from `./[etc|config]/${FP8_ENV}/` directory.  The file can be `[app|config].[json|yaml]`.  Only `.json` and `.yaml` extension are supported.  Any other file extension found or passed will not be loaded.

*Note*: Package under `@fp8` contains Farport Software's specific view on how the code of project is to be organized.

## Usage

Assuming that you have a following configuration file saved in your `./config/app.yaml`:

```yaml
name: database-config
username: user-123
password: password-234
```

Define the following class:

```typescript
class ConfigData {
    name: string;
    username: string;
    password: string;
}
```

Load the config using [ConfigStore](https://fp8.github.io/simple-config/classes/ConfigStore.html):

```typescript
const store = new ConfigStore(ConfigData);
const config = store.data; // would be of type ConfigData

console.log('username: ', config.username);
// output user-123
```

## Config Model

The configuration model's properties can be decorated with [class-validator](https://github.com/typestack/class-validator)
to ensure that config data loaded is indeed thie expected format.
[ConfigStore](https://fp8.github.io/simple-config/classes/ConfigStore.html) raises
[EntityCreationError](https://fp8.github.io/simple-config/classes/EntityCreationError.html) if validation fails.

It is also possible to skip the definition of the config model by returning a generic
[IJson](https://fp8.github.io/jlog-facade/interfaces/IJson.html) and obtain the config value
using the [ConfigStore.get](https://fp8.github.io/simple-config/classes/ConfigStore.html#get) method:

```yaml
name: test-app
db:
    username: user-123
    password: password-234
```

```typescript
const store = new ConfigStore<IJson>();

console.log('username: ', store.get('db.username'));
// output user-123
```

## Config Options

The [IConfigStoreOptions](https://fp8.github.io/simple-config/interfaces/IConfigStoreOptions.html) allow customization on how the config
should be loaded.

#### env

The config file are loaded from `./[etc|config]/${FP8_ENV}/` directory.  This `env` option overrides value from `FP8_ENV` and
search the config from `./[etc|config]/${env}/` directory.

#### configFileName

The primary configuration file name.  This is normally `app.[json|yaml]` or `config.[json|yaml]` but can be specified via
this option.

#### loadAll

If this option is set, all the files from the config directory are loaded.  The logic is:

1. Find the primary config file
1. Load all the supported file from the config directory
1. Append the name of the config file without extension to the config data

Assuming that you have the following files in the config directory:

**app.yaml**:
```yaml
name: yaml-config
```

**device.json**:
```json
{ "id": "id-abc" }
```

The expected loaded config data would be:

```typescript
class ConfigData {
    app: { name: string };
    device: { id: string };
}
```

#### entries

This option allows additinal entries to be added to the config data.  This is useful if you wish
to add secret from vaults to config upon application startup.

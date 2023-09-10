# @fp8/simple-config

## 0.5.1 [2023-09-10]

* Added warning log on validation failure

## 0.5.0 [2023-09-09]

* Added `EntityCreationError.fields` with dot based notation for nested field name for easier
  error message generation by the user.
* [breaking] Renamed `EntityCreationError.details` to `EntityCreationError.rawValidationError`

## 0.4.0 [2023-03-26]

* Added support for mustache templating
* Added support for environmental variable access

## 0.3.0 [2023-03-11]

* Added support for loading of yaml file
* The config file pattern to be loaded is now ./[etc|config]/[.|${fp8env}]/[app|config].[json|yaml]

## 0.2.0 [2023-02-26]

* Initial Release

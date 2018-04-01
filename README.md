# OneSky sync

[![npm version](https://badge.fury.io/js/onesky-sync.svg)](https://www.npmjs.com/package/onesky-sync)

Simple CLI wrapper over [@brainly/onesky-utils](https://github.com/brainly/nodejs-onesky-utils).

## Installation

```bash
npm install -g onesky-sync
```

## Usage

```bash
onesky-sync upload <input> [options]
onesky-sync download <output> [options]
```

##### Common options

| Option       | Required | Default Value | Description                                                                                          |
| ------------ | :------: | ------------- | ---------------------------------------------------------------------------------------------------- |
| `api-key`    |    ✔     |               | Api Key can be obtained on Site Settings page on OneSky                                              |
| `secret`     |    ✔     |               | Secret can also be obtained on Site Settings page on OneSky                                          |
| `project-id` |    ✔     |               | Project ID can be found in the URL `admin/project/dashboard/project/:project-id` on OneSky Dashboard |

You can pass any options from [onesky-utils API](https://github.com/brainly/nodejs-onesky-utils#api)

#### Upload

```bash
onesky-sync upload ./translations/en.json --api-key=111 --secret=111 --project-id=111
onesky-sync upload ./translations/*.json --api-key=111 --secret=111 --project-id=111
```

| Option                   | Required | Default Value        | Description                                                                                                      |
| ------------------------ | :------: | -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `format`                 |          | `HIERARCHICAL_JSON`  | File format. ([list here](https://github.com/onesky/api-documentation-platform/blob/master/reference/format.md)) |
| `content`                |          | From input file      | String with the content of the file                                                                              |
| `keep-strings`           |          | `false`              | Boolean saying if already uploaded strings not present on this file should be deprecated or kept                 |
| `allow-same-as-original` |          | `false`              | Keep the translations that are the same as source text                                                           |
| `language`               |          | `en`                 | Language code                                                                                                    |
| `file-name`              |          | File name from input | Name of translation file                                                                                         |

#### Download

```bash
onesky-sync download ./translations/ --file-name=en.json --language=ru --api-key=111 --secret=111 --project-id=111
onesky-sync download ./translations/ --file-name=en.json --api-key=111 --secret=111 --project-id=111
```

| Option      | Required | Default Value              | Description              |
| ----------- | :------: | -------------------------- | ------------------------ |
| `language`  |          | All available translations | Language code            |
| `file-name` |    ✔     |                            | Name of translation file |

#!/usr/bin/env node

const meow = require("meow");
const oneskySync = require(".");

const cli = meow(
  `
    Usage
      $ onesky-sync upload <input> [options]
      $ onesky-sync download <ouput> [options]
 
    Options
      --api-key         Required
      --secret          Required
      --project-id      Required
      
      Download
        --language
        --file-name     Required
      
      Upload
        --language=en
        --file-name
        --format=HIERARCHICAL_JSON
        --content
        --keep-strings=false
        --allow-same-as-original=false
        
    Example
      $ onesky-sync upload ./translations/*.json --api-key=111 --secret=111 --project-id=111
      $ onesky-sync download ./translations --file-name=en.json --language=ru --api-key=111 --secret=111 --project-id=111
`,
  {
    flags: {
      keepStrings: {
        type: "boolean",
        default: false
      },
      allowSameAsOriginal: {
        type: "boolean",
        default: false
      }
    }
  }
);

const [command, ...files] = cli.input;

oneskySync(command, files, cli.flags);

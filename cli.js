#!/usr/bin/env node

const meow = require("meow");
const oneskySync = require(".");

const cli = meow(
  `
    Usage
      $ onesky-sync upload <input>
      $ onesky-sync download <input>
 
    Options
      --api-key         Required
      --secret          Required
      --project-id      Required
      
      Download
        --file-name
        --language=en
      
      Upload
        --format=HIERARCHICAL_JSON
        --content
        --keep-strings=false
        --allow-same-as-original=false
        
    Example
      $ onesky-sync upload ./translations/en.json --api-key=111 --secret=111 --project-id=111
      $ onesky-sync download ./translations/ru.json --file-name=en.json --language=ru --api-key=111 --secret=111 --project-id=111
`
);

const [command, ...files] = cli.input;

oneskySync(command, files, cli.flags);

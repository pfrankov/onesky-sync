const onesky = require("@brainly/onesky-utils");
const fs = require("fs-extra");
const path = require("path");
const ora = require("ora");

module.exports = function(command, files = [], _options) {
  ({
    upload() {
      if (!files.length) {
        throw new Error("Pass JSON file as an argument to upload");
      }
      if (files.length > 1) {
        throw new Error("Too many files to upload. Expected 1");
      }

      const file = files[0];

      const options = Object.assign(
        {
          language: "en",
          fileName: `${path.parse(file).base}`,
          format: "HIERARCHICAL_JSON",
          content: fs.readFileSync(files[0]).toString(),
          keepStrings: false
        },
        _options
      );

      const spinner = ora(`Uploading \`${options.fileName}\``).start();

      onesky
        .postFile(options)
        .then(data => {
          const { meta, data: { name, language: { code } } } = JSON.parse(data);

          if (meta.status === 201) {
            spinner.succeed(
              `File \`${name}\` for \`${code}\` locale was uploaded successfully`
            );
          }
        })
        .catch(message => {
          spinner.fail(message);
        });
    },
    download() {
      if (!files.length) {
        throw new Error("Pass JSON file as an argument to download");
      }
      if (files.length > 1) {
        throw new Error("Too many files to download. Expected 1");
      }

      const options = Object.assign({}, _options);
      const file = files[0];

      const spinner = ora(`Downloading \`${file}\``).start();

      onesky
        .getFile(options)
        .then(data => {
          return fs.ensureFile(file).then(() => {
            fs.writeFileSync(file, data);

            spinner.succeed(`Downloaded \`${file}\``).stop();
          });
        })
        .catch(message => {
          spinner.fail(message);
        });
    }
  }[command]());
};

const onesky = require("@brainly/onesky-utils");
const fs = require("fs-extra");
const path = require("path");
const ora = require("ora");
const chalk = require("chalk");

function validationError(message) {
  console.error(chalk.bold.red(`✖ ${message}`));
  process.exit(1);
}

function oneSkyErrorMessageHandler(spinner, code, message) {
  spinner.fail(code ? chalk.bold.red(`${code}: `) : "" + chalk.red(message));
  process.exit(1);
}

module.exports = function(command, files = [], _options) {
  if (!_options.apiKey) {
    validationError(
      "--api-key is required. You can obtain it on Site Settings page on OneSky"
    );
  }
  if (!_options.secret) {
    validationError(
      "--secret is required. You can obtain it on Site Settings page on OneSky"
    );
  }
  if (!_options.projectId) {
    validationError(
      "--project-id is required. You will found it in the URL `admin/project/dashboard/project/:project-id` on OneSky"
    );
  }

  ({
    upload() {
      if (!files.length) {
        validationError("Path to uploading file is required");
      }
      if (files.length > 1) {
        validationError("Too many files to upload. Expected 1");
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
        .catch(({ message, code }) => {
          oneSkyErrorMessageHandler(spinner, code, message);
        });
    },

    download() {
      if (!files.length) {
        validationError("Path to downloading file is required");
      }
      if (files.length > 1) {
        validationError("Too many files to download. Expected 1");
      }
      if (!_options.language) {
        validationError("--language code is required for `download`");
      }
      if (!_options.fileName) {
        validationError("--file-name is required for `download`");
      }

      const options = Object.assign({}, _options);
      const file = files[0];

      const spinner = ora(`Downloading \`${file}\``).start();

      onesky
        .getFile(options)
        .then(data => {
          return fs.ensureFile(file).then(() => {
            fs.writeFileSync(file, data);

            spinner.succeed(`Downloaded \`${file}\``);
          });
        })
        .catch(({ message, code }) => {
          oneSkyErrorMessageHandler(spinner, code, message);
        });
    }
  }[command]());
};

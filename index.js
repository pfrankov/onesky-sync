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

      files.forEach(file => {
        const options = Object.assign(
          {
            language: "en",
            fileName: `${path.parse(file).base}`,
            format: "HIERARCHICAL_JSON",
            content: fs.readFileSync(file).toString(),
            keepStrings: false
          },
          _options
        );

        const spinner = ora(`Uploading \`${options.fileName}\``).start();

        onesky
          .postFile(options)
          .then(data => {
            const { meta, data: { name, language: { code } } } = JSON.parse(
              data
            );

            if (meta.status === 201) {
              spinner.succeed(
                `File \`${name}\` for \`${code}\` locale was uploaded successfully`
              );
            }
          })
          .catch(({ message, code }) => {
            oneSkyErrorMessageHandler(spinner, code, message);
          });
      });
    },

    download() {
      if (!files.length) {
        validationError("Path to output directory is required");
      }
      if (files.length > 1) {
        validationError("Too many directories. Expected 1");
      }
      if (!_options.fileName) {
        validationError("--file-name is required for `download`");
      }

      const options = Object.assign({}, _options);
      const file = files[0];

      const langsListPromise = Promise.resolve()
        .then(() => {
          if (!options.language) {
            return Promise.reject();
          }
          return [options.language];
        })
        .catch(() => {
          const downloadingLanguages = ora(
            `Getting language list for \`${options.fileName}\``
          ).start();

          return onesky
            .getLanguages({
              apiKey: options.apiKey,
              secret: options.secret,
              projectId: options.projectId
            })
            .then(response => {
              const { data } = JSON.parse(response);
              downloadingLanguages.succeed();

              return data
                .filter(lang => !lang.is_base_language)
                .map(lang => lang.code);
            })
            .catch(({ message, code }) => {
              oneSkyErrorMessageHandler(downloadingLanguages, code, message);
            });
        });

      Promise.resolve()
        .then(() => langsListPromise)
        .then(langsList => {
          const downloadingSpinner = ora(
            `Downloading translations for \`${options.fileName}\``
          ).start();

          return onesky
            .getMultilingualFile(options)
            .then(response => {
              downloadingSpinner.succeed();

              const translations = JSON.parse(response);
              const translationCodes = Object.keys(translations);

              langsList.forEach(code => {
                const lang = translations[code];
                const ext = path.parse(options.fileName).ext;
                const filename = `${code}${ext}`;
                const filepath = path.join(file, filename);
                const savingSpinner = ora(`Saving \`${filepath}\``).start();

                if (!lang || !lang.translation) {
                  savingSpinner.fail(
                    `There is no translation for \`${code}\` code. Found \`${translationCodes.join(
                      ", "
                    )}\` instead`
                  );
                  return;
                }

                fs
                  .ensureFile(filepath)
                  .then(() => {
                    return fs.writeJson(filepath, lang.translation, {
                      spaces: 2
                    });
                  })
                  .catch(({ message }) => {
                    oneSkyErrorMessageHandler(savingSpinner, null, message);
                  });

                savingSpinner.succeed();
              });
            })
            .catch(({ message, code }) => {
              oneSkyErrorMessageHandler(downloadingSpinner, code, message);
            });
        });
    }
  }[command]());
};

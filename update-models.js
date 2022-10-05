/* eslint-disable @typescript-eslint/no-var-requires */
const { exec } = require("child_process");
const project = require("./project");
const chalk = require("chalk");

// Use ASK CLI to update the interaction model. Takes skill ID from project.js based on <stage> argument given by user
function updateAlexa(stage) {
  return new Promise((resolve, reject) => {
    try {
      console.log(`skillId: ${project.stages[`${stage}`].alexaSkill.skillId}`);
      const skillId = project.stages[`${stage}`].alexaSkill.skillId;
      console.log(chalk.yellow(`Starting Alexa model update\n`));
      console.log(`SKILL ID: ${skillId}\n`);
      exec(
        `ask api update-model  -s ${skillId} -f platforms/alexaSkill/models/en-US.json -l en-US`,
        (error, stdout, stderr) => {
          if (error) {
            if (stderr || error) {
              if (skillId === "") {
                stderr += "\nskillId is undefined in project configuration.";
              }
              if (stderr === "") {
                stderr += error;
              }
              return reject(
                new Error(
                  chalk.red(`Could not update Alexa model: ${stderr}\n`)
                )
              );
            }
          }
          console.log(
            chalk.green(`SUCCESS - Alexa model update accepted.\n`) +
              `${stdout}\n`
          );
          resolve();
        }
      );
    } catch (error) {
      console.log(`ERROR - Error in updateAlexa: ${error}\n`);
    }
  });
}

// Points gcloud CLI at the correct Google project using the service-account-${stage}.json file
function activateServiceAccount(stage) {
  console.log(chalk.yellow(`Starting Google model update\n`));
  return new Promise((resolve, reject) => {
    try {
      exec(
        `gcloud auth activate-service-account --key-file="${
          project.stages[`${stage}`].googleAction.dialogflow.keyFile
        }"`,
        (error, stdout, stderr) => {
          if (error) {
            if (stderr || error) {
              return reject(
                new Error(
                  chalk.red(
                    `Could not activate Google service account: ${stderr}\n`
                  )
                )
              );
            }
          }
          console.log(`Activated Google service account: ${stdout}\n`);
          resolve();
        }
      );
    } catch (error) {
      console.log(`ERROR - Error in activateServiceAccount: ${error}\n`);
    }
  });
}

// Uses Dialgflow V2 API to overwrite entire Google interaction model. Finds correct Google projectId from project.js file based on <stage> argument given by user
async function updateGoogle(stage) {
  return new Promise((resolve, reject) => {
    try {
      const projectId =
        project.stages[`${stage}`].googleAction.dialogflow.projectId;
      console.log(`PROJECT ID: ${projectId}\n`);
      exec(
        `cd platforms/googleAction
            rm dialogflow.zip
            cd dialogflow
            zip -r ../dialogflow.zip *
            cd ..
            curl\
            -X POST "https://dialogflow.googleapis.com/v2/projects/${projectId}/agent:restore" \
            -H "Authorization: Bearer "$(gcloud auth print-access-token) \
            -H "Accept: application/json" \
            -H "Content-Type: application/json" \
            --compressed \
            --data-binary "{
              'agentContent': '$(cat dialogflow.zip | base64 -b 0)'
            }"
            cd ..
            cd ..`,
        (error, stdout, stderr) => {
          if (error) {
            if (stderr || error) {
              return reject(
                new Error(`ERROR - Could not update Google model: ${stderr}\n`)
              );
            }
          }
          console.log(`SUCCESS - Google model update accepted: ${stdout}\n`);
          resolve();
        }
      );
    } catch (error) {
      console.log(`ERROR - Could not run update Google model: ${error}\n`);
    }
  });
}

// Runs the jovo3 build command to turn the jovo3 model into Alexa and Dialogflow models
async function buildModels(stage) {
  return new Promise((resolve, reject) => {
    try {
      exec(`jovo3 build --stage ${stage}`, (error, stdout, stderr) => {
        if (error) {
          if (stderr || error) {
            return reject(
              new Error(
                chalk.red(`ERROR - Could not build jovo3 models: ${stderr}\n`)
              )
            );
          }
        }
        console.log(
          chalk.green(`jovo3 models built successfully:`) + `${stdout}\n`
        );
        resolve(stdout);
      });
    } catch (error) {
      console.log(chalk.red(`ERROR - error in buildModels: ${error}\n`));
    }
  });
}

// Check arguments and run the relevant build and deployment functions
async function updateModels() {
  console.log(
    chalk.yellow(`UPDATE MODELS RUNNING:`) + `\nARGS: ${process.argv}`
  );
  const platform = process.argv[2]; // alexaSkill, googleAction or both
  const stage = process.argv[3]; // local, dev or prod
  console.log(`PLATFORM: ${platform}\nSTAGE: ${stage}\n`);

  const jovo3Models = await buildModels(stage).catch((err) => console.log(err));

  if (
    jovo3Models &&
    (platform === "alexaSkill" || platform === "allPlatforms")
  ) {
    await updateAlexa(stage);
  } else {
    console.log(chalk.yellow("Skipping Alexa model update\n"));
  }
  if (
    jovo3Models &&
    (platform === "googleAction" || platform === "allPlatforms")
  ) {
    await activateServiceAccount(stage);
    await updateGoogle(stage);
  } else {
    console.log(chalk.yellow("Skipping Google model update\n"));
  }
  return console.log("END");
}

updateModels();

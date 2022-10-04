"use strict";
const { App } = require("jovo-framework");
const { Alexa } = require("jovo-platform-alexa");
const { GoogleAssistant } = require("jovo-platform-googleassistant");
const { JovoDebugger } = require("jovo-plugin-debugger");
const { FileDb } = require("jovo-db-filedb");

console.log(
  "This template uses an outdated version of the Jovo Framework. We strongly recommend upgrading to Jovo v4. Learn more here: https://www.jovo.tech/docs/migration-from-v3"
);

// ------------------------------------------------------------------
// APP INITIALIZATION
// ------------------------------------------------------------------
const requestPromise = require("request-promise-native");
const app = new App();

app.use(new Alexa(), new GoogleAssistant(), new JovoDebugger(), new FileDb());

// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------

app.setHandler({
  // 1. LAUNCH intent - ask user what city they want to hear about
  // 2. Setup CityIntent in the interaction model
  //     a. Add 'CityIntent'
  //     b. Add utterences e.g. 'I want {city}'
  //     c. Add the input type 'AMAZON.City'
  //

  LAUNCH() {
    // start
    return this.ask(
      "Welcome to Pollution Checker. What city would you like to know about?"
    );
  },

  async CityIntent() {
    const city = this.$inputs.city.value; // what the user said

    if (city) {
      // check user input exists

      // if city exists, send API request
      const responseData = await getPollutionByCity(city);

      console.log("API response:");
      console.log(responseData);

      return this.tell("Sent API request");
    } else {
      return this.toIntent("Unhandled"); // resolve bar requests
    }

    // this.$session.$data.city = getCity();
    // console.log(this.$session.$data.city);
    // this.tell(this.$session.$data.city);
  },

  MyNameIsIntent() {
    console.log(this.$inputs);
    this.tell("Hey " + this.$inputs.name.value + ", nice to meet you!");
  },
});

async function getPollutionByCity(city) {
  const options = {
    uri: `https://api.waqi.info/feed/${city}/?token=7ff8344281d449b27b5bf04ca3e6fb785c586d65`,
    // https://api.waqi.info/feed/:city/?token=:token
    json: true, // Automatically parses the JSON string in the response
  };
  const data = await requestPromise(options);
  const quote = data.forecast.daily.pm25;

  return quote;
}

// HelloWorldIntent() {
//   this.ask("Hello World! What's your name?", "Please tell me your name.");
// }

// async function getCity() {
//   const options = {
//       uri: 'https://api.waqi.info/feed/here/?token=7ff8344281d449b27b5bf04ca3e6fb785c586d65',
//       json: true // Automatically parses the JSON string in the response
//   };
//   const data = await requestPromise(options);
//   const quote = data.cityName;

//   return quote;
// }

module.exports = { app };

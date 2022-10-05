// ------------------------------------------------------------------
// APP CONFIGURATION
// ------------------------------------------------------------------

module.exports = {
  logging: true,

  intentMap: {
    "AMAZON.StopIntent": "END",
    "AMAZON.City": "CityIntent",
  },

  db: {
    FileDb: {
      pathToFile: "../db/db.json",
    },
  },
};

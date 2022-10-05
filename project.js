// ------------------------------------------------------------------
// JOVO PROJECT CONFIGURATION
// ------------------------------------------------------------------

module.exports = {
  stages: {
    local: {
      alexaSkill: {
        nlu: "alexa",
        skillId: "amzn1.ask.skill.4c330a13-0756-46a3-8689-5dcdc79ff6eb",
        endpoint: "${JOVO_WEBHOOK_URL}",
      },
      googleAction: {
        nlu: "dialogflow",
      },
    },
  },
  endpoint: "${JOVO_WEBHOOK_URL}",
};

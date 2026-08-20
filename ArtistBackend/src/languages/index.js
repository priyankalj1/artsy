const env = require("../../env.js");
const english = require("./lang_eng");

if (env.LANG === "english") {
  module.exports = {
    locale: english,
  };
}

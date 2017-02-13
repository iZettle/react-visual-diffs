const config = require("../models/config")
const utils = require("../utils/utils")
const fs = require("fs-extra")

function warnIfNoMasterScreenshots() {
  try {
    const files = fs.readdirSync(config.get("temp.screenshots.master"))

    if (files.length) {
      utils.infoValue("Found number of master screenshots", files.length)
    } else {
      utils.warn("No master screenshots found")
    }
  } catch (err) {
    utils.warn("No master screenshots found")
  }
}

module.exports = warnIfNoMasterScreenshots

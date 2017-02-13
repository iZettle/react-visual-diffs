const fs = require("fs-extra")
const utils = require("../utils/utils")
const config = require("../models/config")

function cleanTemp({
  build,
  screenshot,
  masterScreenshot,
  diffScreenshot,
  testIndex,
  reports
}) {
  utils.info("Cleaning temp folders")
  if (build) {
    fs.removeSync(config.get("temp.build.path"))
  }

  if (screenshot) {
    fs.removeSync(config.get("temp.screenshots.new"))
  }

  if (masterScreenshot) {
    fs.removeSync(config.get("temp.screenshots.master"))
  }

  if (diffScreenshot) {
    fs.removeSync(config.get("temp.screenshots.diff"))
  }

  if (testIndex) {
    fs.removeSync(config.get("temp.build.testIndex"))
  }

  if (reports) {
    config.get("reporters", []).forEach(reporter => {
      if (reporter.output) {
        fs.removeSync(reporter.output)
      }
    })
  }
}

module.exports = cleanTemp

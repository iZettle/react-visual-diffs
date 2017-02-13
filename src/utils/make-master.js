const fs = require("fs-extra")
const config = require("../models/config")
const cleanTemp = require("../setup/clean-temp")
const utils = require("./utils")

function makeMaster() {
  cleanTemp({ masterScreenshot: true })
  fs.copySync(config.get("temp.screenshots.new"), config.get("temp.screenshots.master"))
  utils.info("Made current screenshots into the new master screenshots")
}

module.exports = makeMaster

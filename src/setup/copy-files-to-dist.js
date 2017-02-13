const fs = require("fs-extra")
const path = require("path")
const utils = require("../utils/utils")
const config = require("../models/config")

function copyFilesToDist() {
  utils.info("Copying dependencies to dist")

  const deps = config.get("templates.mountingHTML.dependencies") ?
    [].concat(config.get("templates.mountingHTML.dependencies")) :
    []

  deps.forEach(file => {
    fs.copySync(
      file,
      path.join(config.get("temp.build.path"), path.basename(file))
    )
  })
}

module.exports = copyFilesToDist

const path = require("path")
const config = require("./../models/config")
const utils = require("./utils")

function shouldSync({ type }, direction) {
  const storeName = config.get("store.adapter.name", undefined)
  if (!storeName) { return false }

  if (direction === "download" && type === "inline") {
    return config.get("store.downloadBeforeTest")
  }

  return true
}

function sync({ type }, direction) {
  if (!shouldSync({ type }, direction)) {
    return
  }
  const storeName = config.get("store.adapter.name", undefined)

  // eslint-disable-next-line global-require
  const store = require(path.join(process.cwd(), "node_modules", storeName))
  // TODO. The above line feels a bit hackish but it's the only way I got it working

  const friendlyDirection = direction === "download"
    ? "Downloading"
    : "Uploading"
  utils.infoValue(`${friendlyDirection} files using`, storeName)

  const screenshotsPath = direction === "download"
    ? config.get("temp.screenshots.master")
    : config.get("temp.screenshots.new")

  return store[direction]({
    screenshotsPath,
    storeConfig: config.get("store.adapter"),
    info: utils.info,
    log: utils.log,
    infoValue: utils.infoValue
  })
}

module.exports = {
  download(props) { return sync(props, "download") },
  upload() { return sync({}, "upload") }
}


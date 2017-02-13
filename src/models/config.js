const deepAssign = require("deep-assign")
const objectPath = require("object-path")

let CONFIG

function setAll(obj) {
  CONFIG = deepAssign({}, obj)
}

function getAll() {
  return deepAssign({}, CONFIG)
}

function get(path, def = "") {
  return objectPath.get(CONFIG, path, def)
}

module.exports = {
  setAll,
  get,
  getAll
}

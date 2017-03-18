const Handlebars = require("handlebars")
const fs = require("fs-extra")
const path = require("path")

const utils = require("./../utils/utils")
const config = require("./../models/config")

function filterAndSortFiles({ files, ext, sortByArray }) {
  const outFiles = files
    .filter(file => path.extname(file).toLowerCase() === ext)

  if (ext === ".css") {
    return outFiles
  }

  return outFiles
    .sort((a, b) => {
      const indexA = sortByArray.findIndex(cur => a.match(cur) !== null)
      const indexB = sortByArray.findIndex(cur => b.match(cur) !== null)

      if (indexB === -1) { return -1 }
      if (indexA === -1) { return 1 }

      if (indexA < indexB) {
        return -1
      } else if (indexA > indexB) {
        return 1
      } else {
        return 0
      }
    })
}

function buildIndexHTML() {
  utils.info("Building index.html")
  const files = fs.readdirSync(config.get("temp.build.path"))
  const sortByArray = config.get("templates.mountingHTML.dependenciesOrder")
  const js = filterAndSortFiles({ files, ext: ".js", sortByArray })
  const css = filterAndSortFiles({ files, ext: ".css" })
    .map(file => fs.readFileSync(path.join(config.get("temp.build.path"), file), "utf8"))
  const source = fs.readFileSync(
    config.get("templates.mountingHTML.index"),
    "utf-8"
  )
  const template = Handlebars.compile(source)
  const html = template({ js, css })

  fs.outputFileSync(path.join(config.get("temp.build.path"), "index.html"), html)
}

module.exports = buildIndexHTML

const glob = require("glob")
const fs = require("fs-extra")
const path = require("path")
const camelCase = require("camelcase")

const config = require("../models/config")
const utils = require("../utils/utils")

function failIfNoTests(files) {
  if (!files.length) {
    utils.error("\nNo properties files found!\n")

    if (config.get("args.filterTests").length) {
      utils.log(`You're only running tests containing the id '${config.get("args.filterTests")}'`)
      utils.log("Maybe widen your filter?\n")
    }

    process.exit(1)
  }
  return files
}

function filterTests(files) {
  if (config.get("args.filterTests").length) {
    const needles = config.get("args.filterTests").split(",")
    return files.filter(file =>
      needles.some(needle => file.id.includes(needle))
    )
  }
  return files
}

/**
 * Search the source code for all test settings files.
 */
function getComponentTestSettings() {
  const src = config.get("files.src")
  const propFilesEnding = config.get("files.propFiles.ending")
  const propFilesExt = config.get("files.propFiles.ext")

  return new Promise((resolve, reject) => {
    glob(`${src}.${propFilesEnding}.@(${[].concat(propFilesExt).join("|")})`,
      { cwd: process.cwd() },
      (err, files) => {
        if (err) {
          reject()
        } else {
          resolve(files)
        }
      })
  })
}

/**
 * Iterate all settings files and extract the filenames
 * (which are later on used to find the corresponding component file)
 */
function getFilenamesPaths(componentTestSettings) {
  return componentTestSettings.map(componentFilename => {
    const paths = path.parse(componentFilename)
    return {
      path: paths.dir,
      componentSettingFiles: paths.name + paths.ext,
      fileNoExt: paths.name.replace(
        new RegExp(`\\.${config.get("files.propFiles.ending")}$`, "i"),
        ""
      ),
      root: process.cwd()
    }
  })
}

/**
 * Iterate the list of all test settings files and search the directory
 * for matching component files and extend the object with that component
 * file.
 *
 * Throw away all test files which does not have a corresponding
 * component file.
 */
function extendWithComponentFilenames(files) {
  return files.map(file => {
    file.componentFileExt = [].concat(config.get("files.componentFiles.ext")).find(ext =>
      fs.existsSync(`${path.join(file.path, file.fileNoExt)}.${ext}`)
    )
    return file
  })
  .filter(file => file.componentFileExt)
}

/**
 * Create a unique ID for all components
 */
function extendWithComponentIds(files) {
  return files.map(file => {
    file.id = camelCase(
      path.join(
        file.path,
        file.fileNoExt
      )
      .replace(new RegExp(path.sep, "g"), "-"))
    return file
  })
}

/**
 * Extend file object with full path to component file
 */
function extendWithComponentPathFull(files) {
  return files.map(file => {
    file.componentPathFull = `${path.join(
      file.root,
      file.path,
      file.fileNoExt
    )}.${file.componentFileExt}`
    file.componentPath = `${path.join(file.path, file.fileNoExt)}.${file.componentFileExt}`
    return file
  })
}

function getTestSettings() {
  return getComponentTestSettings()
  .then(getFilenamesPaths)
  .then(extendWithComponentFilenames)
  .then(extendWithComponentIds)
  .then(extendWithComponentPathFull)
  .then(filterTests)
  .then(failIfNoTests)
}

module.exports = getTestSettings

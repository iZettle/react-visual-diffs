const path = require("path")
const sharp = require("sharp")
const webdriver = require("selenium-webdriver")
const utils = require("./../utils/utils")
const config = require("./../models/config")
const tests = require("./../models/tests")
const mapSeries = require("promise-map-series")
const camelCase = require("camelcase")

const By = webdriver.By
const WEBSERVER_HOST = "http://0.0.0.0"
const CLEAR_IMAGE = sharp(path.join(__dirname, "./clear.png"))

let firstRunOnBrowser = false

function browserWait({ driver, wait = 3000 }) {
  return driver.wait(new Promise(resolve => {
    setTimeout(() => {
      resolve(true)
    }, wait)
  }))
}

function browserGetPixelDensity({ driver }) {
  return driver.executeScript("return window.devicePixelRatio")
}

function browserGetNumberOfVariants({ driver, id }) {
  return driver.executeScript(`
    return JSON.stringify(window.vtest.props.${id}, function(key, value) {
      if (typeof value === "function") {
        return "[function]"
      }
      return value
    })`
  )
}

function browserSetZoomLevel({ driver }) {
  return driver.executeScript(
    `body = document.getElementsByTagName("html")[0]
    body.style["transform-origin"] = "top left"
    body.style["transform"] = "scale(2)"`
  )
}

function getShouldEmulateRetina({ driver }) {
  if (!config.get("screenshots.emulateRetina")) {
    return false
  }
  return Promise.resolve()
    .then(() => browserGetPixelDensity({ driver }))
    .then(pixelDensity => pixelDensity !== 2)
}

function emulateRetina({ driver, shouldEmulateRetina }) {
  if (!shouldEmulateRetina) {
    return false
  }
  return browserSetZoomLevel({ driver })
    .then(() => true)
}

function browserRenderReact({ driver, reactId, renderElement, variantIndex }) {
  utils.log(`   [${variantIndex}] ${reactId}`)
  const execStr = `ReactDOM.render(
      React.createElement(
        window.vtest.utils.ComponentWrapper(
          window.vtest.components.${reactId},
          window.vtest.props.${reactId},
          ${variantIndex},
          window.vtest.utils.DefaultContext
      )),
      document.getElementById('${renderElement}')
     )`

  if (config.get("args.verbose")) {
    utils.log(execStr)
  }
  return driver.executeScript(execStr)
}

function browserScroll({ driver, scrollTo, wait, shouldEmulateRetina }) {
  if (!shouldEmulateRetina) {
    return
  }
  driver.executeScript(`window.scroll(${scrollTo}, 0)`)
  return driver.wait(new Promise(resolve => {
    setTimeout(() => {
      resolve(true)
    }, wait)
  }))
}

function getElementDimensions({ driver, screenshotElement }) {
  return driver.findElement(By.id(screenshotElement))
    .then(element => {
      const out = { left: 0, top: 0, width: 0, height: 0 }
      return element.getLocation()
        .then(location => {
          out.left = location.x
          out.top = location.y
        })
        .then(() => element.getSize())
        .then(size => {
          out.width = size.width
          out.height = size.height
        })
        .then(() => out)
    })
}

function cropImage({ image, elementDimensions, trim, shouldEmulateRetina }) {
  if (trim || shouldEmulateRetina) {
    return sharp(image)
      .trim(1)
      .toBuffer()
  } else {
    return sharp(image)
      .extract(elementDimensions)
      .toBuffer()
  }
}

function writeImage({ image, filePath }) {
  return sharp(image)
    .toFile(filePath)
}

function takeScreenshot({ driver }) {
  return driver.takeScreenshot()
    .then(data => Buffer.from(data, "base64"))
}

/**
 * Take Emulated Retina Screenshot
 */
function takeEmulatedRetinaScreenshot({
  resolution, image, driver, shouldEmulateRetina, scrollWait
}) {
  if (!shouldEmulateRetina) { return image }

  let gImage2
  let gImage1Metadata

  return Promise.resolve()
    .then(() => {
      sharp(image)
        .metadata()
        .then(metadata => { gImage1Metadata = metadata })
    })
    .then(() => browserScroll({
      driver,
      shouldEmulateRetina,
      scrollTo: resolution.width,
      wait: scrollWait
    }))
    .then(() => takeScreenshot({ driver }))
    .then(image2 => { gImage2 = image2 })
    .then(() =>
      CLEAR_IMAGE
        .resize(resolution.width * 2, gImage1Metadata.height)
        .toBuffer()
    )
    .then(combinedImage =>
      sharp(combinedImage)
        .overlayWith(image, { gravity: sharp.gravity.northwest })
        .toBuffer()
    )
    .then(combinedImage =>
      sharp(combinedImage)
        .overlayWith(gImage2, { gravity: sharp.gravity.northeast })
        .toBuffer()
    )
}

/**
 * Take and modify screenshot
 */
function runComponentVariant({
  spec,
  browser,
  resolution,
  driver,
  variant,
  variantIndex,
  shouldEmulateRetina,
  variantName,
  scaleFactor
}) {
  const friendlyVariant = variantName === variantIndex
    ? `v${variantIndex}`
    : `v${variantIndex}_${camelCase(variantName)}`
  const friendlySize = `${resolution.width}x${resolution.height}`
  const screenshotFilename = `${spec.id}-${friendlyVariant}-${friendlySize}-${browser}.png`
  let elementDimensions
  return Promise.resolve()
    .then(() => {
      if (firstRunOnBrowser && config.get("screenshots.browserFirstTestWait")) {
        firstRunOnBrowser = false
        return browserWait({
          driver,
          wait: config.get("screenshots.browserFirstTestWait")
        })
      }
      return true
    })
    .then(() => getElementDimensions({
      driver,
      screenshotElement: config.get("templates.mountingHTML.screenshotElement")
    }))
    .then(dims => { elementDimensions = dims })
    .then(() => browserScroll({
      driver,
      scrollTo: 0,
      wait: config.get("screenshots.scrollWait"),
      shouldEmulateRetina
    }))
    .then(() => takeScreenshot({ driver }))
    .then(image => takeEmulatedRetinaScreenshot({
      resolution,
      driver,
      shouldEmulateRetina,
      image,
      scrollWait: config.get("screenshots.scrollWait")
    }))
    .then(image => cropImage({
      image,
      elementDimensions,
      shouldEmulateRetina,
      trim: config.get("screenshots.trim")
    }))
    .then(image => {
      writeImage({
        image,
        filePath: path.join(config.get("temp.screenshots.new"), screenshotFilename)
      })
      return image
    })
    .then(image => sharp(image).metadata())
    .then(imageMetadata => ({
      screenshotFilename,
      browser,
      resolution,
      shouldEmulateRetina,
      variantName,
      variant: variantIndex,
      imageMetadata: {
        scaleFactor,
        width: imageMetadata.width,
        height: imageMetadata.height
      },
      spec: Object.assign({}, spec, {
        componentSetting: variant
      })
    }))
}

/**
 * Render React component
 */
function runComponent({ spec, browser, resolution, driver, shouldEmulateRetina, scaleFactor }) {
  return Promise.resolve()
    .then(() => browserGetNumberOfVariants({ driver, id: spec.id }))
    .then(variants => [].concat(JSON.parse(variants)))
    .then(variants => mapSeries(
      variants,
      (variant, variantIndex) =>
        Promise.resolve()
          .then(() => browserRenderReact({
            driver,
            variantIndex,
            reactId: spec.id,
            renderElement: config.get("templates.mountingHTML.renderElement")
          }))
          .then(() => runComponentVariant({
            spec,
            browser,
            resolution,
            driver,
            variant,
            variantIndex,
            shouldEmulateRetina,
            scaleFactor,
            variantName: variant.name || variantIndex
          }))
      )
    )
    .then(out => out.reduce((a, b) => a.concat(b), []))
}

/**
 * Iterate over all tests
 */
function runTests({ specs, browser, resolution, driver, shouldEmulateRetina, scaleFactor }) {
  return mapSeries(
    specs,
    spec => runComponent({
      spec,
      browser,
      resolution,
      driver,
      shouldEmulateRetina,
      scaleFactor
    })
  )
  .then(out => out.reduce((a, b) => a.concat(b), []))
}

/**
 * Set resolution
 */
function runResolution({ specs, browser, resolution, driver, shouldEmulateRetina, scaleFactor }) {
  return Promise.resolve()
    .then(() => driver.manage().window().setSize(resolution.width, resolution.height))
    .then(() => runTests({ specs, browser, resolution, driver, shouldEmulateRetina, scaleFactor }))
}

/**
 * Spin up a browser,
 * check if we should emulate retina, and,
 * iterate over all resolutions
 */
function runBrowser({ specs, browser }) {
  const driver = new webdriver.Builder()
    .forBrowser(browser)
    .usingServer(config.get("selenium.host"))
    .build()

  let scaleFactor = 1
  let shouldEmulateRetina = false

  firstRunOnBrowser = true

  return Promise.resolve()
    .then(() => driver.get(`${WEBSERVER_HOST}:${config.get("webServer.port")}`))
    .then(() => getShouldEmulateRetina({ driver }))
    .then(emRetina => { shouldEmulateRetina = emRetina })
    .then(() => emulateRetina({ driver, shouldEmulateRetina }))
    .then(() => {
      if (shouldEmulateRetina) {
        scaleFactor = 2
      }
      return browserGetPixelDensity({ driver })
        .then(pixelDensity => {
          scaleFactor = pixelDensity
        })
    })
    .then(() => [].concat(config.get("screenshots.matrix.resolutions")))
    .then(resolutions => mapSeries(
      resolutions,
      resolution => runResolution({
        specs,
        browser,
        resolution,
        driver,
        shouldEmulateRetina,
        scaleFactor
      })
    ))
    .then(out => out.reduce((a, b) => a.concat(b), []))
    .then(ret => {
      driver.quit()
      return ret
    })
}

/**
 * Iterate over all browsers
 */
function seleniumRunner() {
  utils.info("Taking screenshots")
  return utils.createDir({ path: config.get("temp.screenshots.new") })
    .then(() => [].concat(config.get("screenshots.matrix.browsers")))
    .then(browsers => mapSeries(
      browsers,
      browser => runBrowser({ specs: tests.get(), browser })
    ))
    .then(out => out.reduce((a, b) => a.concat(b), []))
}

module.exports = seleniumRunner

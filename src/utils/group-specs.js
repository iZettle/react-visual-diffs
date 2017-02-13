const config = require("./../models/config")

/**
 * Take flat array of tests and return a nested array
 * ready to be used by reporters
 */
function group(specs) {
  function getUniqueComponents() {
    return specs
      .map(spec => spec.spec.id)
      .filter((id, index, thisArray) => thisArray.indexOf(id) === index)
      .sort()
  }

  function getUniqueVariants({ componentId }) {
    return specs
      .filter(spec => spec.spec.id === componentId)
      .map(spec => spec.variantName)
      .filter((id, index, thisArray) => thisArray.indexOf(id) === index)
  }

  function getTest({ componentId, resolution, variantName }) {
    return specs
      .filter(spec => spec.spec.id === componentId)
      .filter(spec => spec.variantName === variantName)
      .filter(spec => spec.resolution.width === resolution.width)
      .filter(spec => spec.resolution.height === resolution.height)
  }

  function getSpecByComponent({ id }) {
    return specs.filter(spec => spec.spec.id === id)
  }

  function getSpecByVariant({ id, variantName }) {
    return getSpecByComponent({ id })
      .filter(spec => spec.variantName === variantName)
  }

  function getSpecByResolution({ id, variantName, resolution }) {
    return getSpecByVariant({ id, variantName })
      .filter(spec => spec.resolution.width === resolution.width)
      .filter(spec => spec.resolution.height === resolution.height)
  }

  return getUniqueComponents().map(id => {
    const variants = getUniqueVariants({ componentId: id })
      .map(variantName => ({
        name: variantName,
        passTest: getSpecByVariant({ id, variantName }).every(spec => spec.passTest),
        resolutions: [].concat(config.get("screenshots.matrix.resolutions")).map(resolution => ({
          id: `${resolution.width}x${resolution.height}`,
          passTest: getSpecByResolution({ id, variantName, resolution })
            .every(spec => spec.passTest),
          screenshots: getTest({
            variantName,
            resolution,
            componentId: id
          })
        }))
      }))
    return {
      id,
      passTest: getSpecByComponent({ id }).every(spec => spec.passTest),
      variants
    }
  })
}

module.exports = group

/**
 * This is a sample React Context file.
 *
 * The exported object will be set as React Context on all components,
 * unless the component test definition file has either:
 * 1) context: false
 * or
 * 2) context { ... a custom context for just this component }
 */

const React = require("react")

module.exports = {
  types: {
    getProps: React.PropTypes.func
  },
  values: {
    getProps() {
      return {
        settings: {
          htmlId: "id"
        }
      }
    }
  }
}

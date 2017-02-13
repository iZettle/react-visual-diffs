import React from "react"

function isArray(maybeArray) {
  return Object.prototype.toString.call(maybeArray) === "[object Array]"
}

function getContext(props, defaultContext) {
  if (Object.prototype.hasOwnProperty.call(props, "context")) {
    if (props.context === false) {
      return null
    }
    return props.context
  }
  return Object.keys(defaultContext).length ? defaultContext : null
}

function Wrapper(Comp, props, variantIndex, defaultContext) {
  const curProps = isArray(props) ? props[variantIndex] : props
  const context = getContext(curProps, defaultContext)
  class ComponentWrapper extends React.Component {
    getChildContext() {
      return context ? context.values : {}
    }

    render() {
      return React.createElement(Comp, curProps.props)
    }
  }

  ComponentWrapper.childContextTypes = context ? context.types : {}

  return ComponentWrapper
}

export default Wrapper

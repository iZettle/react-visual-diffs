# React Visual Diffs (proper name TBA)

No-config-needed* visual regression testing of React components

## Key features

* No or minimimal configuration is needed
* Renders your React components separate from each other, screenshots and compares the screenshots with master screenshots.
* Uses _real_ browsers (Selenium under the hood)
* Bring your own Webpack config. Uses the same Webpack config as you're using to build your project, no need to create a separate test config.

## Quick quide

1. Install package: `yarn add https://github.com/iZettle/react-visual-diffs.git`
2. Add VTest to package.json: `"scripts": { "vtest": "vtest" }`
3. Create a test file
4. run tests: `yarn vtest`

## Installation

Download

```
yarn add https://github.com/iZettle/react-visual-diffs.git
```

Add VTest to your `package.json` to start it easily

```
"scripts": {
	"vtest": "vtest"
}
```

Install Selenium dependencies

```
yarn vtest --update
```

## Create a test

A _test file_ is a file defining which properties a React component should be rendered with. E.g a Button component may have the props "label" and "onClick" and the test file defines those two properties.

### Create test file

Imaging that your file structure looks like this:

```
- Components
  |- Button
  |  |- Button.jsx
  |- Card
  |  |- Card.jsx
```

Then to create a test, just create a new `<componenFilename>.vtest.js` or `<componenFilename>.vtest.json` file as a sibling to the component you want to test, e.g:

```
- Components
  |- Button
  |  |- Button.jsx
  |  |- Button.vtest.js
  |- Card
  |  |- Card.jsx
```

### Test file content

* Either a Javascript file with an export or a JSON file.
* Can be a single export of props or an array of props
* No matter if it's a single collection of props or an array of collections, the property `name` _may_ be added which is used by reporters to display a friendly name

#### Simple example
The test file (`Button.vtest.js`) _must_ export an object with the `props` property. These are the React props the component under test is being in invoced with.

```
module.exports = {
  name: "Simple button",
  props: {
    onClick: () => {},
    label: "Click me!"
  }
}
```

#### Example with Javascript
As this is a ordinary Javascript file (which will get compiled with the Webpack config you already have in your project) you can use whatever Javascript you want, e.g:

```
const React = require("react")
const SomeComponent = require("SomeComponent")

const onClick = () => {}

module.exports = {
  props: {
    onClick,
    children: SomeComponent
  }
}
```

#### JSON Example
For React components which do only need JSON data types (Number, String, Boolean, etc) you can create the test file as a JSON, e.g.

```
{
  "props": {
    label: "Click me!"
  }
}
```

#### Array example
Many times you want to test a few different sets of properties. E.g. in our button, we might want to test it with blue background, with longer text and with an icon. Then export an array of property sets.

```
const Icon = require("Icon")

module.exports = [{
  name: "Simple button",
  props: {
    onClick: () => {},
    label: "Click me!",
    bg: "blue"
  }
}, {
  name: "Longer text",
  props: {
    onClick: () => {},
    label: "A few words which will cause a line break"
  }
}, {
  name: "With icon",
  props: {
    onClick: () => {},
    label: "Click me!"
    icon: <Icon icon="cancel" />
  }
}]
```

## Configuration

For the very simplest of setups, no configuration is needed. If you want to do slightly more advanced things, such as defining which browsers and/or resolutions are to be tested, you need to create a config file. To do this, create `vtest.conf.js`, in your project root directory. Here's a simple example of a configuration file:

```
module.exports = {
  screenshots: {
    matrix: {
      browsers: [
        "safari",
        "chrome"
      ],
      resolutions: [
        { width: 1200, height: 1000 },
        { width: 600, height: 400 }
      ]    
    }
  }
}
```

To see all configuration paramaters, take a look at the [default settings file](TODO). Your settings will be _merged_ with the default setttings. 

## How it all works
1. Search source code directory for `<component>.vtest.js` files.
2. For every `<component>.vtest.js` file found, look for a `<component>.js`/`jsx` file. This is the actual React component file.
3. Clean temp folder.
4. If started with `--download-before` argument, download master screenshots (screenshots the new screensshots are to be compared against) from the store (such as S3).
5. Create an index.js file which imports all components which are found in step 2. This is the file which are going to feeded as the entry file to Webpack.

## CLI Args

```
    -h, --help                          output usage information
    -V, --version                       output the version number
    -c, --config <path>                 set path to config file
    -t, --test <test,test>              test(s) to run
    -p, --reporter <reporter,reporter>  filter reporters(s) to run, e.g. 'console'
    -b, --browser <browser,browser>     filter browser(s) to run, e.g. 'chrome'
    -r, --resolution <res,res>          filter resolution(s) to run, e.g. '1200x800'
    -v, --verbose                       verbose console output
    -d, --download-before               download master screenshots before running tests
    --upload                            upload new screenshots and quit
    --make-master                       make current screenshots into master and quit
    --update-selenium                   update selenium and browser drivers    
```    


## Webpack config

Your Webpack config (set in `build.webpackConfig`) is left intact with a few exceptions. The config is modified for the VTester to be able to do its job. This is what's merged into your Webpack config

```
{
  entry: {
    main: [
      CONFIG.build.webpackEntryMain, // May be array
      CONFIG.temp.build.testIndex
    ]
  },

  output: {
    path: CONFIG.temp.build.path,
    libraryTarget: "var",
    library: "vtest"
  },

  externals: {
    react: "React",
    "react-dom": "ReactDOM"
  }
}
```

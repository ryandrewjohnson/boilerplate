# webpack-boilerplate

A snapshot of my typical `webpack` setup for a project. More for personal use, but I've also commented the shit 💩 
out of this thing for anyone interested. Also hoping to drive some conversation/feedback on how this can be 
improved.

## Included

* **webpack.config.js** - The main config file that drives the app
* **package.json** - A mock package.json that contains typical "scripts" commands I use to run this setup.

## package.json scripts

* **profile:(dev|prod)** - Webpack will generate a stats.json file that can then be fed into this [tool](https://webpack.github.io/analyse/) to analyze bundles.
* **start:dev** - For local development - will start webpack-dev-server with Hot Module Replacement.
* **start:prod** - Test a production build locally in webpack-dev-server.
* **build:dev** - Build a dev version of app. Key differences being that code will be unminified.
* **prebuild** - Cleans out old build before new build
* **build** - Production build of the app.



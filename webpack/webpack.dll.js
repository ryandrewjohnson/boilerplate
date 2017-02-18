import webpack from 'webpack';
import { resolve } from 'path';

/**
 * This breaks out the vendor files into a separate file that drastically
 * speeds up webpack dev builds. See the link below for details.
 * http://engineering.invisionapp.com/post/optimizing-webpack/
 */
export default () => {
  return {
    context: '.',
    entry: {
      vendor:[
        'react',
        'react-dom',
        'react-router',
        'react-redux',
        'redux',
        'redux-thunk',
        'redux-form',
        'moment',
        'axios',
        'classnames'
      ]
    }, 
 
    output: { 
      filename: '[name].dll.js', 
      path: './src/vendor', 
      library: '[name]'
    }, 

    resolve: {
      modules: [
        resolve(__dirname, 'node_modules')
      ]
    },
  
    plugins: [ 
      new webpack.DllPlugin({ 
        name: '[name]', 
        path: './src/vendor/[name].json' 
      }),
      new webpack.optimize.UglifyJsPlugin()
    ]
  }
}
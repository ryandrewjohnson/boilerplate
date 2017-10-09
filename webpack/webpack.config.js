import webpack from 'webpack';
import { resolve } from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import { getIfUtils, removeEmpty } from 'webpack-config-utils';
import autoprefixer from 'autoprefixer';

/**
 * I'm in the camp of keeping all config in a single file.
 * This webpack config is setup to handle multiple environments, 
 * more specifically "PROD" and "DEV" in this example. I make use of 
 * a great package of utils called "webpack-config-utils".
 * 
 * If you require more info I have written an article detailing this setup:
 * https://medium.com/@ryandrewjohnson/one-webpack-config-to-rule-them-all-environments-that-is-277457769779
 */
export default env => {
  const { ifProd, ifNotProd } = getIfUtils(env);
  return {
    cache: ifNotProd(),
    // ------------------------------------
    // Entry Points
    // ------------------------------------
    entry: {
      app: [
        'babel-polyfill',         // https://babeljs.io/docs/usage/polyfill/
        'app.js'                  // main entry point for my React app
      ]

      /**
       * I don't have a vendor entry because I use CommonChunksPlugin
       * to automatically gather vendor scripts. 
       * See Plugins section...
       */
    },

    // ------------------------------------
    // Devtool
    // ------------------------------------
    // IfProd use full on source-maps, for dev use quick and dirty source maps
    devtool: ifProd('source-map', 'cheap-eval-source-map'),

    // ------------------------------------
    // Resolve
    // ------------------------------------
    resolve: {
      extensions: ['.js', '.jsx', '.json'],
      modules: [
        resolve(__dirname, 'src'),
        resolve(__dirname, 'node_modules')
      ]
    },

    // ------------------------------------
    // Output
    // ------------------------------------
    output: {
      filename: ifProd('[name].bundle.[chunkhash].js', '[name].bundle.js'),
      path: resolve(__dirname, 'dist'),
      publicPath: '/'
    },

    // ------------------------------------
    // Devserver
    // ------------------------------------
    devServer: {
      historyApiFallback: true,
      stats: {
        // I turn off chunkModules logging as I find it just muddies the build output in conole
        // See https://github.com/webpack/webpack-dev-server/issues/68
        chunkModules: false  
      },
      port: 3080,
      proxy: {
        '/api': {
          pathRewrite: {'^/api' : ''},
          target: 'http://localhost:3000',
          secure: false
        }
      }
    },

    // ------------------------------------
    // Module
    // ------------------------------------
    module: {
      rules: removeEmpty([
         /**
         * // JS loader
         * Run all .js files through babel
         */
        { 
          test: /\.js(x?)$/, 
          loaders: [ 'babel-loader' ], 
          exclude: /node_modules/ 
        },

        /**
         * // CSS
         * css-loader - for css modules
         * postcss-loader - for autoprefix
         * sass-loader - for sass support
         */
        {
          test: /\.scss$/,
          exclude: /node_modules/,
          loader: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
                options: {
                  modules: true,
                  localIdentName: '[name]__[local]___[hash:base64:5]',
                  importLoaders: 1,
                  minimize: {
                    mergeLonghand: false
                  }
                }
              },
              {
                loader: 'postcss-loader',
                options: {
                  sourceMap: true,
                  plugins: (loader) => [
                    require('autoprefixer')(),
                  ]
                }
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: true,
                  includePaths: [resolve(__dirname, 'src/styles')]
                }
              }
            ]
          })
        },

        /**
         * Handles loading any image files with url-loader. Meaning any
         * files within the 'limit' size will be embedded directly into 
         * the file. 
         * 
         * These images will live in the /assets/images in /dist directory.
         */
        {
          test: /\.(png|svg|jpg|gif)$/,
          loader: 'url-loader',
          options: {
            name: './assets/images/[name]-[hash].[ext]',
            limit: 100000
          }
        },

        /**
         * Handles loading any web font files.
         * Since font files can be .svg I made sure to explicitly include 
         * the fonts folder to avoid aciddentally catching .svg images.
         * 
         * These images will live in the /assets/fonts directory in /dist directory.
         */
        {
          test: /\.(woff|woff2|eot|ttf|svg)$/,
          include: [resolve(__dirname, 'src/assets/fonts')],
          loader: 'url-loader',
          options: {
            name: './assets/fonts/[name]-[hash].[ext]',
            limit: 100000
          }
        }       
      ]) 
    },

    // ------------------------------------
    // Plugins
    // ------------------------------------
    plugins: removeEmpty([
      /**
       * Shows a nice lil progress bar while for your webpack builds
       * 
       * See https://www.npmjs.com/package/progress-bar-webpack-plugin
       */
      new ProgressBarPlugin(),

      /**
       * Creates a bundle for vendor files
       * NOTE: This assumes your vendor imports exist in the node_modules directory
       */
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: function (module) {
          return module.context && module.context.indexOf('node_modules') !== -1;
        }
      }),

      /**
       * Creates a bundle for just the runtime code
       * see https://webpack.js.org/guides/code-splitting-libraries/#manifest-file
       */
      new webpack.optimize.CommonsChunkPlugin({ 
        name: 'manifest'
      }),
      
      /**
       * Takes care of inserting all the necessary <scripts> and <styles> into the app'sass
       * index.html entry point.
       * 
       * See https://github.com/jantimon/html-webpack-plugin
       */
      new HtmlWebpackPlugin({
        template: resolve(__dirname, 'src/index.html')
      }),

      /**
       * Moves our CSS into external files instead of jamming everything into <style> tag
       * 
       * See https://github.com/webpack-contrib/extract-text-webpack-plugin
       */
      new ExtractTextPlugin({
        filename: './css/[name]-[hash].css',
        allChunks: true
      }),

      // This informs certain dependencies e.g. React that they should be compiled for prod
      // see https://github.com/facebook/react/issues/6479#issuecomment-211784918
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: ifProd('"production"', '"development"')
        }
      }),

      ifProd(new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: true
      })),

      /**
       * Uglify
       */
      ifProd(new webpack.optimize.UglifyJsPlugin({
        compress: {
          screw_ie8: true,
          warnings: false
        },
        sourceMap: true
      }))
    ])
  }
}
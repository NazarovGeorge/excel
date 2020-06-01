const path = require('path');
const webpack = require('webpack');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const postcssNormalize = require('postcss-normalize');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const PATHS = {
  APP_PATH: path.resolve(__dirname, '.'),
  APP_HTML: path.resolve(__dirname, 'public/index.html'),
  APP_SRC: path.resolve(__dirname, 'src'),
  APP_PUBLIC: path.resolve(__dirname, 'public'),
  APP_ENTRY: path.resolve(__dirname, 'src/index.ts'),
  DIST_PATH: path.resolve(__dirname, 'dist'),
  PUBLIC_PATH: process.env.PUBLIC_PATH || '/',
};

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = !isDevelopment;

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: {
    app: [PATHS.APP_ENTRY],
  },
  output: {
    path: PATHS.DIST_PATH,
    filename: isProduction
      ? 'static/js/[name].[contenthash:8].js'
      : 'static/js/bundle.js',
    chunkFilename: isProduction
      ? 'static/js/[name].[contenthash:8].chunk.js'
      : 'static/js/[name].chunk.js',
    publicPath: PATHS.PUBLIC_PATH,
  },
  optimization: {
    minimize: isProduction,
    minimizer: [new TerserPlugin(), new OptimizeCssAssetsPlugin()],
    splitChunks: {
      chunks: 'all',
      name: false,
    },
    runtimeChunk: {
      name: (entrypoint) => `runtime-${entrypoint.name}`,
    },
  },
  resolve: {
    alias: {
      '@src': `${PATHS.APP_SRC}/`,
      '@core': `${PATHS.APP_SRC}/actions/`,
      '@components': `${PATHS.APP_SRC}/components/`,
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.module.scss'],
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: ['ts-loader'],
      },
      {
        test: /\.(scss|sass)$/,
        exclude: /\.module\.(scss|sass)$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 3,
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => [
                require('postcss-flexbugs-fixes'),
                require('postcss-preset-env')({
                  autoprefixer: {
                    flexbox: 'no-2009',
                  },
                  stage: 3,
                }),
                postcssNormalize(),
              ],
              sourceMap: true,
            },
          },
          {
            loader: 'resolve-url-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.module\.(scss|sass)$/,
        loader: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 3,
              modules: {
                localIdentName: isDevelopment
                  ? '[path][name]__[local]'
                  : '[hash:base64]',
              },
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => [
                require('postcss-flexbugs-fixes'),
                require('postcss-preset-env')({
                  autoprefixer: {
                    flexbox: 'no-2009',
                  },
                  stage: 3,
                }),
                postcssNormalize(),
              ],
              sourceMap: true,
            },
          },
          {
            loader: 'resolve-url-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|svg|gif|webp)$/,
        loader: 'file-loader',
        options: {
          name: 'static/media/[name].[hash:8].[ext]',
        },
      },
      {
        test: /\.(ttf|woff|woff2|eot)$/,
        loader: 'file-loader',
        options: {
          name: 'static/media/[name].[hash:8].[ext]',
        },
      },
    ],
  },
  devtool: isDevelopment ? 'source-map' : 'cheap-module-source-map',
  devServer: {
    contentBase: PATHS.APP_PATH,
    clientLogLevel: 'warning',
    historyApiFallback: {
      disableDotRule: true,
    },
    hot: isDevelopment,
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: PATHS.APP_HTML,
      minify: {
        removeComments: isProduction,
        collapseWhitespace: isProduction,
        removeRedundantAttributes: isProduction,
        useShortDoctype: isProduction,
        removeEmptyAttributes: isProduction,
        removeStyleLinkTypeAttributes: isProduction,
        keepClosingSlash: isProduction,
        minifyJS: isProduction,
        minifyCSS: isProduction,
        minifyURLs: isProduction,
      },
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: PATHS.APP_PUBLIC,
          to: PATHS.DIST_PATH,
        },
      ],
    }),
    isDevelopment && new webpack.HotModuleReplacementPlugin(),
    isProduction &&
      new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash:8].css',
        chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
      }),
    isProduction && new BundleAnalyzerPlugin(),
  ].filter(Boolean),
};

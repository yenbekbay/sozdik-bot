const path = require('path');

module.exports = {
  webpack: (config, {env}) => {
    /* eslint-disable no-param-reassign */
    config.entry.main = path.resolve(__dirname, 'src/main.js');
    config.devtool = env === 'production' ? false : 'inline-source-map';
    config.module.rules = config.module.rules.map(
      rule =>
        rule.loader === 'babel-loader'
          ? {
              test: rule.test,
              exclude: rule.exclude,
              use: [
                {
                  loader: require.resolve('cache-loader'),
                  options: {
                    cacheDirectory: path.resolve(__dirname, '.cache-loader'),
                  },
                },
                {
                  loader: require.resolve('babel-loader'),
                  options: {
                    babelrc: false,
                    presets: [
                      [
                        'env',
                        {
                          targets: {
                            node: '8.0',
                          },
                          modules: false,
                        },
                      ],
                      'flow',
                    ],
                    plugins: [
                      'transform-class-properties',
                      [
                        'transform-object-rest-spread',
                        {
                          useBuiltIns: true,
                        },
                      ],
                      'lodash',
                      [
                        'module-resolver',
                        {
                          alias: {
                            src: './src',
                          },
                        },
                      ],
                    ],
                    cacheDirectory: false,
                  },
                },
              ],
            }
          : rule // eslint-disable-line prettier/prettier
    );
    /* eslint-enable no-param-reassign */

    return config;
  },
};

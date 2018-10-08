var path = require('path');

const contextPropNames = [
  'playlist',
  'activeTrackIndex',
  'trackLoading',
  'paused',
  'currentTime',
  'seekPreviewTime',
  'seekInProgress',
  'awaitingResumeOnSeekComplete',
  'duration',
  'bufferedRanges',
  'playedRanges',
  'seekableRanges',
  'volume',
  'muted',
  'shuffle',
  'stalled',
  'playbackRate',
  'setVolumeInProgress',
  'repeatStrategy',
  'pipeVideoStreamToCanvas',
  'onTogglePause',
  'onSelectTrackIndex',
  'onBackSkip',
  'onForwardSkip',
  'onSeekPreview',
  'onSeekComplete',
  'onSetVolume',
  'onSetVolumeComplete',
  'onToggleMuted',
  'onToggleShuffle',
  'onSetRepeatStrategy',
  'onSetPlaybackRate',
  'fullscreen',
  'requestFullscreen',
  'requestExitFullscreen'
];

module.exports = {
  sections: [
    {
      name: '@cassette/core',
      description:
        '**`@cassette/core`** provides [React Context](https://reactjs.org/docs/context.html)-based components which expose an API for consuming and updating media player state. The API abstraction maps very closely to the set of actions that would be available to an end user of a conventional media player, while remaining flexible enough to accommodate varying media player design paradigms.',
      sections: [
        {
          name: 'Provider Components',
          components: 'packages/core/src/[A-Z]*.js'
        },
        {
          name: 'Consuming Context',
          content: 'packages/core/src/consuming-context.md',
          sections: [
            {
              name: 'FullscreenContextConsumer',
              description:
                'Used to read and update the state of the surrounding [`fullscreenContext`](#fullscreencontext)'
              // TODO: add content
              // content: ''
            },
            {
              name: 'PlayerContextConsumer',
              description:
                'Used to read and update the state of the surrounding [`playerContext`](#playercontext)'
              // TODO: add content
              // content: ''
            },
            {
              name: 'playerContextFilter',
              description:
                'consumes the surrounding [`fullscreenContext`](#fullscreencontext) and [`playerContext`](#playercontext) and passes only a specified subset of the context, as well as any additional props, to the given child component'
              // TODO: add content
              // content: ''
            }
          ]
        },
        {
          name: 'fullscreenContext',
          sections: []
        },
        {
          name: 'playerContext',
          sections: []
        }
      ]
    },
    {
      name: '@cassette/components',
      description:
        '**`@cassette/components`** contains some convenient React component building blocks which can be used in media player user interfaces created with [`@cassette/core`](#cassettecore).',
      sections: [
        {
          name: 'Components',
          components: 'packages/components/src/[A-Z]*.js'
        }
      ]
    },
    {
      name: '@cassette/player',
      description:
        '**`@cassette/player`** provides a responsive, zero-config-needed React media player component, implemented with [`@cassette/core`](#cassettecore). Its control components can also be consumed directly.',
      sections: [
        {
          name: 'Player Components',
          components: 'packages/player/src/[A-Z]*.js'
        },
        {
          name: 'Control Components',
          components: 'packages/player/src/controls/[A-Z]*.js'
        }
      ]
    }
  ],
  webpackConfig: {
    resolve: {
      extensions: ['.js', '.jsx'],
      alias: {
        '@cassette/core': path.join(__dirname, 'packages/core/src'),
        '@cassette/components': path.join(__dirname, 'packages/components/src'),
        '@cassette/player': path.join(__dirname, 'packages/player/src')
      }
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { modules: false, loose: true }],
                '@babel/react'
              ],
              plugins: ['@babel/plugin-proposal-object-rest-spread']
            }
          }
        },
        {
          test: /\.scss$/,
          use: ['css-loader', 'postcss-loader', 'sass-loader']
        }
      ]
    },
    devtool: 'source-map',
    optimization: {
      noEmitOnErrors: true,
      minimize: false
    }
  },
  ignore: [
    '**/ShuffleManager.js',
    '**/PlayerPropTypes.js',
    '**/PlayerContext.js',
    '**/GroupContext.js',
    '**/FullscreenContext.js',
    '**/ButtonWrapper.js',
    '**/SkipButton.js',
    '**/MediaStatusBar.js'
  ],
  usageMode: 'expand',
  propsParser(filePath, source, resolver, handlers) {
    const parsed = require('react-docgen').parse(source, resolver, handlers);
    for (const p of parsed) {
      for (const key of Object.keys(p.props || {})) {
        if (contextPropNames.indexOf(key) !== -1) {
          delete p.props[key];
        }
      }
      if (p.props && Object.keys(p.props).length === 0) {
        delete p.props;
      }
    }
    return parsed;
  },
  handlers(componentPath) {
    return require('react-docgen').defaultHandlers.concat(
      require('react-docgen-external-proptypes-handler')(componentPath),
      require('react-docgen-displayname-handler').createDisplayNameHandler(
        componentPath
      )
    );
  }
};

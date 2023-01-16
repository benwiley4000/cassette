/* globals React, PropTypes, ExampleBeforeTrackChangeContextProvider, ExampleMediaPlayer, ExampleMediaInfo */

// eslint-disable-next-line no-unused-vars
function ExampleBeforeTrackChange(props) {
  const onBeforeTrackChange = p => {
    // Always skip second track
    return p.index === 2 ? { ...p, index: 3, track: props.playlist[3] } : p;
  };
  return React.createElement(
    React.StrictMode,
    {},
    React.createElement(
      ExampleBeforeTrackChangeContextProvider,
      {
        playlist: props.playlist,
        onBeforeTrackChange: onBeforeTrackChange
      },
      React.createElement(ExampleMediaPlayer),
      React.createElement(ExampleMediaInfo)
    )
  );
}

ExampleBeforeTrackChange.propTypes = {
  playlist: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  onBeforeTrackChange: PropTypes.func
};

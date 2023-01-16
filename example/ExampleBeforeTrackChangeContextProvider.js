/* globals React, cassetteCore, PropTypes */

// eslint-disable-next-line no-unused-vars
class ExampleBeforeTrackChangeContextProvider extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return React.createElement(
      cassetteCore.PlayerContextProvider,
      {
        playlist: this.props.playlist,
        autoplay: true,
        defaultMuted: false,
        defaultShuffle: false,
        crossOrigin: 'anonymous',
        onBeforeTrackChange: this.props.onBeforeTrackChange
      },
      this.props.children
    );
  }
}

ExampleBeforeTrackChangeContextProvider.propTypes = {
  playlist: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  onBeforeTrackChange: PropTypes.func,
  children: PropTypes.node.isRequired
};

/* globals React, cassetteCore, PropTypes */

// eslint-disable-next-line no-unused-vars
class ExamplePlayerContextProvider extends React.Component {
  constructor(props) {
    super(props);
    this.handleStateSnapshot = this.handleStateSnapshot.bind(this);
    this.initialStateSnapshot = JSON.parse(
      localStorage.getItem('media_player_snapshot')
    );
  }

  handleStateSnapshot(snapshot) {
    localStorage.setItem('media_player_snapshot', JSON.stringify(snapshot));
  }

  render() {
    return React.createElement(
      cassetteCore.PlayerContextProvider,
      {
        playlist: this.props.playlist,
        autoplay: true,
        defaultMuted: true,
        defaultShuffle: false,
        crossOrigin: 'anonymous',
        initialStateSnapshot: this.initialStateSnapshot,
        onStateSnapshot: this.handleStateSnapshot
      },
      this.props.children
    );
  }
}

ExamplePlayerContextProvider.propTypes = {
  playlist: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  children: PropTypes.node.isRequired
};

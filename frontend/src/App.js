import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { connect } from 'react-redux';
import { backendGetIpAddressesRequestAction, backendPutSkipToNextSongRequestAction, backendGetCurrentSongRequestAction, backendPutSkipToNextAlbumRequestAction, backendPutStopMusicRequestAction, backendPutStartMusicRequestAction, backendPutReloadLibraryRequestAction } from './redux/backendMiddleware';
import PropTypes from 'prop-types';
import ControlButton from './common/ControlButton';

class App extends Component {

  static propTypes = {
    ipAddresses: PropTypes.object,
    currentSong: PropTypes.object,
    isMusicPlaying: PropTypes.bool.isRequired,
  };

  componentDidMount() {
  }

  renderCurrentSong() {
    if (this.props.currentSong) {
      return <div>
        {this.props.isMusicPlaying ? <span /> : <div>MUSIC STOPPED!<br /></div>}
        Song: {this.props.currentSong.song.song}<br />
        Album: {this.props.currentSong.song.album}<br />
        Play time: {this.props.currentSong.song.time_playing}
      </div>;
    } else {
      return <div>No information about current song available.</div>;
    }
  }

  renderIpAddresses() {
    const addr = [];
    if (this.props.ipAddresses) {
      for (let a of Object.values(this.props.ipAddresses)) {
        addr.push(<div key={a}>{a}</div>);
      }
    }

    return <div>IP Addresses: &nbsp;
      {
        addr
      }
    </div>;
  }

  renderButtons() {
    const buttons = [];
    buttons.push(<ControlButton label="Skip to next song" action={putSkipToNextSong(this.props.dispatch)} isActive={this.props.isMusicPlaying} key="next-song" />);
    buttons.push(<ControlButton label="Skip to next album" action={putSkipToNextAlbum(this.props.dispatch)} isActive={this.props.isMusicPlaying} key="next-album" />);
    buttons.push(<ControlButton label="Stop music" action={putStopMusic(this.props.dispatch)} isActive={this.props.isMusicPlaying} key="stop-music" />);
    buttons.push(<ControlButton label="Start music" action={putStartMusic(this.props.dispatch)} isActive={!this.props.isMusicPlaying} key="start-music" />);
    return <div>{buttons}</div>
  }

  scheduleRefreshingCurrentSong() {
    const refreshCurrentSong = () => {
      this.props.dispatch(backendGetCurrentSongRequestAction);
    };
    const tenSeconds = 10 * 1000;
    setTimeout(refreshCurrentSong, tenSeconds);
  }

  render() {
    if (this.props.currentSong) {
      this.scheduleRefreshingCurrentSong();
    }
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">node-dj control</h1>
        </header>
        {this.renderIpAddresses()}
        <hr />
        {this.renderCurrentSong()}
        <p className="App-intro">
        </p>
        {this.renderButtons()}
      </div>
    );
  }
}

const putSkipToNextSong = (dispatch) => () => {
  dispatch(backendPutSkipToNextSongRequestAction);
};

const putSkipToNextAlbum = (dispatch) => () => {
  dispatch(backendPutSkipToNextAlbumRequestAction);
};

const putStopMusic = (dispatch) => () => {
  dispatch(backendPutStopMusicRequestAction);
};

const putStartMusic = (dispatch) => () => {
  dispatch(backendPutStartMusicRequestAction);
};

const putReloadLibrary = (dispatch) => () => {
  dispatch(backendPutReloadLibraryRequestAction);
};

let mapStateToPropsCounter = 0;
const mapStateToProps = (state, props) => {
  mapStateToPropsCounter++;
  const isPlaying = state.global.currentSong ? state.global.currentSong.song.isPlaying : false;
  const newProps = { ipAddresses: state.global.ipAddresses, currentSong: state.global.currentSong, isMusicPlaying: isPlaying };
  console.log("mapStateToProps", mapStateToPropsCounter, newProps);
  return newProps;
}

const mapDispatchToProps = dispatch => {
  dispatch(backendGetIpAddressesRequestAction);
  dispatch(backendGetCurrentSongRequestAction);
  return { dispatch: dispatch };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);

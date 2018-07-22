import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { connect } from 'react-redux';
import { backendGetIpAddressesRequestAction, backendPutSkipToNextSongRequestAction, backendGetCurrentSongRequestAction, backendPutSkipToNextAlbumRequestAction } from './redux/backendMiddleware';
import PropTypes from 'prop-types';
import ControlButton from './common/ControlButton';

class App extends Component {

  static propTypes = {
    ipAddresses: PropTypes.object
  };

  static baseUrl = "http://localhost:3001";

  componentDidMount() {
  }

  renderCurrentSong() {
    let song = this.props.currentSong ? this.props.currentSong.song.song + " ==> " + this.props.currentSong.song.album : "(no information received)";
    return <div>Current Song: {song}</div>;
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
    buttons.push(<ControlButton label="Skip to next song" action={putSkipToNextSong(this.props.dispatch)} key="next-song" />);
    buttons.push(<ControlButton label="Skip to next album" action={putSkipToNextAlbum(this.props.dispatch)} key="next-album" />);
    return <div>{buttons}</div>
  }

  render() {
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

let mapStateToPropsCounter = 0;
const mapStateToProps = (state, props) => {
  mapStateToPropsCounter++;
  const newProps = { ipAddresses: state.global.ipAddresses, currentSong: state.global.currentSong };
  console.log("mapStateToProps", mapStateToPropsCounter, newProps);
  return newProps;
}

const mapDispatchToProps = dispatch => {
  dispatch(backendGetIpAddressesRequestAction);
  dispatch(backendGetCurrentSongRequestAction);
  return { dispatch: dispatch };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);

import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { connect } from 'react-redux';
import { backendGetIpAddressesRequestAction, backendPutSkipToNextSongRequestAction } from './redux/backendMiddleware';
import PropTypes from 'prop-types';
import ControlButton from './common/ControlButton';

class App extends Component {

  static propTypes = {
    ipAddresses: PropTypes.object
  };

  static baseUrl = "http://localhost:3001";

  componentDidMount() {
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
    buttons.push(<ControlButton label="Next" action={putSkipToNextSong(this.props.dispatch)} key="next" />);
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

let mapStateToPropsCounter = 0;
const mapStateToProps = (state, props) => {
  mapStateToPropsCounter++;
  console.log("mapStateToProps", mapStateToPropsCounter);
  return { ipAddresses: state.global.ipAddresses };
}

const mapDispatchToProps = dispatch => {
  dispatch(backendGetIpAddressesRequestAction);
  return { dispatch: dispatch };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);

import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { connect } from 'react-redux';
import { backendGetIpAddressesRequestAction } from './redux/backendMiddleware';

class App extends Component {

  baseUrl = "http://localhost:3001";
  props = {};

  componentDidMount() {
  }

  renderIpAddresses() {
    const addr = [];
    if (this.props.ipAddresses) {
      for (let a of Object.values(this.props.ipAddresses)) {
        addr.push(a);
      }
    }

    return <div>IP Addresses: &nbsp;
      {
        addr
      }
    </div>;
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
      </div>
    );
  }
}

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

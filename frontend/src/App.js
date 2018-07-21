import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {

  baseUrl = "http://localhost:3001";

  componentDidMount() {
    fetch(this.baseUrl + "/api/ip-addresses").then(function (response) {
      response.json().then(function (obj) {
        console.log("Received", obj);
      })
    });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">node-dj control</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { createStore, applyMiddleware } from "redux";
import { rootReducer } from "./reducers/reducer";
import { Provider } from 'react-redux';
import { asyncDispatchMiddleware } from './redux/backendMiddleware';

const store = createStore(rootReducer, applyMiddleware(asyncDispatchMiddleware));

ReactDOM.render(<Provider store={store}><App /></Provider>, document.getElementById('root'));
registerServiceWorker();

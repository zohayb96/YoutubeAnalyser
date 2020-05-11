// Page acts as main routing point for main page application
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import history from './history';
import store from './store';
import App from './app';
import './socket';

ReactDOM.render(
  // Wrapping store allows redux state management to be accessible across the app
  <Provider store={store}>
    {/*  Wrapping with history gives react router access to browser history implemented in (history.js) */}
    <Router history={history}>
      <App />
    </Router>
  </Provider>,
  document.getElementById('app')
);

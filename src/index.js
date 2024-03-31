import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Header from './layout/Header'
import Footer from './layout/Footer'
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from 'react-router-dom';

ReactDOM.render(
  <Router>
    <Header />
    <App />
    <Footer />
  </Router>,
  document.getElementById('root')
);

reportWebVitals();

import React from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter as Router} from 'react-router-dom'
import App from './App'
import config from './config'
import 'open-iconic/font/css/open-iconic-bootstrap.css'
import './app.css'

console.log(config) // eslint-disable-line

const appElement = document.getElementById('app-root')

ReactDOM.render((
  <Router basename={'/_docs/'}>
    <App />
  </Router>
), appElement)

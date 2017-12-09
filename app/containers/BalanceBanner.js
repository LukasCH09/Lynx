import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import glob from 'glob';
import Wallet from '../utils/wallet';

import { traduction } from '../lang/lang';

const request = require('request-promise-native');
const homedir = require('os').homedir();
const fs = require('fs');
const event = require('../utils/eventhandler');

const { ipcRenderer } = require('electron');

const lang = traduction();
const wallet = new Wallet();

export default class Sidebar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="balancebanner">
        <p>THIS IS THE BANNER!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1</p>
      </div>
    );
  }
}

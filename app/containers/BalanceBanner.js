import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import glob from 'glob';
import Wallet from '../utils/wallet';
import { traduction } from '../lang/lang';
const request = require('request-promise-native');
const fs = require('fs');
const event = require('../utils/eventhandler');
const lang = traduction();
const wallet = new Wallet();

export default class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state  = {
      currentECC: 0,
      pendingECC: 0,
      unconfirmedECC: 0,
      stakeECC: 0,
    };
  }

  componentDidMount() {
    this.setTimerFunctions();
  }
  componentWillUnmount() {
    clearInterval(this.timerInfo);
  } 


  setTimerFunctions() {
    const self = this;
    self.timerInfo = setInterval(() => {
      self.getWalletInfo();
    }, 5000);
  }

  getWalletInfo() {
    const self = this;
    this.setState({ requesting1: true });
    wallet.getInfo().then((data) => {
      self.setState({
        currentECC: data.balance,
        stakeECC: data.stake,
      });
      event.emit('hide');
    }).catch((err) => {
      if (self.state.requesting1 && err.message !== 'Method not found') {
        if (err.message !== 'Loading block index...' && err.message !== 'connect ECONNREFUSED 127.0.0.1:19119') {
          event.emit('animate', err.message);
        }
        self.setState({
          currentECC: 0,
          unconfirmedECC: 0,
          stakeECC: 0,
        });
      }
    });
  }

  render() {
    return (
      <div className="balancebanner">
        <div className="row">
          <div className="col-md-12">
            <div className="panel panel-default">
              <div className="panel-body">
                <div className="col-lg-4 col-xs-6 col-md-4">
                  <p className="subtitle">{lang.overviewMyBalance}:</p>
                  <p className="borderBot">
                    <span className="desc">{this.state.currentECC}</span>
                    <span className="desc2">ecc</span>
                  </p>
                </div>
                <div className="col-lg-4 col-xs-6 col-md-4">
                  <p className="subtitle">{lang.overviewMyStaking}:</p>
                  <p className="borderBot">
                    <span className="desc">{this.state.stakeECC}</span>
                    <span className="desc2">ecc</span>
                  </p>
                </div>
                <div className="col-lg-4 col-xs-6 col-md-4">
                  <p className="subtitle">{lang.overviewTotal}:</p>
                  <p className="borderBot">
                    <span className="desc">{this.state.stakeECC + this.state.currentECC}</span>
                    <span className="desc2">ecc</span>
                  </p>
                </div>
                <div className="col-lg-4 col-xs-6 col-md-4">
                  <p className="subtitle">{lang.overviewMyUnconfirmed}:</p>
                  <p className="borderBot">
                    <span className="desc">{this.state.unconfirmedECC}</span>
                    <span className="desc2">ecc</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import glob from 'glob';
import WalletWrapper from '../utils/walletwrapper';
import { traduction } from '../lang/lang';
const request = require('request-promise-native');
const fs = require('fs');
const event = require('../utils/eventhandler');
const lang = traduction();;

export default class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state  = {
      balance: 0,
      unconfirmed: 0,
      stake: 0,
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
    results = WalletWrapper.getStateValues('balance', 'stake', 'unconfirmed');
    for( var key in results){
        console.log(key, dictionary[key]);
        self.setState({
            key : results[key],
        });
    }
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
                    <span className="desc">{this.state.balance}</span>
                    <span className="desc2">ecc</span>
                  </p>
                </div>
                <div className="col-lg-4 col-xs-6 col-md-4">
                  <p className="subtitle">{lang.overviewMyStaking}:</p>
                  <p className="borderBot">
                    <span className="desc">{this.state.stake}</span>
                    <span className="desc2">ecc</span>
                  </p>
                </div>
                <div className="col-lg-4 col-xs-6 col-md-4">
                  <p className="subtitle">{lang.overviewMyUnconfirmed}:</p>
                  <p className="borderBot">
                    <span className="desc">{this.state.unconfirmed}</span>
                    <span className="desc2">ecc</span>
                  </p>
                </div>
                <div className="col-lg-4 col-xs-6 col-md-4">
                  <p className="subtitle">{lang.overviewTotal}:</p>
                  <p className="borderBot">
                    <span className="desc">{this.state.stake + this.state.balance + this.state.unconfirmed}</span>
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

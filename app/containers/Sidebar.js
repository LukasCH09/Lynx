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
    this.state = {
      starting: false,
      running: false,
      stopping: false,
      staking: false,
      pathname: props.route.location.pathname,
      active: {
        default: '',
        send: '',
        receive: '',
        transactions: '',
        about: '',
        wallet: '',
      },
      icons: {
        default: '',
        send: '',
        receive: '',
        transactions: '',
        about: '',
        wallet: '',
      },
      currentHeight: 0,
      headers: 0,
      numpeers: 0,
      daemonInstalled: false,
      newVersionAvailable: false,
    };

    this.saveAndStopDaemon = this.saveAndStopDaemon.bind(this);
    this.startDaemon = this.startDaemon.bind(this);
    this.checkDaemonVersion = this.checkDaemonVersion.bind(this);
  }

  componentDidMount() {
    const self = this;
    this.checkStateMenu(this.state.pathname);
    this.infoUpdate();
    this.timerInfo = setInterval(() => {
      self.infoUpdate();
    }, 5000);
    this.timerCheckDaemonVersion = setInterval(() => {
      this.checkDaemonVersion();
    }, 600000);

    this.checkDaemonVersion();

    ipcRenderer.once('daemon-version-updated', (e, err) => {
      this.checkDaemonVersion();
    });
  }

  componentWillReceiveProps(props) {
    // console.log(props.router.location.pathname);
    this.checkStateMenu(props.route.location.pathname);
    this.setState({ pathname: props.route.location.pathname });
  }

  componentWillUnmount() {
    clearInterval(this.timerInfo);
    clearInterval(this.timerCheckDaemonVersion);
  }

  infoUpdate() {
    const self = this;
    wallet.getblockcount().then((height) => {
      self.setState({currentHeight: height});
    }).catch((error) => {
      self.setState({currentHeight: 0});
    });

    wallet.getpeerinfo().then((peers) => {
      self.setState({numpeers: peers.length});
    }).catch((error) => {
      self.setState({numpeers: 0});
    });

    wallet.getInfo().then((data) => {
      this.setState(() => {
        return {
          headers: data.headers,
          staking: data.staking,
        };
      });

      if (data && this.state.starting) {
        event.emit('animate', 'Block index loaded...');
        this.setState(() => {
          return {
            starting: false,
            running: true,
          };
        }, () => {
          event.emit('hide');
        });
      } else if (data && !this.state.running) {
        this.setState(() => {
          return {
            starting: false,
            running: true,
          };
        });
      }
    }).catch((err) => {
      if (err.message === 'connect ECONNREFUSED 127.0.0.1:19119') {
        if (this.state.stopping) {
          this.setState(() => {
            return {
              stopping: false,
              running: false,
            };
          });
          event.emit('hide');
        }
        if (!this.state.starting) {
          glob(`${homedir}/.eccoin-daemon/Eccoind*`, (error, files) => {
            if (!files.length) {
              event.emit('show', 'Install daemon via Downloads tab.');
              this.setState(() => {
                return {
                  daemonInstalled: false,
                };
              });
            } else if (files.length) {
              event.emit('show', 'Daemon not running.');
              this.setState(() => {
                return {
                  daemonInstalled: true,
                  running: false,
                };
              });
            } else {
              event.emit('show', err.message);
            }
          });
        }
      } else {
        event.emit('show', err.message);
      }
    });
  }

  checkDaemonVersion() {
    const path = `${homedir}/.eccoin-daemon`;

    fs.access(`${path}/daemon-version.txt`, (err) => {
      if (err) {
        console.log(err);
        this.setState(() => {
          return {
            newVersionAvailable: true,
          };
        });
      } else {
        fs.readFile(`${path}/daemon-version.txt`, 'utf8', (err, data) => {
          if (err) {
            throw err;
          } else {
            const version = data.split(' ')[1];

            const opts = {
              url: 'https://api.github.com/repos/Greg-Griffith/eccoin/releases/latest',
              headers: {
                'User-Agent': 'request',
              },
            };
            request(opts)
              .then((response) => {
                const path = `${homedir}/.eccoin-daemon`;
                const parsed = JSON.parse(response);
                const githubVersion = parsed.name.split(' ')[1];
                if (version !== githubVersion) {
                  console.log('NOT EQUAL');
                  this.setState(() => {
                    return {
                      newVersionAvailable: true,
                    };
                  });
                } else {
                  this.setState(() => {
                    return {
                      newVersionAvailable: false,
                    };
                  });
                }
              })
              .catch(error => console.log(error));
          }
        });
      }
    });
  }

  checkStateMenu(pathname) {
    const aLinks = this.state.active;
    const aIcons = this.state.icons;

    aLinks.default = '';
    aLinks.send = '';
    aLinks.receive = '';
    aLinks.transactions = '';
    aLinks.security = '';
    aLinks.about = '';
    aLinks.settings = '';

    aIcons.default = require('../../resources/images/overview1.ico');
    aIcons.send = require('../../resources/images/send1.ico');
    aIcons.receive = require('../../resources/images/receive1.ico');
    aIcons.transactions = require('../../resources/images/trans1.ico');
    aIcons.security = require('../../resources/images/backup1.ico');
    aIcons.about = require('../../resources/images/about1.ico');
    aIcons.settings = require('../../resources/images/settings1.ico');

    if (pathname === '/') {
      aLinks.default = 'sidebaritem_active';
      aIcons.default = require('../../resources/images/overview2.ico');
    } else if (pathname === '/send'){
      aLinks.send = 'sidebaritem_active';
      aIcons.send = require('../../resources/images/send2.ico');
    } else if (pathname === '/receive') {
      aLinks.receive = 'sidebaritem_active';
      aIcons.receive = require('../../resources/images/receive2.ico');
    } else if (pathname === '/transaction') {
      aLinks.transactions = 'sidebaritem_active';
      aIcons.transactions = require('../../resources/images/trans2.ico');
    } else if (pathname === '/security') {
      aLinks.security = 'sidebaritem_active';
      aIcons.security = require('../../resources/images/backup2.ico');
    } else if (pathname === '/about') {
      aLinks.about = 'sidebaritem_active';
      aIcons.about = require('../../resources/images/about2.ico');
    } else if (pathname === '/settings') {
      aLinks.settings = 'sidebaritem_active';
      aIcons.settings = require('../../resources/images/settings2.ico');
    } 

    this.setState({ active: aLinks, icons: aIcons });
  }

  renderRectRound(opt) {
    if (opt === this.state.pathname) {
      return (
        <div className="rectround" />
      );
    }
    return null;
  }

  saveAndStopDaemon() {
    if (process.platform.indexOf('win') > -1) {
      event.emit('animate', 'Stopping daemon...');
    }
    this.setState(() => {
      return {
        stopping: true,
      };
    });
    wallet.walletstop()
      .then(() => {
        this.setState(() => {
          return {
            starting: false,
            staking: false,
          };
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  startDaemon() {
    this.setState(() => {
      return {
        starting: true,
      };
    });
    event.emit('show', 'Starting daemon...');
    wallet.walletstart((result) => {
      if (result) {
        event.emit('hide');
        event.emit('show', 'Loading block index...');
      } else {
        this.setState(() => {
          return {
            starting: false,
          };
        });
        event.emit('show', 'Daemon is not in correct directory.');
      }
    });
  }

  render() {
    let progressBar = 0;
    if (this.state.currentHeight !== 0 && this.state.headers !== 0) {
      progressBar = (this.state.currentHeight / this.state.headers) * 100;
    }

    if (progressBar >= 100 && this.state.currentHeight < this.state.headers) {
      progressBar = 99.99;
    }

    const usericon = require('../../resources/images/logo1.png');
    return (
      <div className="sidebar">
        <div className="userimage">
          <img src={usericon} />
        </div>
        <ul className="sidebarlist">
          <div className={`sidebaritem ${this.state.active.default}`}>
            <Link to="/" className={this.state.active.default}>
              <img className="sidebaricon" src={this.state.icons.default} />
              {lang.navBarOverviewButton}
            </Link>
            {this.renderRectRound('/')}
          </div>
          <div className={`sidebaritem ${this.state.active.send}`}>
            <Link to="/send" className={this.state.active.send}>
              <img className={'sidebaricon'} src={this.state.icons.send} />
              {lang.navBarSendButton}
            </Link>
            {this.renderRectRound('/send')}
          </div>
          <div className={`sidebaritem ${this.state.active.receive}`}>
            <Link to="/receive" className={this.state.active.receive}>
              <img className="sidebaricon" src={this.state.icons.receive} />
              {lang.navBarReceiveButton}
            </Link>
            {this.renderRectRound('/receive')}
          </div>
          <div className={`sidebaritem ${this.state.active.transactions}`}>
            <Link to="/transaction" className={this.state.active.transactions}>
              <img className="sidebaricon" src={this.state.icons.transactions} />
              {lang.navBarTransactionsButton}
            </Link>
            {this.renderRectRound('/transaction')}
          </div>
          <div className={`sidebaritem ${this.state.active.security}`}>
            <Link to="/security" className={this.state.active.security}>
              <img className="sidebaricon" src={this.state.icons.security} />
              {lang.navBarSecurityButton}
            </Link>
            {this.renderRectRound('/security')}
          </div>
          <div className={`sidebaritem ${this.state.active.about}`}>
            <Link to="/about" className={this.state.active.about}>
              <img className="sidebaricon" src={this.state.icons.about} />
              {lang.navBarAboutButton}
            </Link>
            {this.renderRectRound('/about')}
          </div>
          <div className={`sidebaritem ${this.state.active.settings}`}>
            <Link to="/settings" className={this.state.active.settings}>
              <img className="sidebaricon" src={this.state.icons.settings} />
              {lang.navBarSettingsButton}
            </Link>
            {this.renderRectRound('/settings')}
          </div>
        </ul>
        <div className="connections sidebar-section-container">
          <p>{`${lang.nabBarNetworkInfoSyncing} ${progressBar.toFixed(2)}%`}</p>
          <p>{`( Total Headers Synced: ${this.state.headers} )`}</p>
          <p>{`( ${lang.nabBarNetworkInfoBlock} ${this.state.currentHeight} ${lang.conjuctionOf} ${this.state.headers} )`}</p>
          <div className="progress custom_progress">
            <div
              className="progress-bar progress-bar-success progress-bar-striped"
              role="progressbar"
              aria-valuenow="40"
              aria-valuemin="0"
              aria-valuemax="100"
              style={{ width: `${progressBar.toFixed(2)}%`, backgroundColor: '#8DA557' }}
            />
          </div>
          <p>{`${lang.nabBarNetworkInfoActiveConnections}: ${this.state.numpeers}`}</p>
        </div>
        <div className="sidebar-section-container">
        {this.state.running //eslint-disable-line
            ? !this.state.stopping
              ? <button className="stopStartButton" onClick={this.saveAndStopDaemon}>Stop Daemon</button>
              : <button className="stopStartButton" disabled>Daemon stopping...</button>
            : !this.state.starting
              ?
                !this.state.daemonInstalled
                    ?
                <Link to="/downloads" id="a-tag-button-wrapper">
                    <button className="stopStartButton">
                        Click here to install daemon 
                    </button>
                </Link>
                :
                <button
                  className="stopStartButton"
                  onClick={this.startDaemon}
                >
                  Start Daemon
                </button>
              : <button className="stopStartButton" disabled>Daemon starting...</button>
          }
          {this.state.newVersionAvailable
            ? <div className="new-version">New Daemon Version Available</div>
            : null
          }
        </div>
      </div>
    );
  }
}

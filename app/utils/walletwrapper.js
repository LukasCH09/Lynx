import React, { Component } from 'react';
import Wallet from './wallet';
const wallet = new Wallet();
const event = require('../utils/eventhandler');
import glob from 'glob';
const homedir = require('os').homedir();

export default class WalletWrapper extends Component {
    constructor(props) {
        super(props);
        this.state = {
          starting: true,
          running: true,
          stopping: false,
          walletInstalled: false,
          newVersionAvailable: false,

          //getblockchaininfo
          chain: "",
          bestblockhash: "",

          //getinfo
          version: 0,
          protocolversion: 0,
          walletversion: 0,
          balance: 0,
          newmint: 0,
          stake:0,
          blocks: 0,
          headers: 0,
          connections: 0,
          difficulty: 0,
          encrypted: false,
          unlocked_until: 0,
          staking: false,

          //getwalletinfo
          unconfirmed: 0,
          immature: 0,
        };
        this.getStateValues = this.getStateValues.bind(this);
        this.updateWalletStatus = this.updateWalletStatus.bind(this);
        this.getInfo = this.getInfo.bind(this);
        this.getBlockchainInfo = this.getBlockchainInfo.bind(this);
        this.getWalletInfo = this.getWalletInfo.bind(this);
        this.startWallet = this.startWallet.bind(this);
        this.stopWallet = this.stopWallet.bind(this);
    }

    componentDidMount() {
        this.updateWalletStatus();
        this.timerUpdate = setInterval(() => {
            this.updateWalletStatus();
        }, 3000);
    }

    componentWillUnmount() {
        clearInterval(this.timerUpdate);
    }

    getStateValues()
    {
        let results = {};
        for(let i = 0; i < arguments.length; i++)
        {
            //console.log("checking for arg " + arguments[i]);
            if(this.state[arguments[i]] !== undefined)
            {
                results[arguments[i]] = this.state[arguments[i]];
            }
        }
        return results;
    }

    processError(err) {
        console.log(err);
        if(err.message === 'connect ECONNREFUSED 127.0.0.1:19119'){
            this.setState({
                starting: false,
                running: false,
            });
            event.emit('animate', "Could not connect to wallet service, is it running?");
        }
        else if(err.message.includes("Loading block index")){
            this.setState({ 
                starting: true,
                walletInstalled: true, 
            });
            event.emit('animate', err.message);
        }
        else{
            this.setState({ starting: false, });
            event.emit('animate', err.message);
        }
    }

    getBlockchainInfo() {
//        wallet.getBlockchainInfo().then((data) => {
//            this.setState({
//                chain: data.chain,
//                bestblockhash: data.bestblockhash,
//            });
//        }).catch((err) => {
//           this.processError(err);
//        });
    }

    getInfo() {
        wallet.getInfo().then((data) => {
            this.setState({
                version: data.version,
                protocolversion: data.protocolversion,
                walletversion: data.walletversion,
                balance: data.balance,
                newmint: data.newmint,
                stake: data.stake,
                blocks: data.blocks,
                headers: data.headers,
                connections: data.connections,
                difficulty: data.difficulty,
                encrypted: data.encrypted,
                staking: data.staking,
            });
            if(data.encrypted){
                this.setState({
                    unlocked_until: data.unlocked_until,
                });
            }
        }).catch((err) => {
            this.processError(err);
        });
    }


    getWalletInfo() {
//        wallet.getWalletInfo().then((data) => {
//            this.setState({
//                unconfirmed: data.unconfirmed_balance,
//                immature: data.immature_balance,
//            });
//        }).catch((err) => {
//            this.processError(err);
//        });
    }

    updateWalletStatus() {
        if (!this.state.starting) {
            glob(`${homedir}/.eccoin-wallet/Eccoind*`, (error, files) => {
                if (!files.length) {
                    this.setState({
                        walletInstalled: false,
                    });
                } else if (files.length) {
                    this.setState({
                        walletInstalled: true,
                        running: false,
                    });
                } else {
                    event.emit('show', err.message);
                }
            });
        } else { //if the wallet is running
            this.setState({
                walletInstalled: true,
                running: true,
            });
            this.getBlockchainInfo();
            this.getInfo();
            this.getWalletInfo();
        }
    }

    startWallet() {
        this.setState({
            starting: true,
        });
        wallet.walletstart((result) => {
            if (result) {
                event.emit('show', "Starting wallet...");
            }
            else {
                this.setState({
                    starting: false,
                });
                if(this.state.walletInstalled == false){
                    event.emit('show', 'Could not start wallet. Is it in the correct directory?');
                }
            }
        });
    }

    stopWallet() {
        if(this.state.starting == true)
        {
            event.emit('animate', 'Cannot stop wallet while block index is loading, it will stop when it is done');
            return;
        }
        if (process.platform.indexOf('win') > -1) {
            event.emit('animate', 'Stopping wallet...');
        }
        this.setState({
            stopping: true,
        });
        wallet.walletstop().then(() => {
            this.setState({
                starting: false,
                staking: false,
            });
        })
        .catch(err => {
            this.processError(err);
        });
    }

    render() {
      const { children } = this.props;

      const childrenWithProps = React.Children.map(children, child => {
        return React.cloneElement(child, {
          startWallet: this.startWallet,
          stopWallet: this.stopWallet,
          getStateValues: this.getStateValues,
        });
      });

      return <div>{childrenWithProps}</div>;
    }

}

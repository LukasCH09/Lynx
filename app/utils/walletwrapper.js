import Wallet from './wallet';
const wallet = new Wallet();
const event = require('../utils/eventhandler');
import glob from 'glob';
const homedir = require('os').homedir();

export default class WalletWrapper {
    constructor(props){
        this.state = {
            starting: false,
            running: false,
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
    }

    componentDidMount() {
        console.log("component mounted");
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
        var results = {};
        for(var i = 0; i < arguments.length; i++)
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
        if(err.message == 'connect ECONNREFUSED 127.0.0.1:19119'){
            event.emit('animate', "Could not connect to wallet service, is it running?");
        }
        else if(err.message.includes("Loading block index")){
            this.setState({ starting: true, });
            event.emit('animate', err.message);
        }
        else{
            this.setState({ starting: false, });
            event.emit('animate', err.message);
        }
    }

    getBlockchainInfo() {
        wallet.getBlockchainInfo().then((data) => {
            this.setState({
                chain: data.chain,
                bestblockhash: data.bestblockhash,
            });
        }).catch((err) => {
            this.processError(err);
        });
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
        wallet.getWalletInfo().then((data) => {
            this.setState({
                unconfirmed: data.unconfirmed_balance,
                immature: data.immature_balance,
            });
        }).catch((err) => {
            this.processError(err);
        });
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
        
        }
    }

    startWallet() {
        this.setState(() => {
            return {
                starting: true,
            };
        });
        wallet.walletstart((result) => {
            if (result) {
                event.emit('show', result);
            } 
            else {
                this.setState(() => {
                    return {
                        starting: false,
                    };
                });
                event.emit('show', 'Could not start wallet. Is it in the correct directory?');
            }
        });
    }

    stopWallet(){
        if (process.platform.indexOf('win') > -1) {
            event.emit('animate', 'Stopping wallet...');
        }
        this.setState(() => {
            return {
                stopping: true,
            };
        });
        wallet.walletstop().then(() => {
            this.setState(() => {
                return {
                    starting: false,
                    staking: false,
                };
            });
        })
        .catch(err => {
            this.processError(err);
        });
    }

    render() {
        return null;
    }

}

export let walletwrapper = new WalletWrapper();














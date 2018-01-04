import Wallet from './wallet';
const wallet = new Wallet();
const event = require('../utils/eventhandler');

export default class WalletWrapper {
    constructor(props){
        this.state = {
            starting: false,
            running: false,
            stopping: false,
    
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
            event.emit('animate', 'Stopping daemon...');
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
}

export let walletwrapper = new WalletWrapper();














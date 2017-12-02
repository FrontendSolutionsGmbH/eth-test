#!/usr/bin/env node

const argv = require('yargs').argv;
const args = argv._;

const command = args[0]
const param1 = args[1]
const param2 = args[2]
const param3 = args[3]
const param4 = args[4]
const Web3 = require('web3')
const web3 = new Web3("http://localhost:8545")


const api = require('./api')

web3.eth.getAccounts().then((accounts) => {

    switch (command) {
        case 'addregistry':
            api.doAddCentralRegistry(web3, accounts, param1, param2)
            break;

        case 'addcompany':
            var registryAccount = param1;
            var name = param2;
            api.doAddCompany(web3, accounts, registryAccount, name, param3)
            break;

        case 'adddevice':
            var registryAccount = param1;
            var name = param2;
            var serialId = param3;
            var data = param4;
            api.doAddDevice(web3, accounts, registryAccount, serialId, name, data)
            break;


        case 'demo':
            var registryId = param1;
            var filename = param2;
            api.doDemo(web3, accounts, registryId, filename)
            break;

        case 'history':
            var registryId = param1;
            var serialId = param2;
            api.doGetHistory(web3, accounts, registryId, serialId)
    }

});














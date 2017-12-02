const Web3 = require('web3')

const ufpCentralRegistry = {
    abi: [{
        "constant": false,
        "inputs": [{"name": "digitalTwinSerialId", "type": "string"}, {
            "name": "digitalTwinAddress",
            "type": "address"
        }],
        "name": "addDigitalTwin",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "constant": true,
        "inputs": [{"name": "digitalTwinAddress", "type": "address"}],
        "name": "getDigitalTwinSerialIdByAddress",
        "outputs": [{"name": "digitalTwinSerialId", "type": "string"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"name": "companyName", "type": "string"}, {"name": "companyAddress", "type": "address"}],
        "name": "addCompany",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "constant": true,
        "inputs": [{"name": "check", "type": "int256"}],
        "name": "getRegistryName",
        "outputs": [{"name": "registryName", "type": "string"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }, {
        "constant": true,
        "inputs": [{"name": "companyAddress", "type": "address"}],
        "name": "getCompanyNameByAddress",
        "outputs": [{"name": "companyName", "type": "string"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }, {
        "constant": true,
        "inputs": [{"name": "companyName", "type": "string"}],
        "name": "getCompanyAddressByName",
        "outputs": [{"name": "companyAddress", "type": "address"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }, {
        "constant": true,
        "inputs": [{"name": "digitalTwinSerialId", "type": "string"}],
        "name": "getDigitalTwinAddressBySerialId",
        "outputs": [{"name": "hash", "type": "address"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [{"name": "newName", "type": "string"}],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
    }]
}

const ufpSupplyChainCompany = {
    abi: [{
        "constant": true,
        "inputs": [],
        "name": "getName",
        "outputs": [{"name": "twinName", "type": "string"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }, {
        "constant": true,
        "inputs": [],
        "name": "getOwner",
        "outputs": [{"name": "companyWwner", "type": "address"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [{"name": "_name", "type": "string"}],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
    }]
}


const ufpSupplyChainDigitalTwin = {
    abi: [{
        "constant": true,
        "inputs": [],
        "name": "getName",
        "outputs": [{"name": "twinName", "type": "string"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }, {
        "constant": true,
        "inputs": [{"name": "i", "type": "uint256"}],
        "name": "getHistoryOwner",
        "outputs": [{"name": "owner", "type": "address"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }, {
        "constant": true,
        "inputs": [],
        "name": "getSerialId",
        "outputs": [{"name": "twinSerialId", "type": "string"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }, {
        "constant": true,
        "inputs": [],
        "name": "getHistoryLength",
        "outputs": [{"name": "count", "type": "uint256"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"name": "newOwner", "type": "address"}, {"name": "newHash", "type": "string"}],
        "name": "setNewOwner",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "constant": true,
        "inputs": [{"name": "i", "type": "uint256"}],
        "name": "getHistoryHash",
        "outputs": [{"name": "hash", "type": "string"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }, {
        "constant": true,
        "inputs": [],
        "name": "getCurrentOwnerAndHash",
        "outputs": [{
            "components": [{"name": "hash", "type": "string"}, {"name": "owner", "type": "address"}],
            "name": "ownerAndHash",
            "type": "tuple"
        }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [{"name": "newSerialId", "type": "string"}, {"name": "newName", "type": "string"}, {
            "name": "newHash",
            "type": "string"
        }, {"name": "newOwner", "type": "address"}],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
    }]
}


var doGetHistory = (web3, accounts, registryAddress, digitalTwinSerialId) => {


    // console.log('history', registryAddress, digitalTwinSerialId)
    var myRegistry = new web3.eth.Contract(ufpCentralRegistry.abi)
    myRegistry.options.address = registryAddress;
    return myRegistry.methods.getDigitalTwinAddressBySerialId(digitalTwinSerialId).call({from: accounts[0]})
        .then((address) => {
            console.log('twin', address)

            if (address !== '0x0000000000000000000000000000000000000000') {
                var myDigitalTwin = new web3.eth.Contract(ufpSupplyChainDigitalTwin.abi)
                myDigitalTwin.options.address = address;

                return myDigitalTwin.methods.getHistoryLength().call({from: accounts[0]})
                    .then((historyLength) => {
                        //  console.log('historyLength', historyLength)

                        var result = {
                            digitalTwin: {
                                name: '',
                                id: digitalTwinSerialId
                            },
                            stations: new Array(historyLength)
                        }

                        var promisesToWaitFor = []

                        for (var i = 0; i < historyLength; i++) {
                            (function (j) {
                                result.stations[i] = {name: '', owner: ''}
                                var j = i;
                                promisesToWaitFor.push(myDigitalTwin.methods.getHistoryOwner(j).call({from: accounts[0]}).then((entry) => {
                                    result.stations[j].owner = entry

                                    return myRegistry.methods.getCompanyNameByAddress(entry).call({from: accounts[0]})
                                        .then((companyName) => {
                                            result.stations[j].name = companyName
                                        })
                                }))

                                promisesToWaitFor.push(myDigitalTwin.methods.getHistoryHash(j).call({from: accounts[0]}).then((entry) => {
                                    result.stations[j].data = entry
                                    return entry
                                }))
                            })(i)
                        }

                        promisesToWaitFor.push(myDigitalTwin.methods.getName().call({from: accounts[0]}).then((entry) => {
                            result.digitalTwin.name = entry
                        }))

                        return Promise.all(promisesToWaitFor).then((allResults) => {
                            //   console.log('result', result)

                            return JSON.stringify(result)
                        })

                    })
            } else {
                console.log('not found')
                return null;
            }

        })

}


var getHistory = function (provider, registryAccount, serialId) {
    var web3 = new Web3(provider)

    return web3.eth.getAccounts().then((accounts) => {
        return doGetHistory(web3, accounts, registryAccount, serialId)
    });
}

module.exports = {
    getHistory: getHistory
}


//getHistory("http://localhost:8545", "asd", "123")
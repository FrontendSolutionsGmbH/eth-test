const fs = require('fs');

const readContract = (name) => {
    return {
        abi: JSON.parse(fs.readFileSync('./dist/UfpCentral_sol_' + name + '.abi').toString()),
        byteCode: fs.readFileSync('./dist/UfpCentral_sol_' + name + '.bin').toString()
    }
}


const deployContract = (web3, accounts, contract, contractByteCode, comment, arguments) => {
    var transactionDeployOuter = contract.deploy({data: '0x' + contractByteCode, arguments: arguments})
    var transactionDeploy = {from: accounts[0], gas: 3000000}
    return transactionDeployOuter.send(transactionDeploy).then((newContractInstance) => {
        var contractAddress = newContractInstance.options.address
        //  console.log(comment, contractAddress)
        return contractAddress;
    })
}

const ufpCentralRegistry = readContract('UfpCentralRegistry')
const ufpSupplyChainCompany = readContract('UfpSupplyChainCompany')
const ufpSupplyChainDigitalTwin = readContract('UfpSupplyChainDigitalTwin')

var API = {

    doAddCentralRegistry: (web3, accounts, param1, param2) => {
        var myRegistry = new web3.eth.Contract(ufpCentralRegistry.abi)
        return deployContract(web3, accounts, myRegistry, ufpCentralRegistry.byteCode, 'registry added', ['ufp']).then((address) => {
            console.log(address)
            return address
        })
    },

    doAddCompany: (web3, accounts, registryAddress, companyName, param2) => {
        var myCompany = new web3.eth.Contract(ufpSupplyChainCompany.abi)
        companyName = companyName || 'company' + Math.floor(Math.random() * 10000);
        return deployContract(web3, accounts, myCompany, ufpSupplyChainCompany.byteCode, 'company "' + companyName + '" added', [companyName]).then((address) => {
            console.log('company', companyName, 'deployed at', address)

            return address;
        }).then((address) => {
            var myRegistry = new web3.eth.Contract(ufpCentralRegistry.abi)
            myRegistry.options.address = registryAddress;
            return myRegistry.methods.addCompany(companyName, address).send({from: accounts[0], gas: 3000000})
                .then((result) => {
                    console.log('registry added', result.status, companyName, address)
                    return address
                })
        })
    },

    doAddDigitalTwin: (web3, accounts, registryAddress, digitalTwinSerialId, digitalTwinName, digitalTwinData, owner) => {
        var myDigitalTwin = new web3.eth.Contract(ufpSupplyChainDigitalTwin.abi)
        digitalTwinData = (digitalTwinData || 'randomHash' + Math.floor(Math.random() * 10000)).toString();
        digitalTwinSerialId = digitalTwinSerialId || 'digitalTwin' + Math.floor(Math.random() * 10000);
        digitalTwinName = digitalTwinName || 'noname';
        var digitalTwinOwner = owner.toUpperCase()
        return deployContract(web3, accounts, myDigitalTwin, ufpSupplyChainDigitalTwin.byteCode, 'digitalTwin (' + digitalTwinName + ') added', [digitalTwinSerialId, digitalTwinName, digitalTwinData, digitalTwinOwner]).then((address) => {
            console.log('digitalTwin', digitalTwinSerialId, digitalTwinName, digitalTwinData.substring(0, 10) + '...', 'deployed at', address)
            return address;
        }).then((address) => {
            var myRegistry = new web3.eth.Contract(ufpCentralRegistry.abi)
            myRegistry.options.address = registryAddress;
            return myRegistry.methods.addDigitalTwin(digitalTwinSerialId, address).send({
                from: accounts[0],
                gas: 3000000
            })
                .then((result) => {
                    console.log('registry added', result.status)
                    return address
                })
        })
    },


    doGetCompanyFromRegistry: (web3, accounts, registryAddress, companyName) => {
        var myRegistry = new web3.eth.Contract(ufpCentralRegistry.abi)
        myRegistry.options.address = registryAddress;

        /*myRegistry.methods.getRegistryName(5).call({from: accounts[0]})
            .then((registryName) => {
                console.log('registry-name', registryName)
            })
*/

        myRegistry.methods.getCompanyAddressByName(companyName).call({from: accounts[0]})
            .then((address) => {
                console.log('company', companyName, address)
            })

    },

    doGetTwinFromRegistry: (web3, accounts, registryAddress, twinSerialId) => {
        var myRegistry = new web3.eth.Contract(ufpCentralRegistry.abi)
        myRegistry.options.address = registryAddress;
        myRegistry.methods.getDigitalTwinAddressBySerialId(twinSerialId).call({from: accounts[0]})
            .then((address) => {

                console.log('twin', twinSerialId, address)

                var myDigitalTwin = new web3.eth.Contract(ufpSupplyChainDigitalTwin.abi)
                myDigitalTwin.options.address = address;

                myDigitalTwin.methods.getName().call({from: accounts[0]})
                    .then((name) => {
                        console.log('name', name)
                    })

            })
    },


    doDemo: (web3, accounts, registryAccount, filename) => {
        var definition = JSON.parse(fs.readFileSync(filename).toString());
        var companyNames = Array.from(new Set(definition.stations.map((entry) => entry.name)));
        var stations = definition.stations; // "stations":  [{"name": "Factory", "data": {}}]


        var digitalTwins = [
            {
                serialId: definition.digitalTwin.id,
                name: definition.digitalTwin.name,
                data: JSON.stringify(stations[0].data)
            }]


        var createCompanies = Promise.all(companyNames.map((companyName) => {
            return API.doAddCompany(web3, accounts, registryAccount, companyName).then((address) => {
                return {name: companyName, address: address}
            })
        })).then((companyNameAndAddresses) => {
            //console.log(companyNameAndAddresses)
            return companyNameAndAddresses;
        })

        var createTwins = createCompanies.then((companyNameAndAddresses) => {
            return Promise.all(digitalTwins.map((digitalTwin) => {
                return API.doAddDigitalTwin(web3, accounts, registryAccount, digitalTwin.serialId, digitalTwin.name, digitalTwin.data, companyNameAndAddresses[0].address).then((address) => {
                    return {
                        serialId: digitalTwin.serialId,
                        name: digitalTwin.name,
                        data: digitalTwin.data,
                        address: address
                    }
                })
            }))
        })


        Promise.all([createCompanies, createTwins]).then(([companyNameAndAddresses, digitalTwinsWithAddress]) => {
            API.fillHistory(web3, accounts, digitalTwinsWithAddress, stations.slice(1), companyNameAndAddresses)
            return digitalTwinsWithAddress;
        })

    },

    fillHistory: (web3, accounts, digitalTwinsWithAddress, stations, companyNameAndAddresses) => {
        digitalTwinsWithAddress.map((twin) => {

            var executions = [];


            stations.map((station) => {
                var companyNameAndAddress = companyNameAndAddresses.find((company) => {
                    return (company.name === station.name)
                })

                executions.push({station: station, companyNameAndAddress: companyNameAndAddress})
            })


            console.log('map worked', executions.length)
            var execOwnerShipChange = function (executions) {

                if (executions.length < 1) {
                    return
                }
                var companyNameAndAddress = executions[0].companyNameAndAddress;
                var station = executions[0].station;

                console.log('adding station', station.name, JSON.stringify(station.data).substring(0, 10), '...',
                    companyNameAndAddress.address)

                var myDigitalTwin = new web3.eth.Contract(ufpSupplyChainDigitalTwin.abi)
                myDigitalTwin.options.address = twin.address;

                myDigitalTwin.methods.setNewOwner(companyNameAndAddress.address, JSON.stringify(station.data)).send({
                    from: accounts[0],
                    gas: 3000000
                })
                    .then((result) => {
                        execOwnerShipChange(executions.slice(1))
                    })
            }
            execOwnerShipChange(executions)


        })
    },

    doGetHistory: (web3, accounts, registryAddress, digitalTwinSerialId) => {


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
                            console.log('historyLength', historyLength)

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

}

module.exports = API;
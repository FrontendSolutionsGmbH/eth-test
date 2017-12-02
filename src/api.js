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
const ufpSupplyChainDevice = readContract('UfpSupplyChainDevice')

var API = {

    doAddCentralRegistry: (web3, accounts, param1, param2) => {
        var myRegistry = new web3.eth.Contract(ufpCentralRegistry.abi)
        return deployContract(web3, accounts, myRegistry, ufpCentralRegistry.byteCode, 'registry added')
    },

    doAddCompany: (web3, accounts, registryAddress, companyName, param2) => {
        var myCompany = new web3.eth.Contract(ufpSupplyChainCompany.abi)
        companyName = companyName || 'company' + Math.floor(Math.random() * 10000);
        return deployContract(web3, accounts, myCompany, ufpSupplyChainCompany.byteCode, 'company "' + companyName + '" added', [companyName]).then((address) => {
            console.log('company', companyName, 'deployed at', address)

            return address;
        })
    },

    doAddDevice: (web3, accounts, registryAddress, digitalTwinSerialId, digitalTwinData) => {
        var myDevice = new web3.eth.Contract(ufpSupplyChainDevice.abi)
        var data = digitalTwinData || 'randomHash' + Math.floor(Math.random() * 10000);
        digitalTwinSerialId = digitalTwinSerialId || 'digitalTwin' + Math.floor(Math.random() * 10000);
        return deployContract(web3, accounts, myDevice, ufpSupplyChainDevice.byteCode, 'digitalTwin (' + data + ') added', [digitalTwinSerialId, data]).then((address) => {
            console.log('digitalTwin', digitalTwinSerialId, digitalTwinData, address)
            return address;
        })
    },

    /*
    doRegistryAddDevice: (web3, accounts, registryAddress, param1, param2) => {
        var digitalTwinContractAddress = param1;
        var registryAddress = param2;
        var myRegistry = new web3.eth.Contract(ufpCentralRegistry.abi)
        myRegistry.options.address = registryAddress;

        myRegistry.methods.addDigitalTwin('ERROR').send({from: accs[0]})
            .then(function (receipt) {
                console.log('contractMethod', receipt)
            });


    },
    */

    doDemo: (web3, accounts, registryAccount, filename) => {
        var definition = JSON.parse(fs.readFileSync(filename).toString());
        var companyNames = Array.from(new Set(definition.stations.map((entry) => entry.name)));
        var digitalTwinName = definition.digitalTwin.name;
        var digitalTwinId = definition.digitalTwin.id;


        Promise.all(companyNames.map((companyName) => {
            return API.doAddCompany(web3, accounts, registryAccount, companyName).then((address) => {
                return {name: companyName, address: address}
            })
        })).then((companyNameAndAddresses) => {

            console.log(companyNameAndAddresses)

        })


        //console.log(digitalTwinName, digitalTwinId, companyNames);


        /*
        api.doAddCompany(web3, accounts, 'Siemens', param1)
        api.doAddCompany(web3, accounts, 'Factory', param1)
        api.doAddCompany(web3, accounts, 'Customer', param1)
        api.doAddCompany(web3, accounts, 'Repairshop', param1)

        api.doAddDevice(web3, accounts, 'Blade 1', param1)
        api.doAddDevice(web3, accounts, 'Blade 2', param1)
        api.doAddDevice(web3, accounts, 'Blade 3', param1)*/

    }

}

module.exports = API;
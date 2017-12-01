const fs = require('fs');

const readContract = (name) => {
    return {
        abi: JSON.parse(fs.readFileSync('./data/src_UfpCentralRegistry_sol_' + name + '.abi').toString()),
        byteCode: fs.readFileSync('./data/src_UfpCentralRegistry_sol_' + name + '.bin').toString()
    }
}


const deployContract = (web3, accounts, contract, contractByteCode, comment, arguments) => {
    console.log('arguments', arguments)
    var transactionDeployOuter = contract.deploy({data: '0x' + contractByteCode, arguments: arguments})
    var transactionDeploy = {from: accounts[0], gas: 3000000}
    transactionDeployOuter.send(transactionDeploy).then((newContractInstance) => {
        var contractAddress = newContractInstance.options.address
        console.log(comment, contractAddress)
    })
}

const ufpCentralRegistry = readContract('UfpCentralRegistry')
const ufpSupplyChainCompany = readContract('UfpSupplyChainCompany')
const ufpSupplyChainDevice = readContract('UfpSupplyChainDevice')

module.exports = {

    doAddCentralRegistry: (web3, accounts, param1, param2) => {
        var myRegistry = new web3.eth.Contract(ufpCentralRegistry.abi)
        deployContract(web3, accounts, myRegistry, ufpCentralRegistry.byteCode, 'registry added')
    },

    doAddCompany: (web3, accounts, param1, param2) => {
        var myCompany = new web3.eth.Contract(ufpSupplyChainCompany.abi)
        var companyName = param1 || 'company' + Math.floor(Math.random() * 10000);
        deployContract(web3, accounts, myCompany, ufpSupplyChainCompany.byteCode, 'company "' + companyName + '" added', [companyName])
    },

    doAddDevice: (web3, accounts, param1, param2) => {
        var myDevice = new web3.eth.Contract(ufpSupplyChainDevice.abi)
        var data = param1 || 'randomHash' + Math.floor(Math.random() * 10000);
        deployContract(web3, accounts, myDevice, ufpSupplyChainDevice.byteCode, 'device (' + data + ') added', [data])
    },

    doRegistryAddDevice: (web3, accounts, param1, param2) => {
        var contractAddress = param1;
        var registryAddress = param2;
        var myRegistry = new web3.eth.Contract(ufpCentralRegistry.abi)
        myRegistry.options.address = registryAddress;

        myRegistry.methods.addDigitalTwin('ERROR').send({from: accs[0]})
            .then(function (receipt) {
                console.log('contractMethod', receipt)
            });


    }

}
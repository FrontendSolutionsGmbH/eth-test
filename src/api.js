const fs = require('fs');
const abiRegistry = fs.readFileSync('../data/src_UfpCentralRegistry_sol_UfpCentralRegistry.abi').toString();
const byteCodeRegistry = fs.readFileSync('../data/src_UfpCentralRegistry_sol_UfpCentralRegistry.bin').toString();

console.log(abiRegistry, byteCodeRegistry)


var myContract = new web3.eth.Contract(abi)


module.exports = {

    doAddCompany: (accounts, param1, param2) => {

    },

    doAddDevice: (accounts, param1, param2) => {

    }

}
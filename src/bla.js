const fs = require('fs');
const solc = require('solc');
const Web3 = require('web3')
const web3 = new Web3("http://localhost:8545")


web3.eth.getAccounts().then((accs) => {

	/*

	if (accs.length < 2) {
		web3.eth.personal.newAccount('Test1234').then(console.log)
	} else {

		var transaction = { from: accs[0], to: accs[1], value: '50000'}

		// estimate how expensive a transaction will be
		web3.eth.estimateGas(transaction).then(console.log.bind(null, 'EstimateGas'))

		// send a transaction
		web3.eth.sendTransaction(transaction).then((t) => t.transactionHash).then(console.log.bind(null, 'Transaction'))
		

		// send a transaction from the second account

		var transaction2 = { from: accs[1], to: accs[0], value: '1'}
		web3.eth.personal.unlockAccount(accs[1], "Test1234", 1000).then(console.log.bind('unlock'))
		web3.eth.estimateGas(transaction2).then(console.log.bind(null, 'EstimateGasBack'))
		web3.eth.sendTransaction(transaction2).then((t) => t.transactionHash).then(console.log.bind(null, 'Transaction Back'))
		

	}
 		


	// show balances
	// web3.eth.getBalance(accs[0]).then(console.log.bind(null, 'Account[0]'))
		

	*/

	accs.map((acc) => {
		web3.eth.getBalance(acc).then(console.log.bind(null, 'Account(', acc, ')'))
	})




// Compile the source code
const input = fs.readFileSync('./src/UfpSimpleHashes.sol');
const output = solc.compile(input.toString(), 1);
//console.log(output.contracts[':UfpSimpleHashes'])

const byteCode = output.contracts[':UfpSimpleHashes'].bytecode;
const abi = JSON.parse(output.contracts[':UfpSimpleHashes'].interface);

	var myContract = new web3.eth.Contract(abi)
//	console.log(myContract)
	var transactionDeployOuter = myContract.deploy({data: '0x' + byteCode})
	var transactionDeploy = { from: accs[0], gas: 3000000}
	transactionDeployOuter.send(transactionDeploy).then((newContractInstance) => {
		var contractAddress = newContractInstance.options.address
		console.log('deployResultAddress', contractAddress)


		myContract.options.address = contractAddress

		myContract.methods.setHash('a', 'b').send({from: accs[0]})
		.then(function(receipt){
		 	console.log('contractMethod', receipt)  
		 });

	})

})


//
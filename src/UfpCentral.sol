pragma solidity ^0.4.0;
contract UfpCentralRegistry {
    
    mapping(string => address) companyNameToAddress;
	mapping(address => string) companyAddressToId;

    function addCompany(string companyName, address companyAddress) public {
        companyNameToAddress[companyName] = companyAddress;
        companyAddressToId[companyAddress] = companyName;
    }
    
    function getCompanyAddressById(string companyName) public constant returns (address companyAddress) {
        return companyNameToAddress[companyName];
    }

    function getCompanyNameByAddress(address companyAddress) public constant returns (string companyName) {
        return companyAddressToId[companyAddress];
    }

    mapping(string => address) digitalTwinSerialIdToAddress;
	mapping(address => string) digitalTwinAddressToSerialId;

    function addDigitalTwin(string digitalTwinSerialId, address digitalTwinAddress) public {
        digitalTwinSerialIdToAddress[digitalTwinSerialId] = digitalTwinAddress;
        digitalTwinAddressToSerialId[digitalTwinAddress] = digitalTwinSerialId;
    }

    function getDigitalTwinAddressBySerialId(string digitalTwinSerialId) public constant returns (address hash) {
        return digitalTwinSerialIdToAddress[digitalTwinSerialId];
    }

    function getDigitalTwinSerialIdByAddress(address digitalTwinAddress) public constant returns (string digitalTwinSerialId) {
        return digitalTwinAddressToSerialId[digitalTwinAddress];
    }


}

contract UfpSupplyChainDigitalTwin {

    string serialId;
    string name;

   struct OwnerAndHash {
        string hash;
        address owner;
    }

    OwnerAndHash[] oldOwnerAndHashes;
    OwnerAndHash currentOwnerAndHash;

    function UfpSupplyChainDigitalTwin(string newSerialId, string newName, string newHash) public {
        currentOwnerAndHash = OwnerAndHash({owner: msg.sender, hash: newHash});
        serialId = newSerialId;
        name = newName;
        oldOwnerAndHashes.push(currentOwnerAndHash);
    }

    function setNewOwner(address newOwner, string newHash) public {
        if (msg.sender == currentOwnerAndHash.owner) {
            currentOwnerAndHash = OwnerAndHash({owner: newOwner, hash: newHash});
            oldOwnerAndHashes.push(currentOwnerAndHash);
        }
    }

    /*function getHistory(uint256 i) public constant returns (OwnerAndHash ownerAndHashHistory){
        return oldOwnerAndHashes[i];
    }

    function getHistoryCount() public constant returns (uint256 count){
        return oldOwnerAndHashes.length;
    }*/

}

contract UfpSupplyChainCompany {
    string name;
    address owner;

    function UfpSupplyChainCompany(string _name) public {
        owner = msg.sender;
        name = _name;
    }

}
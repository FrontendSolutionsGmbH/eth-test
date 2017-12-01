pragma solidity ^0.4.0;
contract UfpCentralRegistry {
    
    mapping(string => address) companyIdToAddress;
	mapping(address => string) companyAddressToId;

    function addCompany(string companyId, address companyAddress) public {
        companyIdToAddress[companyId] = companyAddress;
        companyAddressToId[companyAddress] = companyId;
    }
    
    function getCompanyAddressById(string companyId) public constant returns (address companyAddress) {
        return companyIdToAddress[companyId];
    }

    function getCompanyIdByAddress(address companyAddress) public constant returns (string companyId) {
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

contract UfpSupplyChainDevice {
    string hash;
    address owner;
    
    function UfpSupplyChainDevice() public {
        owner = msg.sender;
    }

    function setNewOwner(address newOwner, string newHash) public {
        if (msg.sender == owner) {
            owner = newOwner;
            hash = newHash;
        }
    }

}
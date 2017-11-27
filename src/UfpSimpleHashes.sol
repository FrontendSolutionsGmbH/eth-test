pragma solidity ^0.4.0;
contract UfpSimpleHashes {
    
    mapping(string => string) hashes;

    function setHash(string key, string hash) public {
        hashes[key] = hash;
    }
    
    function getHash(string key) public constant returns (string hash) {
        return hashes[key];
    }
}
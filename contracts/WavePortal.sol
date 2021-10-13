// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract WavePortal {
	uint256	totalCookies;

	/*
     * We will be using this below to help generate a random number
     */
    uint256 private seed;
	/*
     * A little magic, Google what events are in Solidity!
     */
    event NewCookies(address indexed from, uint256 timestamp, string message);

	/*
     * I created a struct here named Cookies.
     * A struct is basically a custom datatype where we can customize what we want to hold inside it.
     */
    struct Cookies {
        address giver; // The address of the user who gave cookies.
        string message; // The message the user sent.
        uint256 timestamp; // The timestamp when the user gave cookies.
    }

    /*
     * I declare a variable cookies that lets me store an array of structs.
     * This is what lets me hold all the cookies anyone ever gave me!
     */
    Cookies[] cookies;

	/*
     * This is an address => uint mapping, meaning I can associate an address with a number!
     * In this case, I'll be storing the address with the last time the user waved at us.
     */
    mapping(address => uint256) public lastSentCookie;

    constructor() payable {
        console.log("Hey, building my first dapp with buildspace is pretty cool! ;)");
    }

	function giveCookies(string memory _message) public {
		/*
         * We need to make sure the current timestamp is at least 15-minutes bigger than the last timestamp we stored
         */
        require(
            lastSentCookie[msg.sender] + 2 minutes < block.timestamp,
            "Must wait 2 minutes before sending again."
        );

        /*
         * Update the current timestamp we have for the user
         */
        lastSentCookie[msg.sender] = block.timestamp;
		totalCookies++;
		console.log("%s has given you a cookie!", msg.sender);

		/*
    	 * This is where I actually store the cookies data in the array.
    	 */
    	cookies.push(Cookies(msg.sender, _message, block.timestamp));

		/*
    	 * Generate a Psuedo random number between 0 and 100
    	 */
    	uint256 randomNumber = (block.difficulty + block.timestamp + seed) % 100;
    	console.log("Random # generated: %s", randomNumber);
    	/*
    	 * Set the generated, random number as the seed for the next cookie
    	 */
    	seed = randomNumber;
    	/*
    	 * Give a 50% chance that the user wins the prize.
    	 */
    	if (randomNumber < 30) {
    	    console.log("%s won!", msg.sender);

			uint256 prizeAmount = 0.0001 ether;
    		require(
    		    prizeAmount <= address(this).balance,
    		    "Trying to withdraw more money than the contract has."
    		);
    		(bool success, ) = (msg.sender).call{value: prizeAmount}("");
    		require(success, "Failed to withdraw money from contract.");
    	}
	    emit NewCookies(msg.sender, block.timestamp, _message);
	}

	/*
     * I added a function getAllCookies which will return the struct array, waves, to us.
     * This will make it easy to retrieve the cookies from our website!
     */
    function getAllCookies() public view returns (Cookies[] memory) {
        return cookies;
    }

	function getTotalCookies() public view returns (uint256) {
		console.log("We have total of %d cookie(s)!", totalCookies);
		return totalCookies;
	}
}
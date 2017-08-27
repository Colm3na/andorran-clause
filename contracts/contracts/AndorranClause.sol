pragma solidity ^0.4.4;

import "./Pact.sol";

contract AndorranClause {
	event PactCreated(address from, Pact pact);

	function newPact(
		address closer,
		uint price,
		address wallet,
		address erc20
	) returns (Pact pact) {
		pact = new Pact(msg.sender, closer, price, wallet, erc20);
		PactCreated(msg.sender, pact);
	}
}

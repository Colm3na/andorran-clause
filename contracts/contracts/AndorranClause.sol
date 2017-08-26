pragma solidity ^0.4.4;

import "./Pact.sol";

contract AndorranClause {
	function newPact(
		address closer,
		uint price,
		address wallet,
		address erc20
	) returns (Pact pact) {
		pact = new Pact(msg.sender, closer, wallet, erc20, price);
	}
}

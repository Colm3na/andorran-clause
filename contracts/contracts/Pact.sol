pragma solidity ^0.4.4;

import "./zeppelin-solidity/token/StandardToken.sol";

/**
 * Contains the necessary information for a pending pact.
**/
contract Pact {
	enum State { WaitingFunds, Ready }

	// This should be the contract AndorranClause.
	address owner;

	// Who starts the pact. Is the member who sets the token price.
	address initiator;

	// Who closes the pact. Is the member who decides if buy or sell the tokens at
	// the fixed price.
	address closer;

	// Multisig wallet where the ethers are. A transaction from this address is
	// expected.
	address wallet;

	// Address of the Token contract for the token.
	StandardToken erc20;

	// Price of the token set by "initiator" on every new pact. "closer" decides
	// if buy or sell the tokens at this price.
	uint price;

	// Amount of ethers. The amount of tokens can be computed by multiplying
	// "amount" and "price".
	uint amount;

	// Current state of the contract.
	State state;

	modifier whenReady {
		require(state == State.Ready);
		_;
	}

	modifier onlyCloser {
		require(msg.sender == closer);
		_;
	}

	function Pact(
		address _initiator,
		address _closer,
		address _wallet,
		address _erc20,
		uint _price
	) {
		owner = msg.sender;
		initiator = _initiator;
		closer = _closer;
		wallet = _wallet;
		erc20 = StandardToken(_erc20);
		price = _price;
		state = State.WaitingFunds;
	}

	function deposit() payable {
		require(msg.sender == wallet);
		require(state == State.WaitingFunds);

		uint tokens = erc20.balanceOf(this);
		if (msg.value * price != tokens) {
			erc20.transfer(wallet, tokens);
			selfdestruct(wallet);
		}

		amount = msg.value;
		state = State.Ready;
	}

	function buy() onlyCloser whenReady {
		erc20.transfer(closer, amount * price);
		selfdestruct(wallet);
	}

	function sell() onlyCloser whenReady {
		erc20.transfer(wallet, amount * price);
		selfdestruct(closer);
	}

	function abort() {
		require(msg.sender == initiator || msg.sender == closer);

		if(state == State.Ready) {
			erc20.transfer(wallet, amount * price);
		}

		selfdestruct(wallet);
	}
}

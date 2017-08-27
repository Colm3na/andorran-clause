const AndorranClause = artifacts.require('./AndorranClause.sol');
const Pact = artifacts.require('./Pact.sol');
const Token = artifacts.require('./zeppelin-solidity/token/SimpleToken.sol');
const Multi = artifacts.require('./gnosys/MultiSigWallet.sol');

contract('AndorranClause', accounts => {
  ///////////////
  // Constants //
  ///////////////

  const INITIATOR = accounts[0];
  const CLOSER = accounts[1];
  const PRICE = web3.toWei(0.1, 'ether');
  const ETHER_AMOUNT = web3.toWei(1, 'ether');

  /////////////
  // Globals //
  /////////////

  let pactInstance;
  let walletInstance;
  let tokenInstance;

  ///////////
  // Hooks //
  ///////////

  /**
   * This hook sets the scenario before perfom the real tests.
   *
   * 1. Deploys a new ERC20 for testing purposes.
   * 2. Deploys a multisig wallet for testing purposes and send ethers to the
   *    wallet.
   * 3. Create a new Pact.
   * 4. Fund the pact with tokens.
   * 5. Fund the pact with ethers.
   * 6. Ensure the Pact state is now set to 1 (Ready).
   */
  beforeEach(async () => {
    tokenInstance = await Token.new();

    walletInstance = await Multi.new([INITIATOR, CLOSER], 1);
    await walletInstance.sendTransaction({ value: ETHER_AMOUNT });

    const clauseInstance = await AndorranClause.deployed();
    const txn = await clauseInstance.newPact(
      CLOSER,
      PRICE,
      walletInstance.address,
      tokenInstance.address,
    );
    const event = txn.logs.pop();
    pactInstance = await Pact.at(event.args.pact);

    // Send tokens to the Pact
    await tokenInstance.transfer(pactInstance.address, ETHER_AMOUNT / PRICE);

    // Send ethers to the Pact
    await walletInstance.submitTransaction(
      pactInstance.address,
      ETHER_AMOUNT,
      [],
      {
        from: INITIATOR,
      },
    );

    const state = await pactInstance.state.call();
    assert.equal(state.toString(), '1');
  });

  ///////////
  // TESTS //
  ///////////

  it('should transfer tokens to the CLOSER on a buy operation', async () => {
    await pactInstance.buy({ from: CLOSER });

    const currentWalletBalance = await web3.eth.getBalance(
      walletInstance.address,
    );
    const currentCloserTokens = await tokenInstance.balanceOf(CLOSER);

    assert.equal(web3.fromWei(currentWalletBalance).toString(), '1');
    assert.equal(currentCloserTokens, ETHER_AMOUNT / PRICE);
  });

  it('should transfer ethers to the CLOSER on a sell operation', async () => {
    await pactInstance.sell({ from: CLOSER });

    const currentWalletBalance = await web3.eth.getBalance(
      walletInstance.address,
    );
    const currentCloserTokens = await tokenInstance.balanceOf(CLOSER);

    assert.equal(web3.fromWei(currentWalletBalance).toString(), '0');
    assert.equal(currentCloserTokens, 0);
  });
});

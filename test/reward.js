var RewardToken = artifacts.require("RewardToken");

const hedgePercent = 0.015;

function isNumberWithinPercentOfNumber(firstN, percent, secondN) {
  const decimalPercent = percent / 200.0;
  const highRange = secondN * (1.0 + decimalPercent);
  const lowRange = secondN * (1.0 - decimalPercent);
  const retValue = lowRange <= firstN && firstN <= highRange;
  console.log("  ------------------------------------------  ");
  console.log(
    "     ----- Determine if " +
      firstN +
      " is between " +
      lowRange +
      " and " +
      highRange +
      ". -----"
  );
  console.log("       --- highRange: ", highRange);
  console.log("       --- lowRange: ", lowRange);

  console.log("        -- " + retValue);
  console.log("  ------------------------------------------  ");
  console.log(" ");
  return retValue;
}

contract("RewardToken Basics", async accounts => {
  let instance;

  it("Should allow for Reward to one account owner.", async () => {
    instance = await RewardToken.deployed();
    await instance.deposit({
      from: accounts[0],
      value: web3.toWei(5, "ether")
    });
    await instance.update(accounts[0], { from: accounts[0] });
    const div = await instance.dividendBalanceOf(accounts[0]);

    assert.equal(web3.toWei(5, "ether"), div.toNumber());
  });

  it("Should allow for Rewards to two accounts.", async () => {
    await instance.transfer(
      accounts[1],
      (await instance.totalSupply.call()) / 2,
      {
        from: accounts[0]
      }
    );

    const acct_0_balance = await instance.balanceOf(accounts[0]);
    const acct_1_balance = await instance.balanceOf(accounts[1]);

    await instance.deposit({
      from: accounts[0],
      value: web3.toWei(5, "ether")
    });

    await instance.update(accounts[0], { from: accounts[0] });
    await instance.update(accounts[1], { from: accounts[1] });

    const acct_0_div_balance = await instance.dividendBalanceOf(accounts[0]);
    const acct_1_div_balance = await instance.dividendBalanceOf(accounts[1]);

    assert(
      isNumberWithinPercentOfNumber(
        web3.toWei(2.5, "ether"),
        hedgePercent,
        acct_1_div_balance.toNumber()
      )
    );

    assert(
      isNumberWithinPercentOfNumber(
        web3.toWei(7.5, "ether"),
        hedgePercent,
        acct_0_div_balance.toNumber()
      )
    );
    assert.equal(web3.toWei(7.5, "ether"), acct_0_div_balance.toNumber());
  });

  it("Should allow for withdrawals", async () => {
    const beforeBalance = await web3.eth.getBalance(accounts[0]);
    await instance.withdraw({ from: accounts[0] });
    const afterBalance = await web3.eth.getBalance(accounts[0]);
    assert(
      afterBalance.toNumber(),
      parseInt(beforeBalance.toNumber()) + parseInt(web3.toWei(7.5, "ether"))
    );
  });

  it("Should NOT allow for duplicate withdrawals", async () => {
    const beforeBalance = await web3.eth.getBalance(accounts[0]);
    await instance.withdraw({ from: accounts[0] });
    const afterBalance = await web3.eth.getBalance(accounts[0]);

    assert(
      isNumberWithinPercentOfNumber(
        afterBalance.toNumber(),
        hedgePercent,
        beforeBalance.toNumber()
      )
    );
  });
});

contract("RewardToken Advanced", async accounts => {
  let instance;
  it("Should allow for Rewards to two accounts.", async () => {
    instance = await RewardToken.deployed();

    await instance.transfer(
      accounts[1],
      (await instance.totalSupply.call()) / 2,
      {
        from: accounts[0]
      }
    );

    const acct_0_balance = await instance.balanceOf(accounts[0]);
    const acct_1_balance = await instance.balanceOf(accounts[1]);

    await instance.deposit({
      from: accounts[0],
      value: web3.toWei(5, "ether")
    });

    await instance.update(accounts[0], { from: accounts[0] });
    await instance.update(accounts[1], { from: accounts[1] });

    const acct_0_div_balance = await instance.dividendBalanceOf(accounts[0]);
    const acct_1_div_balance = await instance.dividendBalanceOf(accounts[1]);

    assert.equal(web3.toWei(2.5, "ether"), acct_1_div_balance.toNumber());
    assert.equal(web3.toWei(2.5, "ether"), acct_0_div_balance.toNumber());
  });

  it("Should allow withdrawals");
  it("Should not allow duplicate withdrawals.");
  it("Should allow withdrawals, transfers, and more withdrawals.");
});

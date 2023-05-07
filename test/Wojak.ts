import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import RouterABI from "@uniswap/v2-periphery/build/IUniswapV2Router02.json";
import WETH_ABI from "@uniswap/v2-periphery/build/WETH9.json";

const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

describe("Wojak", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployWojak() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Wojak = await ethers.getContractFactory("Wojak");
    const wojak = await Wojak.deploy();

    return { wojak, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right marketingWallet", async function () {
      const { wojak, owner, otherAccount } = await loadFixture(deployWojak);
      console.log("wojak address:", wojak.address)
      console.log("owner address:", owner.address)
      console.log("otherAccount address:", otherAccount.address)

      expect(await wojak.marketingWallet()).to.equal("0x7BbcE391B3B2e35270a9691508bBE4485A38BF7F");

      console.log("Wojak token Info")
      console.log("wojak decimals:", await wojak.decimals())
      console.log("wojak totalSupply:", await wojak.totalSupply())
      console.log("wojak buyTax:", await wojak.buyTax())
      console.log("wojak sellTax:", await wojak.sellTax())
      console.log("wojak marketingWallet:", await wojak.marketingWallet())
      console.log("wojak uniswapV2Pair:", await wojak.uniswapV2Pair())
      console.log("wojak maxHoldAmount:", await wojak.maxHoldAmount())
      console.log("wojak coolDownTime:", await wojak.coolDownTime())
      console.log("wojak whaleSellLimitPercent:", await wojak.whaleSellLimitPercent())
      console.log("wojak isCoolDownMode:", await wojak.isCoolDownMode())
      console.log("wojak owner:", await wojak.owner())
    });

    // it("Should set the right owner", async function () {
    //   const { lock, owner } = await loadFixture(deployWojak);

    //   expect(await lock.owner()).to.equal(owner.address);
    // });

    // it("Should receive and store the funds to lock", async function () {
    //   const { lock, lockedAmount } = await loadFixture(
    //     deployWojak
    //   );

    //   expect(await ethers.provider.getBalance(lock.address)).to.equal(
    //     lockedAmount
    //   );
    // });

    // it("Should fail if the unlockTime is not in the future", async function () {
    //   // We don't use the fixture here because we want a different deployment
    //   const latestTime = await time.latest();
    //   const Lock = await ethers.getContractFactory("Lock");
    //   await expect(Lock.deploy(latestTime, { value: 1 })).to.be.revertedWith(
    //     "Unlock time should be in the future"
    //   );
    // });
  });

  // describe("Withdrawals", function () {
  //   describe("Validations", function () {
  //     it("Should revert with the right error if called too soon", async function () {
  //       const { lock } = await loadFixture(deployWojak);

  //       await expect(lock.withdraw()).to.be.revertedWith(
  //         "You can't withdraw yet"
  //       );
  //     });

  //     it("Should revert with the right error if called from another account", async function () {
  //       const { lock, unlockTime, otherAccount } = await loadFixture(
  //         deployWojak
  //       );

  //       // We can increase the time in Hardhat Network
  //       await time.increaseTo(unlockTime);

  //       // We use lock.connect() to send a transaction from another account
  //       await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
  //         "You aren't the owner"
  //       );
  //     });

  //     it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
  //       const { lock, unlockTime } = await loadFixture(
  //         deployWojak
  //       );

  //       // Transactions are sent using the first signer by default
  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).not.to.be.reverted;
  //     });
  //   });

  //   describe("Events", function () {
  //     it("Should emit an event on withdrawals", async function () {
  //       const { lock, unlockTime, lockedAmount } = await loadFixture(
  //         deployWojak
  //       );

  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw())
  //         .to.emit(lock, "Withdrawal")
  //         .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
  //     });
  //   });

  //   describe("Transfers", function () {
  //     it("Should transfer the funds to the owner", async function () {
  //       const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
  //         deployWojak
  //       );

  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).to.changeEtherBalances(
  //         [owner, lock],
  //         [lockedAmount, -lockedAmount]
  //       );
  //     });
  //   });
  // });
});

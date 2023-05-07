import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import RouterABI from "@uniswap/v2-periphery/build/IUniswapV2Router02.json";
import FactoryABI from "@uniswap/v2-periphery/build/IUniswapV2Factory.json";
import WETH_ABI from "@uniswap/v2-periphery/build/WETH9.json";

const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const UNISWAP_FACTORY_ADDRESS = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

describe("Wojak", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployWojak() {

    // Contracts are deployed using the first signer/account by default
    const [owner, user1, user2, user3, otherAccount] = await ethers.getSigners();

    const Wojak = await ethers.getContractFactory("Wojak");
    const wojak = await Wojak.deploy();

    const router = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, RouterABI.abi, owner)
    const factory = new ethers.Contract(UNISWAP_FACTORY_ADDRESS, FactoryABI.abi, owner)
    const weth = new ethers.Contract(WETH_ADDRESS, WETH_ABI.abi, owner)
    return { wojak, router, factory, weth, owner, user1, user2, user3, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right marketingWallet", async function () {
      const { wojak, router, factory, weth, owner, otherAccount } = await loadFixture(deployWojak);
      console.log("wojak address:", wojak.address)
      console.log("owner address:", owner.address)
      console.log("otherAccount address:", otherAccount.address)

      expect(await wojak.marketingWallet()).to.equal("0x7BbcE391B3B2e35270a9691508bBE4485A38BF7F");

      console.log("Wojak token Info")
      console.log("wojak decimals:", await wojak.decimals())
      console.log("wojak name:", await wojak.name())
      console.log("wojak symbol:", await wojak.symbol())
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

      console.log('user list that except from fee')
      const marketingWallet = await wojak.marketingWallet()
      const listOfExcludedFromFee = [owner.address, marketingWallet, wojak.address]
      console.log(listOfExcludedFromFee)

      console.log('user list that anti whale')
      const pair = await wojak.uniswapV2Pair()
      const whiteList = [owner.address, wojak.address, pair]
      console.log(whiteList)

      console.log("Router Info")
      console.log("Router address:", router.address)
      console.log("Router factory:", await router.factory())
      console.log("Router WETH:", await router.WETH())

      console.log("Factory Info")
      console.log("Factory address:", factory.address)
      console.log("Factory factory:", await factory.allPairsLength())
      console.log("Factory feeTo:", await factory.feeTo())
      console.log("Factory feeToSetter:", await factory.feeToSetter())

      console.log("WETH Info")
      console.log("WETH address:", weth.address)
      console.log("WETH name:", await weth.name())
      console.log("WETH symbol:", await weth.symbol())
    });
  });

  describe("AddLiquidity, Swap, RemoveLiquidity", function () {
    it("AddLiquidity", async function () {
      const { wojak, router, factory, weth, owner, user1, user2, user3, otherAccount } = await loadFixture(deployWojak);

      console.log("before balance of Wojak: ", ethers.utils.formatEther(await wojak.balanceOf(owner.address)), "Wojak")
      console.log("before balance of ETH: ", ethers.utils.formatEther(await owner.getBalance()), "ETH")
      await wojak.approve(router.address, ethers.utils.parseEther("10000000"))

      await router.addLiquidityETH(wojak.address, ethers.utils.parseEther("5000000"), 0,0, owner.address, 10000000000, {value: ethers.utils.parseEther("500")})

      console.log("after balance of Wojak: ", ethers.utils.formatEther(await wojak.balanceOf(owner.address)), "Wojak")
      console.log("after balance of ETH: ", ethers.utils.formatEther(await owner.getBalance()), "ETH")

      await wojak.configureExempted([user1.address], true)
      await wojak.configureExempted([user2.address], false)

      await wojak.transfer(user1.address, ethers.utils.parseEther("1000000"))
      await wojak.transfer(user2.address, ethers.utils.parseEther("1000000"))
    });
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

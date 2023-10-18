const { expect } = require("chai");
const { ethers } = require("hardhat");

const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const DAI_WHALE = "0xe81D6f03028107A20DBc83176DA82aE8099E9C42";

describe("LiquidityExamples", () => {
  let liquidityExamples;
  let accounts;
  let dai;
  let weth;

  before(async () => {
    accounts = await ethers.getSigners(1);

    const LiquidityExamples = await ethers.getContractFactory(
      "UniswapV3Liquidity"
    );
    liquidityExamples = await LiquidityExamples.deploy();
    await liquidityExamples.waitForDeployment();

    dai = await ethers.getContractAt("IERC20", DAI);
    weth = await ethers.getContractAt("IWETH", WETH);

    // Unlock DAI whales
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [DAI_WHALE],
    });

    const daiWhale = await ethers.getSigner(DAI_WHALE);

    // Send DAI to accounts[0]
    const daiAmount = ethers.parseEther("20");

    expect(await dai.balanceOf(daiWhale.address)).to.gte(daiAmount);

    await dai.connect(daiWhale).transfer(accounts[0].address, daiAmount);

    await weth.deposit({ value: ethers.parseEther("10") });
  });

  it("mintNewPosition", async () => {
    const daiAmount = ethers.parseEther("10");
    const wethAmount = ethers.parseEther("1");

    await dai.approve(liquidityExamples, daiAmount);
    await weth.approve(liquidityExamples, daiAmount);

    console.log(
      "DAI balance before add liquidity",
      await dai.balanceOf(accounts[0].address)
    );
    console.log(
      "WETH balance before add liquidity",
      await weth.balanceOf(accounts[0].address)
    );

    // minting new position
    await liquidityExamples.mintNewPosition(daiAmount, wethAmount);

    console.log(
      "DAI balance after add liquidity",
      await dai.balanceOf(accounts[0].address)
    );
    console.log(
      "WETH balance after add liquidity",
      await weth.balanceOf(accounts[0].address)
    );
  });

  it("increaseLiquidityCurrentRange", async () => {
    const daiAmount = ethers.parseEther("1");
    const wethAmount = ethers.parseEther("0.1");

    await dai.connect(accounts[0]).approve(liquidityExamples, daiAmount);
    await weth.connect(accounts[0]).approve(liquidityExamples, wethAmount);

    await liquidityExamples.increaseLiquidityCurrentRange(
      daiAmount,
      wethAmount
    );
  });

  it("decreaseLiquidity", async () => {
    const tokenId = await liquidityExamples.tokenId();
    const liquidity = await liquidityExamples.getLiquidity(tokenId);

    await liquidityExamples.decreaseLiquidity(liquidity);

    console.log("--- decrease liquidity ---");
    console.log(`liquidity ${liquidity}`);
    console.log(`dai ${await dai.balanceOf(liquidityExamples)}`);
    console.log("weth", await weth.balanceOf(liquidityExamples));
  });

  it("collectAllFees", async () => {
    await liquidityExamples.collectAllFees();

    console.log("--- collect fees ---");
    console.log(`dai ${await dai.balanceOf(liquidityExamples)}`);
    console.log(`weth ${await weth.balanceOf(liquidityExamples)}`);
  });
});

import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Counter", function () {
  let counter: Contract;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;

  beforeEach(async function () {
    const Counter = await ethers.getContractFactory("Counter");
    [owner, user] = await ethers.getSigners();
    counter = await Counter.deploy();
    await counter.deployed();
  });

  it("Should set the right owner", async function () {
    expect(await counter.owner()).to.equal(owner.address);
  });

  it("Should increment and decrement correctly", async function () {
    expect(await counter.count()).to.equal(0);
    
    await counter.increment();
    expect(await counter.count()).to.equal(1);
    
    await counter.decrement();
    expect(await counter.count()).to.equal(0);
  });

  it("Should fail when decrementing below zero", async function () {
    await expect(counter.decrement()).to.be.revertedWith("Counter: cannot decrement below zero");
  });

  it("Should reset the counter correctly", async function () {
    await counter.increment();
    await counter.increment();
    expect(await counter.count()).to.equal(2);
    
    await counter.reset();
    expect(await counter.count()).to.equal(0);
  });

  it("Should set count to a specific value", async function () {
    await counter.setCount(10);
    expect(await counter.count()).to.equal(10);
  });

  it("Should fail when non-owner tries to reset", async function () {
    await counter.connect(user).increment();
    await expect(counter.connect(user).reset()).to.be.revertedWith("Counter: caller is not the owner");
  });

  it("Should fail when non-owner tries to set count", async function () {
    await expect(counter.connect(user).setCount(5)).to.be.revertedWith("Counter: caller is not the owner");
  });

  it("Should emit CountUpdated event on actions", async function () {
    await expect(counter.increment())
      .to.emit(counter, "CountUpdated")
      .withArgs(owner.address, 1);

    await expect(counter.decrement())
      .to.emit(counter, "CountUpdated")
      .withArgs(owner.address, 0);
    
    await expect(counter.setCount(5))
      .to.emit(counter, "CountUpdated")
      .withArgs(owner.address, 5);
    
    await expect(counter.reset())
      .to.emit(counter, "CountUpdated")
      .withArgs(owner.address, 0);
  });
});

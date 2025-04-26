import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Counter", function () {
  let counter: Contract;
  let owner: HardhatEthersSigner;
  let user: HardhatEthersSigner;

  beforeEach(async function () {
    const Counter = await ethers.getContractFactory("Counter");
    [owner, user] = await ethers.getSigners();
    counter = await Counter.deploy();
  });

  it("Should set the right owner", async function () {
    expect(await counter.owner()).to.equal(owner.address);
  });

  it("Should increment and decrement correctly", async function () {
    expect(await counter.count()).to.equal(0n);
    
    await counter.increment();
    expect(await counter.count()).to.equal(1n);
    
    await counter.decrement();
    expect(await counter.count()).to.equal(0n);
  });

  it("Should fail when decrementing below zero", async function () {
    await expect(counter.decrement()).to.be.revertedWith("Counter: cannot decrement below zero");
  });

  it("Should reset the counter correctly", async function () {
    await counter.increment();
    await counter.increment();
    expect(await counter.count()).to.equal(2n);
    
    await counter.reset();
    expect(await counter.count()).to.equal(0n);
  });

  it("Should set count to a specific value", async function () {
    await counter.setCount(10);
    expect(await counter.count()).to.equal(10n);
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
      .withArgs(owner.address, 1n);

    await expect(counter.decrement())
      .to.emit(counter, "CountUpdated")
      .withArgs(owner.address, 0n);
    
    await expect(counter.setCount(5))
      .to.emit(counter, "CountUpdated")
      .withArgs(owner.address, 5n);
    
    await expect(counter.reset())
      .to.emit(counter, "CountUpdated")
      .withArgs(owner.address, 0n);
  });
});

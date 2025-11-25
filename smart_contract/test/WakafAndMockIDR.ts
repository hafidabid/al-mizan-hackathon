import { expect } from "chai";
import { network } from "hardhat";

describe("MockIDR and Wakaf integration", () => {
  it("deploys MockIDR with correct decimals and initial supply", async () => {
    const { ethers } = await network.connect();
    const [owner, holder1, holder2] = await ethers.getSigners();

    const MockIDR = await ethers.getContractFactory("MockIDR");
    const mockIdr = (await MockIDR.deploy(owner.address, [
      holder1.address,
      holder2.address,
    ])) as any;
    await mockIdr.waitForDeployment();

    expect(await mockIdr.decimals()).to.equal(6);

    const expectedPerAddress =
      1_000_000_000n * 10n ** BigInt(await mockIdr.decimals());

    expect(await mockIdr.balanceOf(owner.address)).to.equal(expectedPerAddress);
    expect(await mockIdr.balanceOf(holder1.address)).to.equal(
      expectedPerAddress
    );
    expect(await mockIdr.balanceOf(holder2.address)).to.equal(
      expectedPerAddress
    );

    // owner can mint additional tokens
    await mockIdr.mint(holder1.address, 1_000n);
    expect(await mockIdr.balanceOf(holder1.address)).to.equal(
      expectedPerAddress + 1_000n
    );
  });

  it("allows a nazir to move funds out of Wakaf using MockIDR", async () => {
    const { ethers } = await network.connect();
    const [deployer, nazir, recipient] = await ethers.getSigners();

    // Deploy MockIDR with deployer as owner and nazir as an initial holder
    const MockIDR = await ethers.getContractFactory("MockIDR");
    const mockIdr = (await MockIDR.deploy(deployer.address, [
      nazir.address,
    ])) as any;
    await mockIdr.waitForDeployment();

    const decimals = await mockIdr.decimals();
    const amountToDeposit = 1_000_000n * 10n ** BigInt(decimals);

    // Deploy Wakaf with nazir as the initial nazir/owner
    const Wakaf = await ethers.getContractFactory("Wakaf");
    const wakaf = (await Wakaf.deploy(nazir.address)) as any;
    await wakaf.waitForDeployment();

    // Transfer some MockIDR from nazir to the Wakaf contract
    await mockIdr
      .connect(nazir)
      .transfer(await wakaf.getAddress(), amountToDeposit);

    expect(await mockIdr.balanceOf(await wakaf.getAddress())).to.equal(
      amountToDeposit
    );

    // Nazir calls moneyOut to send funds from Wakaf to recipient
    await wakaf
      .connect(nazir)
      .moneyOut(
        await mockIdr.getAddress(),
        amountToDeposit,
        recipient.address,
        "Funding"
      );

    expect(await mockIdr.balanceOf(await wakaf.getAddress())).to.equal(0n);
    expect(await mockIdr.balanceOf(recipient.address)).to.equal(
      amountToDeposit
    );

    // The moneyOut record should be stored
    const record = await wakaf.getMoneyOut(nazir.address, 0);
    expect(record.amount).to.equal(amountToDeposit);
    expect(record.tokenAddress).to.equal(await mockIdr.getAddress());
    expect(record.reason).to.equal("Funding");
  });

  it("allows owner to add and remove nazir", async () => {
    const { ethers } = await network.connect();
    const [deployer, initialNazir, newNazir] = await ethers.getSigners();

    const Wakaf = await ethers.getContractFactory("Wakaf");
    const wakaf = (await Wakaf.deploy(initialNazir.address)) as any;
    await wakaf.waitForDeployment();

    // initialNazir is set in constructor
    expect(await wakaf.getNazir(initialNazir.address)).to.equal(true);

    // only owner (initialNazir) can add a new nazir
    await wakaf.connect(initialNazir).addNazir(newNazir.address);
    expect(await wakaf.getNazir(newNazir.address)).to.equal(true);

    // owner can remove a nazir
    await wakaf.connect(initialNazir).removeNazir(newNazir.address);
    expect(await wakaf.getNazir(newNazir.address)).to.equal(false);
  });

  it("reverts when non-nazir calls moneyOut", async () => {
    const { ethers } = await network.connect();
    const [deployer, nazir, stranger, recipient] = await ethers.getSigners();

    const MockIDR = await ethers.getContractFactory("MockIDR");
    const mockIdr = (await MockIDR.deploy(deployer.address, [
      nazir.address,
    ])) as any;
    await mockIdr.waitForDeployment();

    const decimals = await mockIdr.decimals();
    const amountToDeposit = 1_000_000n * 10n ** BigInt(decimals);

    const Wakaf = await ethers.getContractFactory("Wakaf");
    const wakaf = (await Wakaf.deploy(nazir.address)) as any;
    await wakaf.waitForDeployment();

    // Fund Wakaf with MockIDR from nazir
    await mockIdr
      .connect(nazir)
      .transfer(await wakaf.getAddress(), amountToDeposit);

    // stranger is not a nazir and should be reverted on moneyOut
    await expect(
      wakaf
        .connect(stranger)
        .moneyOut(
          await mockIdr.getAddress(),
          amountToDeposit,
          recipient.address,
          "Unauthorized"
        )
    ).to.be.revert(ethers);
  });

  it("reverts when trying to send more than Wakaf balance", async () => {
    const { ethers } = await network.connect();
    const [deployer, nazir, recipient] = await ethers.getSigners();

    const MockIDR = await ethers.getContractFactory("MockIDR");
    const mockIdr = (await MockIDR.deploy(deployer.address, [
      nazir.address,
    ])) as any;
    await mockIdr.waitForDeployment();

    const decimals = await mockIdr.decimals();
    const smallAmount = 1_000n * 10n ** BigInt(decimals);
    const bigAmount = 10_000n * 10n ** BigInt(decimals);

    const Wakaf = await ethers.getContractFactory("Wakaf");
    const wakaf = (await Wakaf.deploy(nazir.address)) as any;
    await wakaf.waitForDeployment();

    // Deposit only a small amount
    await mockIdr
      .connect(nazir)
      .transfer(await wakaf.getAddress(), smallAmount);

    // Try to send more than available amount; should revert
    await expect(
      wakaf
        .connect(nazir)
        .moneyOut(
          await mockIdr.getAddress(),
          bigAmount,
          recipient.address,
          "Too much"
        )
    ).to.be.revert(ethers);
  });

  it("reverts when reading out-of-range moneyOut index", async () => {
    const { ethers } = await network.connect();
    const [deployer, nazir] = await ethers.getSigners();

    const Wakaf = await ethers.getContractFactory("Wakaf");
    const wakaf = (await Wakaf.deploy(nazir.address)) as any;
    await wakaf.waitForDeployment();

    // No moneyOut records yet; index 0 should revert
    await expect(wakaf.getMoneyOut(nazir.address, 0)).to.be.revert(ethers);
  });

  it("only allows MockIDR owner to mint and burn", async () => {
    const { ethers } = await network.connect();
    const [owner, other] = await ethers.getSigners();

    const MockIDR = await ethers.getContractFactory("MockIDR");
    const mockIdr = (await MockIDR.deploy(owner.address, [])) as any;
    await mockIdr.waitForDeployment();

    // owner can mint to other
    await mockIdr.mint(other.address, 1_000n);
    expect(await mockIdr.balanceOf(other.address)).to.equal(1_000n);

    // non‑owner cannot mint
    await expect(
      mockIdr.connect(other).mint(other.address, 1_000n)
    ).to.be.revert(ethers);

    // owner can burn from other
    await mockIdr.burn(other.address, 500n);
    expect(await mockIdr.balanceOf(other.address)).to.equal(500n);

    // non‑owner cannot burn
    await expect(mockIdr.connect(other).burn(other.address, 100n)).to.be.revert(
      ethers
    );
  });

  it("emits events for Nazir management and moneyOut", async () => {
    const { ethers } = await network.connect();
    const [deployer, initialNazir, newNazir, recipient] =
      await ethers.getSigners();

    const MockIDR = await ethers.getContractFactory("MockIDR");
    const mockIdr = (await MockIDR.deploy(deployer.address, [
      initialNazir.address,
    ])) as any;
    await mockIdr.waitForDeployment();

    const decimals = await mockIdr.decimals();
    const amount = 5_000n * 10n ** BigInt(decimals);

    const Wakaf = await ethers.getContractFactory("Wakaf");
    const wakaf = (await Wakaf.deploy(initialNazir.address)) as any;
    await wakaf.waitForDeployment();

    // Nazir management events
    await expect(wakaf.connect(initialNazir).addNazir(newNazir.address))
      .to.emit(wakaf, "NazirAdded")
      .withArgs(newNazir.address);

    await expect(wakaf.connect(initialNazir).removeNazir(newNazir.address))
      .to.emit(wakaf, "NazirRemoved")
      .withArgs(newNazir.address);

    // Fund Wakaf and check MoneyOut event
    await mockIdr
      .connect(initialNazir)
      .transfer(await wakaf.getAddress(), amount);

    await expect(
      wakaf
        .connect(initialNazir)
        .moneyOut(
          await mockIdr.getAddress(),
          amount,
          recipient.address,
          "Event test"
        )
    )
      .to.emit(wakaf, "MoneyOutEvent")
      .withArgs(
        initialNazir.address,
        recipient.address,
        amount,
        await mockIdr.getAddress(),
        "Event test"
      );
  });
});

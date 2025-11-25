import { network } from "hardhat";
import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

/**
 * Simple deployment script for MockIDR and Wakaf.
 *
 * Reads the initial IDR owner and Nazir addresses from environment variables:
 * - IDR_OWNER_ADDRESS: address that will be the owner of MockIDR
 * - NAZIR_ADDRESS: address that will be the initial Nazir (and owner) of Wakaf
 * - INITIAL_HOLDERS: optional comma-separated list of addresses that
 *   will receive the initial MockIDR supply in addition to the owner.
 *
 * Example:
 *   IDR_OWNER_ADDRESS=0x... NAZIR_ADDRESS=0x... INITIAL_HOLDERS=0x1...,0x2... \
 *   npx hardhat run scripts/deploy.ts --network sepolia
 */

const { ethers } = await network.connect();

const [deployer] = await ethers.getSigners();

const idrOwnerFromEnv = process.env.IDR_OWNER_ADDRESS;
const nazirFromEnv = process.env.NAZIR_ADDRESS;
const initialHoldersEnv = process.env.INITIAL_HOLDERS;

const idrOwner =
  idrOwnerFromEnv && idrOwnerFromEnv !== ""
    ? idrOwnerFromEnv
    : deployer.address;

const nazir =
  nazirFromEnv && nazirFromEnv !== "" ? nazirFromEnv : deployer.address;

const initialHolders =
  initialHoldersEnv && initialHoldersEnv.trim().length > 0
    ? initialHoldersEnv
        .split(",")
        .map((a: string) => a.trim())
        .filter((a) => a !== "")
    : [];

console.log("Deploying contracts with deployer:", deployer.address);
console.log("MockIDR owner:", idrOwner);
console.log("Wakaf initial nazir:", nazir);
console.log("MockIDR initial holders:", initialHolders);

// Deploy MockIDR
const MockIDR = await ethers.getContractFactory("MockIDR");
const mockIdr = await MockIDR.deploy(idrOwner, initialHolders);
await mockIdr.waitForDeployment();

console.log("MockIDR deployed at:", await mockIdr.getAddress());

// Deploy Wakaf
const Wakaf = await ethers.getContractFactory("Wakaf");
const wakaf = await Wakaf.deploy(nazir);
await wakaf.waitForDeployment();

console.log("Wakaf deployed at:", await wakaf.getAddress());

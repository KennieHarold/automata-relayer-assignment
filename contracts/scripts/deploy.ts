import { ethers } from 'hardhat';

async function main() {
  const Token1 = await ethers.getContractFactory('Token1');
  const token1 = await Token1.deploy();
  token1.deployed();
  console.log(`Token1 deployed at ${token1.address}`);

  const Token2 = await ethers.getContractFactory('Token2');
  const token2 = await Token2.deploy();
  token2.deployed();
  console.log(`Token2 deployed at ${token2.address}`);

  const Token3 = await ethers.getContractFactory('Token3');
  const token3 = await Token3.deploy();
  token3.deployed();
  console.log(`Token3 deployed at ${token3.address}`);

  const Receiver = await ethers.getContractFactory('Receiver');
  const receiver = await Receiver.deploy([token1.address, token2.address, token3.address]);
  receiver.deployed();
  console.log(`Receiver deployed at ${receiver.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

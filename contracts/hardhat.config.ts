import { HardhatUserConfig, task } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-ethers';
import dotenv from 'dotenv';

dotenv.config();

task('airdrop', 'Airdrop test tokens')
  .addParam('token', 'The token address')
  .addParam('recipient', 'The recipient')
  .setAction(async ({ token, recipient }, { ethers }) => {
    const [signer] = await ethers.getSigners();
    const abi = ['function transfer(address to, uint256 amount) external'];
    const erc20 = new ethers.Contract(token, abi, signer);
    await erc20.connect(signer).transfer(recipient, ethers.utils.parseEther('100'));
    console.log('Airdrop tokens');
  });

const config: HardhatUserConfig = {
  solidity: '0.8.17',
  networks: {
    hardhat: {},
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIV_KEY as string],
      chainId: 11155111
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIV_KEY as string],
      chainId: 5
    }
  }
};

export default config;

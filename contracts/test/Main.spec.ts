import chai, { expect } from 'chai';
import ChaiAsPromised from 'chai-as-promised';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { IERC20, Receiver } from '../typechain-types';

chai.use(ChaiAsPromised);

const { parseEther } = ethers.utils;

interface IERC20WithAddress extends IERC20 {
  address: string;
}

interface ReceiverWithAddress extends Receiver {
  address: string;
}

interface ContractConfig {
  contractName: 'Receiver';
  tokenNames: string[];
  domainName: string;
  tokensMinted: string;
  gasLimit: number;
}

const ContractConfig: ContractConfig = {
  contractName: 'Receiver',
  tokenNames: ['Token1', 'Token2', 'Token3'],
  domainName: 'AutomataRelayerDapp',
  tokensMinted: '1000000',
  gasLimit: 100000
};

describe('Main test suite', function () {
  let [owner, user1, user2, user3, receiver1, receiver2, receiver3]: SignerWithAddress[] = [];
  let receiverContract: ReceiverWithAddress;
  let tokens: IERC20WithAddress[] = [];
  let airdropAmount = '1000';

  let domain = {
    name: ContractConfig.domainName,
    version: '1',
    chainId: 31337,
    verifyingContract: '0x'
  };

  let types = {
    MetaTx: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'nonce', type: 'uint256' }
    ]
  };

  before(async function () {
    [owner, user1, user2, user3, receiver1, receiver2, receiver3] = await ethers.getSigners();
  });

  describe('#Deployment', function () {
    it('should deploy erc20 contracts', async function () {
      for (let tokenName of ContractConfig.tokenNames) {
        const Token = await ethers.getContractFactory(tokenName);
        const token = (await Token.deploy()) as unknown as IERC20WithAddress;
        await token.deployed();
        tokens.push(token);
      }
    });

    it('should deploy receiver contract', async function () {
      const Contract = await ethers.getContractFactory(ContractConfig.contractName);
      receiverContract = (await Contract.deploy(
        tokens.map((token) => token.address)
      )) as ReceiverWithAddress;
      await receiverContract.deployed();
      domain.verifyingContract = receiverContract.address;
    });

    it('should deployer own the tokens', async function () {
      expect(await tokens[0].balanceOf(owner.address)).to.eq(
        parseEther(ContractConfig.tokensMinted)
      );
      expect(await tokens[1].balanceOf(owner.address)).to.eq(
        parseEther(ContractConfig.tokensMinted)
      );
      expect(await tokens[2].balanceOf(owner.address)).to.eq(
        parseEther(ContractConfig.tokensMinted)
      );
    });
  });

  describe('#Batch Transaction', function () {
    let [txData1, txData2, txData3]: any[] = [];

    it('should airdrop tokens', async function () {
      for (const token of tokens) {
        await token.transfer(user1.address, parseEther(airdropAmount).toString());
        await token.transfer(user2.address, parseEther(airdropAmount).toString());
        await token.transfer(user3.address, parseEther(airdropAmount).toString());

        expect(await token.balanceOf(user1.address)).to.eq(parseEther(airdropAmount));
        expect(await token.balanceOf(user2.address)).to.eq(parseEther(airdropAmount));
        expect(await token.balanceOf(user3.address)).to.eq(parseEther(airdropAmount));
      }
    });

    beforeEach(async () => {
      txData1 = {
        from: user1.address,
        to: receiver1.address,
        token: tokens[0].address,
        amount: parseEther('1'),
        nonce: Number(await receiverContract.getNonce(user1.address))
      };

      txData2 = {
        from: user2.address,
        to: receiver2.address,
        token: tokens[1].address,
        amount: parseEther('1'),
        nonce: Number(await receiverContract.getNonce(user2.address))
      };

      txData3 = {
        from: user3.address,
        to: receiver3.address,
        token: tokens[2].address,
        amount: parseEther('1'),
        nonce: Number(await receiverContract.getNonce(user3.address))
      };
    });

    it('should batch transaction', async function () {
      await tokens[0].connect(user1).approve(receiverContract.address, parseEther('1'));
      await tokens[1].connect(user2).approve(receiverContract.address, parseEther('1'));
      await tokens[2].connect(user3).approve(receiverContract.address, parseEther('1'));

      const tx1Signature = user1._signTypedData(domain, types, txData1);
      const tx2Signature = user2._signTypedData(domain, types, txData2);
      const tx3Signature = user3._signTypedData(domain, types, txData3);

      await receiverContract.batchTransfer(
        [
          { metaTx: txData1, signature: tx1Signature },
          { metaTx: txData2, signature: tx2Signature },
          { metaTx: txData3, signature: tx3Signature }
        ],
        ContractConfig.gasLimit
      );

      expect(await tokens[0].balanceOf(receiver1.address)).to.eq(parseEther('1'));
      expect(await tokens[1].balanceOf(receiver2.address)).to.eq(parseEther('1'));
      expect(await tokens[2].balanceOf(receiver3.address)).to.eq(parseEther('1'));
    });

    it('should continue even one transaction is malformed', async function () {
      await tokens[0].connect(user1).approve(receiverContract.address, parseEther('1'));
      await tokens[1].connect(user2).approve(receiverContract.address, parseEther('1'));
      await tokens[2].connect(user3).approve(receiverContract.address, parseEther('1'));

      const tx1Signature = user1._signTypedData(domain, types, txData1);
      const tx2Signature = user2._signTypedData(domain, types, txData2);

      // We intentionally sign this transaction to a different user
      const tx3Signature = user2._signTypedData(domain, types, txData3);

      await receiverContract.batchTransfer(
        [
          { metaTx: txData1, signature: tx1Signature },
          { metaTx: txData2, signature: tx2Signature },
          { metaTx: txData3, signature: tx3Signature }
        ],
        ContractConfig.gasLimit
      );

      expect(await tokens[0].balanceOf(receiver1.address)).to.eq(parseEther('2'));
      expect(await tokens[1].balanceOf(receiver2.address)).to.eq(parseEther('2'));
      expect(await tokens[2].balanceOf(receiver3.address)).to.eq(parseEther('1'));
    });
  });
});

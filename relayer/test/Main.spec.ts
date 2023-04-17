// Import dependencies
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../src/app';
import config from 'config';
import { Contract } from '@/types';
import { ethers } from 'ethers';

// Configure Chai
chai.use(chaiHttp);
chai.should();

const rpcUrl = config.get<string>('rpcUrl');
const contract = config.get<Contract>('contract');

const domain = {
  name: 'AutomataRelayerDapp',
  version: '1',
  chainId: 31337,
  verifyingContract: contract.address.localhost
};

const types = {
  MetaTx: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'token', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'nonce', type: 'uint256' }
  ]
};

const hardhatPks = [
  '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
  '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
  '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
  '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba',
  '0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e'
];

describe('Relayer test suite', () => {
  describe('GET /', () => {
    it('should return a 200 status code for ', (done) => {
      chai
        .request(app)
        .get('/')
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('POST /transaction', () => {
    it('should post transaction', (done) => {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const sender = new ethers.Wallet(hardhatPks[0], provider);
      const receiver = new ethers.Wallet(hardhatPks[1]);

      const txData = {
        from: sender.address,
        to: receiver.address,
        token: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        amount: ethers.parseEther('1').toString(),
        nonce: 0
      };

      sender.signTypedData(domain, types, txData).then((signature) => {
        chai
          .request(app)
          .post('/transaction')
          .send({ metaTx: txData, signature })
          .end((err, res) => {
            res.should.have.status(201);
            done();
          });
      });
    });
  });
});

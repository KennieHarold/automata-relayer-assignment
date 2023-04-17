import dotenv from 'dotenv';

dotenv.config();

export default {
  port: 8080,
  domainName: 'AutomataRelayerDapp',
  host: 'localhost',
  privKey: process.env.PRIV_KEY,
  rpcUrl: 'http://127.0.0.1:8545/',
  chainId: 31337,
  network: 'localhost',
  relayerInterval: 1 * 60 * 1000, // 1 minute
  contract: {
    address: {
      localhost: '0xcbEAF3BDe82155F56486Fb5a1072cb8baAf547cc',
      goerli: ''
    },
    gasLimit: 100000,
    abi: [
      {
        inputs: [
          {
            components: [
              {
                components: [
                  {
                    internalType: 'address',
                    name: 'from',
                    type: 'address'
                  },
                  {
                    internalType: 'address',
                    name: 'to',
                    type: 'address'
                  },
                  {
                    internalType: 'address',
                    name: 'token',
                    type: 'address'
                  },
                  {
                    internalType: 'uint256',
                    name: 'amount',
                    type: 'uint256'
                  },
                  {
                    internalType: 'uint256',
                    name: 'nonce',
                    type: 'uint256'
                  }
                ],
                internalType: 'struct Receiver.MetaTx',
                name: 'metaTx',
                type: 'tuple'
              },
              {
                internalType: 'bytes',
                name: 'signature',
                type: 'bytes'
              }
            ],
            internalType: 'struct Receiver.MetaTxWithSig[]',
            name: '_metaTxWithSig',
            type: 'tuple[]'
          },
          {
            internalType: 'uint256',
            name: 'gas',
            type: 'uint256'
          }
        ],
        name: 'batchTransfer',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: 'from',
            type: 'address'
          }
        ],
        name: 'getNonce',
        outputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256'
          }
        ],
        stateMutability: 'view',
        type: 'function'
      }
    ]
  }
};

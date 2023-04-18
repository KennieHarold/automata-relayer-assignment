import dotenv from 'dotenv';

dotenv.config();

export default {
  port: 8080,
  domainName: 'AutomataRelayerDapp',
  host: 'localhost',
  privKey: process.env.PRIV_KEY,
  rpcUrl: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
  chainId: 5,
  network: 'goerli',
  relayerInterval: 3 * 60 * 1000, // 3 minutes
  contract: {
    address: {
      localhost: '',
      goerli: process.env.RECEIVER_CONTRACT
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

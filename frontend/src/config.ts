export type Networks = 'localhost' | 'goerli';

export type TokenNames = 'Token1' | 'Token2' | 'Token3';

interface ConfigInterface {
  apiUrl: string;
  network: Networks;
  chainId: number;
  domainName: string;
  contract: {
    address: Record<Networks, string>;
    gasLimit: number;
    abi: any[];
  };
  erc20: {
    abi: any[];
  };
  tokens: Record<TokenNames, { address: Record<Networks, string> }>;
}

const Config: ConfigInterface = {
  apiUrl: 'http://localhost:8080',
  network: 'localhost',
  chainId: 31337,
  domainName: 'AutomataRelayerDapp',
  contract: {
    address: {
      localhost: '0xcbEAF3BDe82155F56486Fb5a1072cb8baAf547cc',
      goerli: ''
    },
    gasLimit: 0,
    abi: [
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
  },
  erc20: {
    abi: [
      {
        inputs: [
          {
            internalType: 'address',
            name: 'spender',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256'
          }
        ],
        name: 'approve',
        outputs: [
          {
            internalType: 'bool',
            name: '',
            type: 'bool'
          }
        ],
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: 'account',
            type: 'address'
          }
        ],
        name: 'balanceOf',
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
  },
  tokens: {
    Token1: {
      address: {
        localhost: '0x7bc06c482DEAd17c0e297aFbC32f6e63d3846650',
        goerli: ''
      }
    },
    Token2: {
      address: {
        localhost: '0xc351628EB244ec633d5f21fBD6621e1a683B1181',
        goerli: ''
      }
    },
    Token3: {
      address: {
        localhost: '0xFD471836031dc5108809D173A067e8486B9047A3',
        goerli: ''
      }
    }
  }
};

export default Config;

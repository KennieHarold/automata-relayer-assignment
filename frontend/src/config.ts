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
  network: 'goerli',
  chainId: 5,
  domainName: 'AutomataRelayerDapp',
  contract: {
    address: {
      localhost: '',
      goerli: process.env.REACT_APP_RECEIVER_CONTRACT as string
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
        localhost: '',
        goerli: process.env.REACT_APP_TOKEN1_CONTRACT as string
      }
    },
    Token2: {
      address: {
        localhost: '',
        goerli: process.env.REACT_APP_TOKEN2_CONTRACT as string
      }
    },
    Token3: {
      address: {
        localhost: '',
        goerli: process.env.REACT_APP_TOKEN3_CONTRACT as string
      }
    }
  }
};

export default Config;

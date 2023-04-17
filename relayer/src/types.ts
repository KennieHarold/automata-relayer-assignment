export interface Transaction {
  metaTx: {
    from: string;
    to: string;
    amount: bigint;
    nonce: number;
    token: string;
  };
  signature: string;
}

export interface Contract {
  address: {
    localhost: string;
    goerli: '';
  };
  gasLimit: number;
  abi: any[];
}

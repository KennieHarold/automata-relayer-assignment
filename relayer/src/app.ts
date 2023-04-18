import express, { Request } from 'express';
import { createServer } from 'http';
import config from 'config';
import cors from 'cors';
import { log, reportError } from '@/utils/logger';
import { ethers } from 'ethers';
import { Transaction, Contract } from './types';
import { validateBody } from './utils/validate';

declare global {
  var transactions: Transaction[];
}

globalThis.transactions = [];

const receiver = config.get<Contract>('contract');
const network = config.get<'localhost' | 'goerli'>('network');

const domain = {
  name: config.get<string>('domainName'),
  version: '1',
  chainId: config.get<string>('chainId'),
  verifyingContract: receiver.address[network]
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

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.set('trust proxy', 1);
app.use(cors());

// Setup contract
const provider = new ethers.JsonRpcProvider(config.get<string>('rpcUrl'));
const signer = new ethers.Wallet(config.get<string>('privKey'), provider);
const contract = new ethers.Contract(receiver.address[network], receiver.abi, signer);

// Routes
app.get('/', (_, res) => res.send('Hello world!'));
app.get('/transaction', (_, res) => res.status(200).json(transactions));

app.post('/transaction', async (req: Request<{}, {}, Transaction>, res) => {
  const isValidBody = validateBody(req.body);
  if (!isValidBody) return res.status(400).send('Malformed message');

  const { metaTx, signature } = req.body;

  // We have to make sure that all properties are in the right type
  const metaTxParsed = {
    from: String(metaTx.from),
    to: String(metaTx.to),
    token: String(metaTx.token),
    amount: BigInt(metaTx.amount),
    nonce: Number(metaTx.nonce)
  };

  const senderAsSigner = ethers.verifyTypedData(domain, types, metaTxParsed, signature);
  const nonce = Number(await contract.getNonce(metaTxParsed.from));

  if (nonce !== metaTxParsed.nonce || metaTxParsed.from !== senderAsSigner) {
    return res.status(400).send('Malformed message!');
  }

  const isAlreadyTransacted = transactions.find(
    (transaction) => transaction.metaTx.from === senderAsSigner
  );

  if (isAlreadyTransacted) {
    return res.status(429).send('Too many requests');
  }

  transactions.push({ metaTx: metaTxParsed, signature });
  log.info(`Received transaction with data ${JSON.stringify(req.body)}}`);
  return res.status(201).send('Success!');
});

async function batchTransactions() {
  if (transactions.length < 1) return;
  try {
    const gas = receiver.gasLimit;
    await contract.batchTransfer(transactions, gas);
    transactions = [];
    log.info('Successfully sent transactions!');
  } catch (error) {
    reportError(error as Error);
  }
}

// No need of any third party libraries like `node-cron`, setInterval is enough for this project
const interval = config.get<number>('relayerInterval');
setInterval(batchTransactions, interval);

// Run the server
const port = config.get<number>('port');
const host = config.get<string>('host');

console.log('✨ Relayer v1');
httpServer.listen(port, host, () => {
  log.info(`🚀 Server listening on port ${port}`);
});

export default app;

import React, { useEffect, useCallback, useReducer } from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import { Contract, JsonRpcSigner, ethers } from 'ethers';
import Config, { TokenNames } from './config';
import './App.css';

declare global {
  interface Window {
    ethereum: any;
  }
}

interface InitialState {
  account: string;
  signer: JsonRpcSigner | null;
  contract: Contract | null;
  selectedToken: string;
  amount: number | null;
  recipient: string;
  isApproved: boolean;
  balances: Record<TokenNames, string> | null;
}

const initialState: InitialState = {
  account: '',
  signer: null,
  contract: null,
  selectedToken: '',
  amount: null,
  recipient: '',
  isApproved: false,
  balances: null
};

const domain = {
  name: Config.domainName,
  version: '1',
  chainId: Config.chainId,
  verifyingContract: Config.contract.address[Config.network]
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

function App() {
  const [event, updateEvent] = useReducer((prev: InitialState, next: Record<string, any>) => {
    const newEvent = { ...prev, ...next };
    return newEvent;
  }, initialState);

  const handleApprove = async (e: any) => {
    e.preventDefault();

    if (!event.selectedToken || !event.amount) {
      alert('Missing values!');
    }

    const erc20 = new ethers.Contract(event.selectedToken, Config.erc20.abi, event.signer);
    await erc20.approve(
      Config.contract.address[Config.network],
      ethers.parseEther(String(event.amount))
    );
    updateEvent({ isApproved: true });
  };

  const handleTransfer = async (e: any) => {
    e.preventDefault();

    if (!event?.contract) {
      alert('Contract not loaded');
      return;
    }

    if (!event.selectedToken || !event?.amount || !event.recipient) {
      alert('Missing values!');
      return;
    }

    const nonce = Number(await event.contract.getNonce(event.account));

    const data = {
      from: event.signer?.address,
      to: event.recipient,
      token: event.selectedToken,
      amount: ethers.parseEther(String(event.amount)),
      nonce
    };

    const signature = await event.signer?.signTypedData(domain, types, data);

    const response = await fetch(`${Config.apiUrl}/transaction`, {
      method: 'POST',
      body: JSON.stringify({
        metaTx: {
          ...data,
          amount: String(data.amount)
        },
        signature
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok && response.status === 201) {
      alert('Successfully sent transaction!');
      updateEvent({
        selectedToken: '',
        amount: null,
        recipient: '',
        isApproved: false
      });
    }
  };

  const connectToMetaMask = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        updateEvent({ account: accounts[0], signer });

        // Setup contracts
        const contract = new ethers.Contract(
          Config.contract.address[Config.network],
          Config.contract.abi,
          signer
        );

        updateEvent({ contract });

        // Get tokens balance
        const Token1 = new ethers.Contract(
          Config.tokens.Token1.address[Config.network],
          Config.erc20.abi,
          signer
        );

        const Token2 = new ethers.Contract(
          Config.tokens.Token2.address[Config.network],
          Config.erc20.abi,
          signer
        );

        const Token3 = new ethers.Contract(
          Config.tokens.Token3.address[Config.network],
          Config.erc20.abi,
          signer
        );

        updateEvent({
          balances: {
            Token1: await Token1.balanceOf(accounts[0]),
            Token2: await Token2.balanceOf(accounts[0]),
            Token3: await Token3.balanceOf(accounts[0])
          }
        });
      } catch (err) {
        console.error('Failed to connect to MetaMask:', err);
      }
    } else {
      alert('MetaMask is not installed. Please install MetaMask and try again.');
    }
  }, []);

  useEffect(() => {
    connectToMetaMask();
  }, [connectToMetaMask]);

  return (
    <Container>
      <Row className="d-flex justify-content-center">
        <Col lg={4}>
          <div className="mt-5">
            <div className="mb-4 d-flex flex-column">
              <small className="text-muted mb">
                {`Account: ${event?.account.slice(0, 5)}...${event?.account.slice(-4)}`}
              </small>
              <small className="text-muted mb">
                {`Token1 balance: ${ethers.formatEther(String(event?.balances?.Token1 ?? 0))}`}
              </small>
              <small className="text-muted mb">
                {`Token2 balance: ${ethers.formatEther(String(event?.balances?.Token2 ?? 0))}`}
              </small>
              <small className="text-muted mb">
                {`Token3 balance: ${ethers.formatEther(String(event?.balances?.Token3 ?? 0))}`}
              </small>
            </div>
            <Form>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Recipient Address</Form.Label>
                <Form.Control
                  value={event.recipient}
                  type="text"
                  placeholder="Enter recipient address"
                  onChange={(e) => updateEvent({ recipient: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  value={event?.amount ?? ''}
                  type="number"
                  placeholder="Enter amount to transfer"
                  onChange={(e) => updateEvent({ amount: parseFloat(e.target.value) })}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Select Token</Form.Label>
                <Form.Select
                  value={event.selectedToken.toString()}
                  aria-label="Default select example"
                  onChange={(e) => updateEvent({ selectedToken: e.target.value })}
                >
                  <option>Open this select menu</option>
                  <option value={Config.tokens.Token1.address[Config.network]}>Token1</option>
                  <option value={Config.tokens.Token2.address[Config.network]}>Token2</option>
                  <option value={Config.tokens.Token3.address[Config.network]}>Token3</option>
                </Form.Select>
              </Form.Group>

              {event.isApproved ? (
                <Button variant="primary" type="submit" onClick={handleTransfer}>
                  Transfer
                </Button>
              ) : (
                <Button variant="primary" type="submit" onClick={handleApprove}>
                  Approve
                </Button>
              )}
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default App;

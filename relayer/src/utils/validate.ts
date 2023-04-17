import { Transaction } from '@/types';
import { ethers } from 'ethers';

const isValidAddress = (address: string): boolean => {
  return ethers.isAddress(address);
};

export const validateBody = (body: Transaction): boolean => {
  if (!body?.metaTx) {
    return false;
  }

  if (
    !body?.signature ||
    !isValidAddress(body.metaTx?.from) ||
    !isValidAddress(body.metaTx?.to) ||
    typeof body.metaTx?.amount !== 'string' ||
    typeof body.metaTx?.nonce !== 'number' ||
    !isValidAddress(body.metaTx?.token)
  ) {
    return false;
  }

  return true;
};

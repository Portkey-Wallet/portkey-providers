import { getTxResult as defaultGetTxResult } from '@portkey/contracts';
import AElf from 'aelf-sdk';

const { wallet } = AElf;

// view contract wallet
export const COMMON_PRIVATE = 'f6e512a3c259e5f9af981d7f99d245aa5bc52fe448495e0b0dd56e8406be6f71';

export const COMMON_WALLET = wallet.getWalletByPrivateKey(COMMON_PRIVATE);

export function getWallet(privateKey = COMMON_PRIVATE) {
  return wallet.getWalletByPrivateKey(privateKey);
}

export async function getTxResult(
  chain: any,
  TransactionId: string,
  reGetCount = 0,
  notExistedReGetCount = 0,
): Promise<any> {
  return defaultGetTxResult(chain, TransactionId, reGetCount, notExistedReGetCount);
}

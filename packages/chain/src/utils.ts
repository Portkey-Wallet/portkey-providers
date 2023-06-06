import { ProviderError, ResponseCode } from '@portkey/provider-types';
import AElf from 'aelf-sdk';

const { wallet } = AElf;

// view contract wallet
export const COMMON_PRIVATE = 'f6e512a3c259e5f9af981d7f99d245aa5bc52fe448495e0b0dd56e8406be6f71';

export const COMMON_WALLET = wallet.getWalletByPrivateKey(COMMON_PRIVATE);

export function getWallet(privateKey = COMMON_PRIVATE) {
  return wallet.getWalletByPrivateKey(privateKey);
}

export function formatFunctionName(functionName: string) {
  return functionName.replace(functionName[0], functionName[0].toLocaleUpperCase());
}

export const sleep = (time: number) => {
  return new Promise<void>(resolve => {
    const timeout = setTimeout(() => {
      clearTimeout(timeout);
      resolve();
    }, time);
  });
};

export async function getTxResult(
  chain: any,
  TransactionId: string,
  reGetCount = 0,
  notExistedReGetCount = 0,
): Promise<any> {
  const txResult = await chain.getTxResult(TransactionId);

  if (txResult.error && txResult.errorMessage)
    throw new ProviderError(
      txResult.errorMessage.message || txResult.errorMessage.Message,
      ResponseCode.ERROR_IN_PARAMS,
    );

  const result = txResult?.result || txResult;

  if (!result) throw new ProviderError('Can not get transaction result.', ResponseCode.ERROR_IN_PARAMS);

  const lowerCaseStatus = result.Status.toLowerCase();

  if (lowerCaseStatus === 'notexisted') {
    if (notExistedReGetCount > 5) return result;
    await sleep(1000);
    notExistedReGetCount++;
    reGetCount++;
    return getTxResult(chain, TransactionId, reGetCount, notExistedReGetCount);
  }

  if (lowerCaseStatus === 'pending' || lowerCaseStatus === 'pending_validation') {
    if (reGetCount > 20) return result;
    await sleep(1000);
    reGetCount++;
    return getTxResult(chain, TransactionId, reGetCount, notExistedReGetCount);
  }

  if (lowerCaseStatus === 'mined') {
    return result;
  }

  throw new ProviderError(result.Error || `Transaction: ${result.Status}`, ResponseCode.ERROR_IN_PARAMS);
}

export function handleContractError(error?: any, req?: any) {
  if (typeof error === 'string') return { message: error };
  if (error?.message) return error;
  if (error.Error) {
    return {
      message: error.Error.Details || error.Error.Message || error.Error || error.Status,
    };
  }
  return {
    message: req?.errorMessage?.message || req?.error?.message?.Message,
  };
}

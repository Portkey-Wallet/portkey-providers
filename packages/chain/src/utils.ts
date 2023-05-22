import AElf from 'aelf-sdk';

export const COMMON_PRIVATE = 'f6e512a3c259e5f9af981d7f99d245aa5bc52fe448495e0b0dd56e8406be6f71';

const { wallet } = AElf;

export function getWallet(privateKey = COMMON_PRIVATE) {
  return wallet.getWalletByPrivateKey(privateKey);
}

export function formatFunctionName(functionName: string) {
  return functionName.replace(functionName[0], functionName[0].toLocaleUpperCase());
}

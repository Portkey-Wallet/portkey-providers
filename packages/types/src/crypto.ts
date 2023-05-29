import { KeyPairJSON } from './provider';

export interface CryptoTool {
  generateKeyPair: () => Promise<KeyPairJSON>;
  encrypt: (cryptoKey: JsonWebKey, data: string) => Promise<string>;
  decrypt(privateKey: JsonWebKey, data: string): Promise<string>;
}

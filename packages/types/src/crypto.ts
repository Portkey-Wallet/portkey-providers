export interface ICryptoManager {
  generateKeyPair(): Promise<{ publicKey: string; privateKey: string }>;
  encrypt(cryptoKey: string, data: string): Promise<string>;
  encrypt(privateKey: string, data: string): Promise<string>;
}

export interface KeyPairJSON {
  publicKey: JsonWebKey;
  privateKey: JsonWebKey;
}

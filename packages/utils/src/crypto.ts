/**
 * this class is used to manage crypto operations
 * 1. ```DAPP``` creates KeyPair ```{ publicKey: JsonWebKey; privateKey: JsonWebKey }```
 * 2. ```Server``` receives ```publicKey```
 * 3. ```DAPP``` encrypts data with ```privateKey```
 * 4. ```Server``` receives the encrypted data and decrypts it with ```publicKey```
 * 5. ```Server``` encrypts data with ```publicKey```
 * 6. ```DAPP``` receives the encrypted data and decrypts it with ```privateKey```
 */
export class CryptoManager {
  private crypto: CryptoLike;

  constructor(crypto: CryptoLike) {
    this.crypto = crypto;
  }

  public generateKeyPair = async (): Promise<{ publicKey: JsonWebKey; privateKey: JsonWebKey }> => {
    const key = await this.crypto.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: { name: 'SHA-512' },
      },
      true,
      ['encrypt', 'decrypt'],
    );
    const privateKey = await this.crypto.exportKey('jwk', key.privateKey);
    const publicKey = await this.crypto.exportKey('jwk', key.publicKey);
    return { publicKey, privateKey };
  };
  public encrypt = async (cryptoKey: JsonWebKey, data: string): Promise<string> => {
    const encrypted = await this.crypto.encrypt(
      {
        name: 'RSA-OAEP',
      },
      await this.crypto.importKey('jwk', cryptoKey, { name: 'RSA-OAEP', hash: { name: 'SHA-512' } }, true, ['encrypt']),
      new TextEncoder().encode(data),
    );
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  };
  public decrypt = async (privateKey: JsonWebKey, data: string): Promise<string> => {
    const decrypted = await this.crypto.decrypt(
      {
        name: 'RSA-OAEP',
      },
      await this.crypto.importKey('jwk', privateKey, { name: 'RSA-OAEP', hash: { name: 'SHA-512' } }, true, [
        'decrypt',
      ]),
      Uint8Array.from(atob(data), c => c.charCodeAt(0)),
    );
    return new TextDecoder().decode(decrypted);
  };
}

export type CryptoLike = Pick<SubtleCrypto, 'generateKey' | 'encrypt' | 'decrypt' | 'exportKey' | 'importKey'>;

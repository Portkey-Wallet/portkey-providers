/**
 * this class is used to manage crypto operations
 * 1. ```DAPP``` creates KeyPair ```{ publicKey: JsonWebKey; privateKey: JsonWebKey }```
 * 2. ```Server``` receives ```publicKey```
 * 3. ```DAPP``` encrypts data with ```privateKey```
 * 4. ```Server``` receives the encrypted data and decrypts it with ```publicKey```
 * 5. ```Server``` encrypts data with ```publicKey```
 * 6. ```DAPP``` receives the encrypted data and decrypts it with ```privateKey```
 */
export abstract class CryptoManager {
  public static generateKeyPair = async (): Promise<{ publicKey: JsonWebKey; privateKey: JsonWebKey }> => {
    const key = await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: { name: 'SHA-512' },
      },
      true,
      ['encrypt', 'decrypt'],
    );
    const privateKey = await window.crypto.subtle.exportKey('jwk', key.privateKey);
    const publicKey = await window.crypto.subtle.exportKey('jwk', key.publicKey);
    return { publicKey, privateKey };
  };
  public static encrypt = async (cryptoKey: JsonWebKey, data: string): Promise<string> => {
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
      },
      await window.crypto.subtle.importKey('jwk', cryptoKey, { name: 'RSA-OAEP', hash: { name: 'SHA-512' } }, true, [
        'encrypt',
      ]),
      new TextEncoder().encode(data),
    );
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  };
  public static decrypt = async (privateKey: JsonWebKey, data: string): Promise<string> => {
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP',
      },
      await window.crypto.subtle.importKey('jwk', privateKey, { name: 'RSA-OAEP', hash: { name: 'SHA-512' } }, true, [
        'decrypt',
      ]),
      Uint8Array.from(atob(data), c => c.charCodeAt(0)),
    );
    return new TextDecoder().decode(decrypted);
  };
}

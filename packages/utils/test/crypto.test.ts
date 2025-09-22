import { test, expect, describe } from 'vitest';
import { CryptoManager } from '../src';
import { webcrypto } from 'crypto';

describe('CryptoManager', () => {
  console.log(
    'globalThis.webcrypto',
    !!(webcrypto && webcrypto.subtle),
    ' |true use webcrypto.subtle, false use window.crypto.subtle| ',
    webcrypto ? webcrypto.subtle : window.crypto.subtle,
  );
  const cryptoManager = new CryptoManager(webcrypto ? webcrypto.subtle : window.crypto.subtle);
  test('should get keypair', callback => {
    cryptoManager
      .generateKeyPair()
      .then(keyPair => {
        callback();
        expect(keyPair).not.toBeNull();
        expect(keyPair.publicKey).not.toBeNull();
        expect(keyPair.privateKey).not.toBeNull();
        console.log('keyPair', JSON.stringify(keyPair));
      })
      .catch(e => callback(e));
  });
  test('should encrypt and decrypt well', callback => {
    cryptoManager.generateKeyPair().then(keyPair => {
      const data = { foo: 'bar' };
      cryptoManager
        .encrypt(keyPair.publicKey, JSON.stringify(data))
        .then(encrypted => {
          cryptoManager.decrypt(keyPair.privateKey, encrypted).then(decrypted => {
            expect(decrypted).toEqual(JSON.stringify(data));
            callback();
          });
        })
        .catch(e => callback(e));
    });
  });
});

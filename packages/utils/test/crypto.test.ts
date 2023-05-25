import { test } from '@jest/globals';
import { expect } from '@jest/globals';
import { describe } from 'node:test';
import { webcrypto } from 'crypto';
import { CryptoManager } from '../src/crypto';

const cryptoManager = new CryptoManager(webcrypto.subtle);

describe('CryptoManager', () => {
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
            callback();
            expect(decrypted).toEqual(JSON.stringify(data));
          });
        })
        .catch(e => callback(e));
    });
  });
});

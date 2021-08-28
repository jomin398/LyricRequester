/**
 * @fileOverview RSA For Html
 * @module RSAForHtml
 * @require npm/jsencrypt
 * @author jomin398
 * @since 2021.08.26
 * 
 * @copyright jomin398
 * @license MIT
 * @description This code is licensed under the MIT Licensing Principles.
 */
const RSAForHtml = function(){
  'use strict';
  function RSAForHtml() {};
  /**
   * @param {string} str to encode data;
   * @param {string} privateKey to set private key;
   */
  RSAForHtml.prototype.encrypt = function(str, privateKey) {
    //security key for encrypt
    const defaultPrivateKey = [
			"dfbc1f3f4c10e17e0112d72e78916da5",
			"06edd57da06eac6ae4f00dd301067178",
			"057baa9ba94ef6e665bfb29cee567de4",
			"081249c0be376f9811383ce6d12bad74",
			"4a2f12fc16189c3d6ec041222b459541",
			"84165f37d98d188ed5ad158ff8b5004e",
			"8e717f714fc962ab7eb02d58481960d4",
			"d62f09c0b642e496ec703eca1c65374b"
		].join('');
    if (!str) {
      str = (() => {
        const pad2 = i => i.toString().padStart(2, '0');

        const date = new Date();

        const dateStr = [
					date.getUTCFullYear(),
					pad2(date.getUTCMonth() + 1),
					pad2(date.getUTCDate())
				].join('');
        const timeStr = [
					pad2(date.getUTCHours()),
					pad2(date.getUTCMinutes()),
					pad2(date.getUTCSeconds())
				].join('');
        return 'ALSONG_ANDROID_' + dateStr + '_' + timeStr
      })()
    };
    if (!privateKey) {
      privateKey = defaultPrivateKey;
    }
    
    const nvalue = privateKey
    const evalue = "10001";
    var rsa = new RSAKey();
    rsa.setPublic(nvalue,evalue);
    console.log(str)
    return rsa.encrypt(str);
  }
  return RSAForHtml;
};
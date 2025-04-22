import CryptoJS from 'crypto-js';
import { IEncryptionConfig } from '../types/excryption';

/**
 * AES 加密函数
 * @param  originText - 明文
 * @returns 密文（Base64 编码）
 */
export function encrypt(originText: string, config: IEncryptionConfig<'parsed'>) {
    const encrypted = CryptoJS.AES.encrypt(originText, config.SECRET_KEY, {
        iv: config.SECRET_IV,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
}
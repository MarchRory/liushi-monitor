export type EncryptionSecretType = 'parsed' | 'unParsed'
/**
 * 加密配置
 */
export interface IEncryptionConfig<T extends EncryptionSecretType> {
    SECRET_KEY: T extends 'parsed' ? CryptoJS.lib.WordArray : string
    SECRET_IV: T extends 'parsed' ? CryptoJS.lib.WordArray : string
}
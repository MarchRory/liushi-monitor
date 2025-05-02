import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as  CryptoJS from 'crypto-js'
import { IBaseTransformedData } from 'src/modules/monitor/types';
import { IDecryptConfig } from 'src/types/envConfig';

@Injectable()
export class DecryptionService {
    private readonly SECRET_KEY: CryptoJS.lib.WordArray
    private readonly SECRET_IV: CryptoJS.lib.WordArray
    constructor(
        private readonly configService: ConfigService<IDecryptConfig>
    ) {

        this.SECRET_KEY = CryptoJS.enc.Utf8.parse(this.configService.get('SECRET_KEY') as string)
        this.SECRET_IV = CryptoJS.enc.Utf8.parse(this.configService.get('SECRET_IV') as string)
    }
    async decryptLog(secretLog: string): Promise<IBaseTransformedData[] | null> {
        try {
            const bytes = CryptoJS.AES.decrypt(secretLog, this.SECRET_KEY, {
                iv: this.SECRET_IV,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            const plainText = bytes.toString(CryptoJS.enc.Utf8);
            return JSON.parse(plainText);
        } catch (error) {
            console.error("解密日志失败:", error);
            return null;
        }
    }
}
import { Module } from '@nestjs/common';
import { DecryptionService } from './decrypt.service';

@Module({
    providers: [DecryptionService],
    exports: [DecryptionService], // 导出供其他模块使用
})
export class DecryptModule { }
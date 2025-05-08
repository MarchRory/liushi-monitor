import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateUploadDto } from './dto/create-upload.dto';
import * as fs from 'fs';
import * as path from 'path';
import { responseBundler } from 'src/utils/bundler/response';
import { ResponseCode } from 'src/config/response/codeMap';
import { ConfigService } from '@nestjs/config';
import { IUploadEnvConfig } from 'src/types/envConfig';

@Injectable()
export class UploadService {
  constructor(
    private readonly configService: ConfigService<IUploadEnvConfig>
  ) { }
  async create(file: Express.Multer.File) {
    const baseUrl = process.env.BASE_URL || 'https://localhost:443';
    const fileUrl = `${baseUrl}/pics/${file.filename}`;
    return responseBundler(ResponseCode.SUCCESS, fileUrl)
  }

  async remove(filename: string) {
    try {
      const filePath = path.join(this.configService.get('SAVE_PATH') as string, filename);
      if (!fs.existsSync(filePath)) {
        throw new HttpException('文件未找到', HttpStatus.NOT_FOUND);
      }

      fs.unlinkSync(filePath);

      return responseBundler(ResponseCode.SUCCESS, null, "删除成功")
    } catch (error) {
      console.log(error)
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to delete file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
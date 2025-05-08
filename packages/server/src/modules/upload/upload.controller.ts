import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Res, HttpStatus, HttpException, SerializeOptions, UseGuards, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UploadService } from './upload.service';
import { CreateUploadDto } from './dto/create-upload.dto';
import * as fs from 'node:fs'
import { extname } from 'path';
import { responseBundler } from 'src/utils/bundler/response';
import { ResponseCode } from 'src/config/response/codeMap';
import { IUserTypeEnum } from 'src/common/constant';
import { RequireRole } from 'src/shared/decorators/role.decorator';
import { JwtAuthGuard } from 'src/shared/guard/role.guard';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
  ) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN, IUserTypeEnum.ENGINEER, IUserTypeEnum.OPERATOR)
  @SerializeOptions({})
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          // 使用环境变量中的路径
          console.log(process.env.SAVE_PATH)
          const savePath = process.env.SAVE_PATH as string
          // 确保目录存在
          if (!fs.existsSync(savePath)) {
            fs.mkdirSync(savePath, { recursive: true });
          }
          cb(null, savePath);
        },
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return callback(new HttpException('Only image files are allowed!', HttpStatus.BAD_REQUEST), false);
        }
        callback(null, true);
      },
    }),
  )
  async create(@UploadedFile() file, @Body() createUploadDto: CreateUploadDto) {
    if (!file) {
      return responseBundler(ResponseCode.INTERNAL_ERROR, "请上传文件")
    }
    return await this.uploadService.create(file)
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN, IUserTypeEnum.ENGINEER, IUserTypeEnum.OPERATOR)
  @SerializeOptions({})
  async remove(@Query('filename') filename: string) {
    return this.uploadService.remove(filename);
  }
}
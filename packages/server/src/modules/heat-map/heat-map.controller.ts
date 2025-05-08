import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
  ParseIntPipe
} from '@nestjs/common';
import { HeatMapService } from './heat-map.service';
import { IUserTypeEnum } from 'src/common/constant';
import { RequireRole } from 'src/shared/decorators/role.decorator';
import { JwtAuthGuard } from 'src/shared/guard/role.guard';
import { FindListBaseDto } from 'src/common/dtos/find-list';
import { CreateHeatMapBasePicDto, UpdateHeatMapBasePicDto, UpdateStatusDto } from './dto/base.dto';

@Controller('heatMap')
export class HeatMapController {
  constructor(private readonly heatMapService: HeatMapService) { }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('basePic')
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN, IUserTypeEnum.OPERATOR)
  @SerializeOptions({})
  async getBasePicListInHeatMap(@Query() query: FindListBaseDto) {
    return await this.heatMapService.getBasePicListInHeatMap(query);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('basePic/item')
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN, IUserTypeEnum.OPERATOR)
  @SerializeOptions({})
  async getBasePicById(@Query('id', ParseIntPipe) id: number) {
    return await this.heatMapService.getBasePicById(id);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('basePic')
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN, IUserTypeEnum.OPERATOR)
  @SerializeOptions({})
  async createBasePic(@Body() data: CreateHeatMapBasePicDto) {
    return await this.heatMapService.createBasePic(data);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Put('basePic/:id')
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN, IUserTypeEnum.OPERATOR)
  @SerializeOptions({})
  async updateBasePic(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateHeatMapBasePicDto,
  ) {
    return await this.heatMapService.updateBasePic(id, data);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Delete('basePic/:id')
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN, IUserTypeEnum.OPERATOR)
  @SerializeOptions({})
  async deleteBasePic(@Param('id', ParseIntPipe) id: number) {
    return await this.heatMapService.deleteBasePic(id);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Put('basePic')
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN, IUserTypeEnum.OPERATOR)
  @SerializeOptions({})
  async updateBasePicStatus(
    @Query('id', ParseIntPipe) id: number,
    @Body() data: UpdateStatusDto,
  ) {
    return await this.heatMapService.updateBasePicStatus(id, data.status);
  }
}
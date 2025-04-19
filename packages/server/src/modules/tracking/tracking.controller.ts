import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Post, Put, Query, SerializeOptions, UseGuards, UseInterceptors } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { IUserTypeEnum } from 'src/common/constant';
import { RequireRole } from 'src/shared/decorators/role.decorator';
import { JwtAuthGuard } from 'src/shared/guard/role.guard';
import { FindListBaseDto } from 'src/common/dtos/find-list';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';

@Controller('tracking')
export class TrackingController {
  constructor(
    private readonly trackingService: TrackingService
  ) { }

  @Post()
  RecevieLog(@Body() dto) {

  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('events')
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN, IUserTypeEnum.ENGINEER)
  @SerializeOptions({})
  async findEventsList(@Query() findDto: FindListBaseDto) {
    return this.trackingService.findEventsList(findDto)
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('events')
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN)
  @SerializeOptions({})
  async createEventType(@Body() dto: CreateEventDto) {
    return this.trackingService.createEvent(dto)
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Put('events')
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN)
  @SerializeOptions({})
  async updateEventType(@Body() dto: UpdateEventDto) {
    return this.trackingService.updateEvent(dto)
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Delete('events:id')
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN)
  @SerializeOptions({})
  async deleteEventType(@Param() id: number) {
    return this.trackingService.removeEvent(+id)
  }
}

import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Post, Put, Query, SerializeOptions, UseGuards, UseInterceptors } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { IUserTypeEnum } from 'src/common/constant';
import { RequireRole } from 'src/shared/decorators/role.decorator';
import { JwtAuthGuard } from 'src/shared/guard/role.guard';
import { FindListBaseDto } from 'src/common/dtos/find-list';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { CreateIndicatorDto, FindIndicatorListDto, UpdateIndicatorDto } from './dto/indicator.dto';
import { CreateComponentDto, FindComponentListDto, UpdateComponentDto } from './dto/component.dto';
import { CreateComponentTypeDto, UpdateComponentTypeDto } from './dto/component-type.dto';

@Controller('tracking')
export class TrackingController {
  constructor(
    private readonly trackingService: TrackingService
  ) { }

  @Post()
  RecevieLog(@Body() dto) {

  }

  /***************************** 监控事件大类CRUD ********************************/
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('event')
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN, IUserTypeEnum.ENGINEER)
  @SerializeOptions({})
  async findEventsList(@Query() findDto: FindListBaseDto) {
    return this.trackingService.findEventsList(findDto)
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('event')
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN)
  @SerializeOptions({})
  async createEventType(@Body() dto: CreateEventDto) {
    return this.trackingService.createEvent(dto)
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Put('event')
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN)
  @SerializeOptions({})
  async updateEventType(@Body() dto: UpdateEventDto) {
    return this.trackingService.updateEvent(dto)
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Delete('event/:id')
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN)
  @SerializeOptions({})
  async deleteEventType(@Param() param: { id: number }) {
    return this.trackingService.removeEvent(+param.id)
  }
  /***************************** 监控事件大类CRUD ********************************/


  /***************************** 事件具体指标CRUD ********************************/
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('indicator')
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN, IUserTypeEnum.ENGINEER)
  @SerializeOptions({})
  async findIndicatorsList(@Query() findDto: FindIndicatorListDto) {
    return this.trackingService.findIndicatorsList(findDto)
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('indicator')
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN)
  @SerializeOptions({})
  async createIndicator(@Body() dto: CreateIndicatorDto) {
    return this.trackingService.createIndicator(dto)
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Put('indicator')
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN)
  @SerializeOptions({})
  async updateIndicator(@Body() dto: UpdateIndicatorDto) {
    return this.trackingService.updateIndicator(dto)
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Delete('indicator/:id')
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN)
  @SerializeOptions({})
  async deleteIndicator(@Param() param: { id: number }) {
    return this.trackingService.removeIndicator(+param.id)
  }
  /***************************** 事件具体指标CRUD ********************************/


  /***************************** 监控业务组件大类CRUD ********************************/
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('componentType')
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN, IUserTypeEnum.ENGINEER)
  @SerializeOptions({})
  async findComponentTypesList(@Query() findDto: FindListBaseDto) {
    return this.trackingService.findComponentTypeList(findDto)
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('componentType')
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN)
  @SerializeOptions({})
  async createComponentType(@Body() dto: CreateComponentTypeDto) {
    return this.trackingService.createCommonType(dto)
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Put('componentType')
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN)
  @SerializeOptions({})
  async updateComponentType(@Body() dto: UpdateComponentTypeDto) {
    return this.trackingService.updateComponentType(dto)
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Delete('componentType/:id')
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN)
  @SerializeOptions({})
  async deleteComponentType(@Param() param: { id: number }) {
    return this.trackingService.removeComponentType(+param.id)
  }
  /***************************** 监控业务组件大类CRUD ********************************/


  /***************************** 具体业务组件CRUD ********************************/
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('component')
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN, IUserTypeEnum.ENGINEER)
  @SerializeOptions({})
  async findComponentsList(@Query() findDto: FindComponentListDto) {
    return this.trackingService.findComponentsList(findDto)
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('component')
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN)
  @SerializeOptions({})
  async createComponent(@Body() dto: CreateComponentDto) {
    return this.trackingService.createComponent(dto)
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Put('component')
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN)
  @SerializeOptions({})
  async updateComponent(@Body() dto: UpdateComponentDto) {
    return this.trackingService.updateComponent(dto)
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Delete('component/:id')
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN)
  @SerializeOptions({})
  async deleteComponent(@Param() param: { id: number }) {
    return this.trackingService.removeComponent(+param.id)
  }
  /***************************** 具体业务组件CRUD ********************************/
}

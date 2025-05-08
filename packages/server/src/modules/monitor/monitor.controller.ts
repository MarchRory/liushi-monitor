import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Inject,
  Logger,
  Post,
  SerializeOptions,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { Queue } from 'bullmq'
import { MonitorService } from './monitor.service';
import {
  IUserTypeEnum,
  LOG_MQ_PROCESS_NAME,
  MONITOR_QUEUE,
} from 'src/common/constant';
import { FELogDto } from './dto/log.dto';
import { responseBundler } from 'src/utils/bundler/response';
import { ResponseCode } from 'src/config/response/codeMap';
import { RequireRole } from 'src/shared/decorators/role.decorator';
import { JwtAuthGuard } from 'src/shared/guard/role.guard';

@Controller('monitor')
export class MonitorController {
  private readonly logger = new Logger(MonitorController.name)
  constructor(
    @Inject(MONITOR_QUEUE) private readonly monitorQueue: Queue<string>,
    private readonly monitorService: MonitorService,
  ) { }

  @Post()
  @HttpCode(200)
  async receiveFELog(@Body() log: FELogDto) {
    Object.entries(log).forEach(([priority, data]) => {
      this.monitorQueue.add(
        LOG_MQ_PROCESS_NAME,
        data[0],
        { removeOnComplete: true, removeOnFail: true, priority: +priority }
      )
    })
    return responseBundler(ResponseCode.SUCCESS, null, '')
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('urls')
  @UseGuards(JwtAuthGuard)
  @RequireRole(IUserTypeEnum.ADMIN, IUserTypeEnum.ENGINEER)
  @SerializeOptions({})
  async getMonitoredAppPageUrls() {
    return await this.monitorService.getAllPageUrls()
  }
}

import { Logger, Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PerformanceAnalysisService } from './performance-analysis.service';
import { TrackingService } from 'src/modules/tracking/tracking.service';
import { BaseChartDataSearchDto } from '../dto/base.dto';
import dateUtils from '../../../utils/common/time';
import { PerformanceIndicatorEnum } from '../types/first-screen-chart';

@Injectable()
export class PerformanceAnalysisScheduler implements OnModuleInit {
  private readonly logger: Logger = new Logger(
    PerformanceAnalysisScheduler.name,
  );
  private readonly performanceIndicatorsMap: Record<string, number> = {};
  constructor(
    private readonly performanceAnalysisService: PerformanceAnalysisService,
    private readonly trackingService: TrackingService,
  ) {}
  async onModuleInit() {
    const indicatorsMap = await this.trackingService.getIndicatorMapCache();
    Object.entries(indicatorsMap).forEach(([id, { indicatorName }]) => {
      this.performanceIndicatorsMap[indicatorName] = +id;
    });
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  updateChartDataCache() {
    this.logger.debug('执行定时任务: 每半小时更新本日性能指标缓存数据');
    const dto: Omit<BaseChartDataSearchDto, 'indicatorId'> = {
      refresh: true,
      url: '*',
      ...dateUtils.getTodayTimeRange(),
    };
    this.performanceAnalysisService.calculateFirstScreenIndicatorsChartData(
      {
        ...dto,
        indicatorId: this.performanceIndicatorsMap['first_screen_fp'],
      },
      PerformanceIndicatorEnum.FP,
      false,
    );
    this.performanceAnalysisService.calculateFirstScreenIndicatorsChartData(
      {
        ...dto,
        indicatorId: this.performanceIndicatorsMap['first_screen_fcp'],
      },
      PerformanceIndicatorEnum.FCP,
      false,
    );
    this.performanceAnalysisService.calculateFirstScreenIndicatorsChartData(
      {
        ...dto,
        indicatorId: this.performanceIndicatorsMap['first_screen_lcp'],
      },
      PerformanceIndicatorEnum.LCP,
      false,
    );
    this.performanceAnalysisService.calculateFirstScreenIndicatorsChartData(
      {
        ...dto,
        indicatorId: this.performanceIndicatorsMap['first_screen_ttfb'],
      },
      PerformanceIndicatorEnum.TTFB,
      false,
    );
  }
}

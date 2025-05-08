import { Logger, Injectable } from "@nestjs/common";
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserhehaviorAnalysisService } from "./userbehavior-analysis.service";

@Injectable()
export class PerformanceAnalysisScheduler {
    private readonly logger: Logger = new Logger(PerformanceAnalysisScheduler.name)
    constructor(
        private readonly userhehaviorAnalysisService: UserhehaviorAnalysisService,
    ) { }


}
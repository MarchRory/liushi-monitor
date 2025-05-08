import { Logger, Injectable } from "@nestjs/common";
import { Cron, CronExpression } from '@nestjs/schedule';
import { ErrorAnalysisService } from "./error-analysis.service";

@Injectable()
export class ErrorAnalysisScheduler {
    private readonly logger: Logger = new Logger(ErrorAnalysisScheduler.name)
    constructor(
        private readonly errorAnalysisService: ErrorAnalysisService
    ) { }


}
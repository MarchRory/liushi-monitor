import {
    ClassSerializerInterceptor,
    Controller,
    Get,
    Query,
    SerializeOptions,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import { PerformanceAnalysisService } from "./performance-analysis.service";
import { IUserTypeEnum } from "src/common/constant";
import { RequireRole } from "src/shared/decorators/role.decorator";
import { BaseChartDataSearchDto, BaseDataSearchDto, BaseHttpOverviewSearch } from "../dto/base.dto";
import { PerformanceIndicatorEnum } from "../types/first-screen-chart";
import { JwtAuthGuard } from "src/shared/guard/role.guard";
import { HttpAnalysisService } from "./http-analysis.service";

@Controller('analysis/performance')
export class PerformanceAnalysisController {
    constructor(
        private readonly performanceAnalysisService: PerformanceAnalysisService,
        private readonly httpAnalysisService: HttpAnalysisService
    ) { }

    @UseInterceptors(ClassSerializerInterceptor)
    @Get('lcp')
    @UseGuards(JwtAuthGuard)
    @RequireRole(IUserTypeEnum.ADMIN, IUserTypeEnum.ENGINEER)
    @SerializeOptions({})
    async getLCPChartData(@Query() query: BaseChartDataSearchDto) {
        return this.performanceAnalysisService.calculateFirstScreenIndicatorsChartData(query, PerformanceIndicatorEnum.LCP)
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @Get('fp')
    @UseGuards(JwtAuthGuard)
    @RequireRole(IUserTypeEnum.ADMIN, IUserTypeEnum.ENGINEER)
    @SerializeOptions({})
    async getFPChartData(@Query() query: BaseChartDataSearchDto) {
        return this.performanceAnalysisService.calculateFirstScreenIndicatorsChartData(query, PerformanceIndicatorEnum.FP)
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @Get('fcp')
    @UseGuards(JwtAuthGuard)
    @RequireRole(IUserTypeEnum.ADMIN, IUserTypeEnum.ENGINEER)
    @SerializeOptions({})
    async getFCPChartData(@Query() query: BaseChartDataSearchDto) {
        return this.performanceAnalysisService.calculateFirstScreenIndicatorsChartData(query, PerformanceIndicatorEnum.FCP)
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @Get('ttfb')
    @UseGuards(JwtAuthGuard)
    @RequireRole(IUserTypeEnum.ADMIN, IUserTypeEnum.ENGINEER)
    @SerializeOptions({})
    async getTTFBChartData(@Query() query: BaseChartDataSearchDto) {
        return this.performanceAnalysisService.calculateFirstScreenIndicatorsChartData(query, PerformanceIndicatorEnum.TTFB)
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @Get('cls')
    @UseGuards(JwtAuthGuard)
    @RequireRole(IUserTypeEnum.ADMIN, IUserTypeEnum.ENGINEER)
    @SerializeOptions({})
    async getCLSChartData(@Query() query: BaseChartDataSearchDto) {

    }

    @UseInterceptors(ClassSerializerInterceptor)
    @Get('inp')
    @UseGuards(JwtAuthGuard)
    @RequireRole(IUserTypeEnum.ADMIN, IUserTypeEnum.ENGINEER)
    @SerializeOptions({})
    async getINPChartData(@Query() query: BaseChartDataSearchDto) {

    }

    @UseInterceptors(ClassSerializerInterceptor)
    @Get('spaload')
    @UseGuards(JwtAuthGuard)
    @RequireRole(IUserTypeEnum.ADMIN, IUserTypeEnum.ENGINEER)
    @SerializeOptions({})
    async getSPALoadChartData(@Query() query: BaseChartDataSearchDto) {
        return this.performanceAnalysisService.calculateFirstScreenIndicatorsChartData(query, PerformanceIndicatorEnum.SPA_LOAD_TIME)
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @Get('http/overview')
    @UseGuards(JwtAuthGuard)
    @RequireRole(IUserTypeEnum.ADMIN, IUserTypeEnum.ENGINEER)
    @SerializeOptions({})
    async getHttpOverView(@Query() query: BaseHttpOverviewSearch) {
        return this.httpAnalysisService.calculateHttpOverView(query)
    }
}
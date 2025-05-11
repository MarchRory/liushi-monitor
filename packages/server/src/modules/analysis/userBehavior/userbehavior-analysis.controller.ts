import { ClassSerializerInterceptor, Controller, Get, Query, SerializeOptions, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserhehaviorAnalysisService } from "./userbehavior-analysis.service";
import { IUserTypeEnum } from "src/common/constant";
import { RequireRole } from "src/shared/decorators/role.decorator";
import { JwtAuthGuard } from "src/shared/guard/role.guard";
import { BaseBehaviorOverviewSearch } from "../dto/base.dto";

@Controller('analysis/userbehavior')
export class UserbehaviorAnalysisController {
    constructor(
        private readonly userbehaviorAnalysisService: UserhehaviorAnalysisService
    ) { }

    @UseInterceptors(ClassSerializerInterceptor)
    @Get('overview')
    @UseGuards(JwtAuthGuard)
    @RequireRole(IUserTypeEnum.ADMIN, IUserTypeEnum.OPERATOR)
    @SerializeOptions({})
    async getUserBehaviorOverview(@Query() query: BaseBehaviorOverviewSearch) {
        return this.userbehaviorAnalysisService.calculateBehaviorOverview(query)
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @Get('urls')
    @UseGuards(JwtAuthGuard)
    @RequireRole(IUserTypeEnum.ADMIN, IUserTypeEnum.OPERATOR)
    async getMeaningfulUrls() {
        return this.userbehaviorAnalysisService.calculateMeaningfulUrls()
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @Get('device-preference')
    @UseGuards(JwtAuthGuard)
    @RequireRole(IUserTypeEnum.ADMIN, IUserTypeEnum.OPERATOR)
    @SerializeOptions({})
    async getDevicePreferenceAnalysis(@Query() query: BaseBehaviorOverviewSearch) {
        return this.userbehaviorAnalysisService.getDevicePreferenceAnalysis(query);
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @Get('funnel')
    @UseGuards(JwtAuthGuard)
    @RequireRole(IUserTypeEnum.ADMIN, IUserTypeEnum.OPERATOR)
    @SerializeOptions({})
    async getFunnelAnalysis(@Query() query: BaseBehaviorOverviewSearch) {
        return this.userbehaviorAnalysisService.getFunnelAnalysis(query);
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @Get('exposure-depth')
    @UseGuards(JwtAuthGuard)
    @RequireRole(IUserTypeEnum.ADMIN, IUserTypeEnum.OPERATOR)
    @SerializeOptions({})
    async getExposureDepthAnalysis(@Query() query: BaseBehaviorOverviewSearch) {
        return await this.userbehaviorAnalysisService.getExposureDepthAnalysis(query);
    }
}
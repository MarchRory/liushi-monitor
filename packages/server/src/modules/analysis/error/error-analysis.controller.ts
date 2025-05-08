import { ClassSerializerInterceptor, Controller, Get, Query, SerializeOptions, UseGuards, UseInterceptors } from "@nestjs/common";
import { ErrorAnalysisService } from "./error-analysis.service";
import { IUserTypeEnum } from "src/common/constant";
import { RequireRole } from "src/shared/decorators/role.decorator";
import { JwtAuthGuard } from "src/shared/guard/role.guard";
import { BaseErrorOverviewSearch, BaseSpecificErrorTable } from "../dto/base.dto";

@Controller('analysis/error')
export class ErrorAnalysisController {
    constructor(
        private readonly errorAnalysisService: ErrorAnalysisService,
    ) { }

    @UseInterceptors(ClassSerializerInterceptor)
    @Get('overview')
    @UseGuards(JwtAuthGuard)
    @RequireRole(IUserTypeEnum.ADMIN, IUserTypeEnum.ENGINEER)
    @SerializeOptions({})
    async getErrorOverview(@Query() query: BaseSpecificErrorTable) {
        return await this.errorAnalysisService.calculateErrorOverview(query)
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @Get('table')
    @UseGuards(JwtAuthGuard)
    @RequireRole(IUserTypeEnum.ADMIN, IUserTypeEnum.ENGINEER)
    async getSpecificErrorTable(@Query() query: BaseSpecificErrorTable) {
        return await this.errorAnalysisService.calculateSpecificErrorList(query)
    }
}
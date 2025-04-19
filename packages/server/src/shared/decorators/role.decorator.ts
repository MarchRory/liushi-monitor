import { SetMetadata } from '@nestjs/common';
import { IUserTypeEnum } from 'src/common/constant';

export const REQUIRE_ROLES_KEY = 'requireRoles';
export const RequireRole = (...roles: IUserTypeEnum[]) =>
    SetMetadata(REQUIRE_ROLES_KEY, roles);
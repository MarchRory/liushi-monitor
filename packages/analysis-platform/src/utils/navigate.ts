import { To } from "react-router-dom";
import { IUserTypeEnum } from "../apis/user/types";
import performanceRoutes from "../views/performance/performance.router";
import userMgmtRoutes from "../views/userMgmt/userMgmt.router";
import userBehaviorRoutes from "../views/userBehavior/userbehavior.router";

export function getHomePath(userType: IUserTypeEnum) {
    if (userType == IUserTypeEnum.ADMIN) {
        return userMgmtRoutes[0].meta?.key as To
    } else if (userType == IUserTypeEnum.ENGINEER) {
        return performanceRoutes[0].meta?.key as To
    } else if (userType === IUserTypeEnum.OPERATOR) {
        return userBehaviorRoutes[0].children[0].meta?.key as To
    }
}
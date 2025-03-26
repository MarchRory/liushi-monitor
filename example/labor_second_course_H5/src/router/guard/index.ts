import { Router } from "vue-router";
import createBaseRouterGuide from "./base";
import createSpaMonitorRouterGuard from "./spaMonitor";

function mountRouterGuard(router: Router) {
    createBaseRouterGuide(router)
    createSpaMonitorRouterGuard(router)
}

export default mountRouterGuard
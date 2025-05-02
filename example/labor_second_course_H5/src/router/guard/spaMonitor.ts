import { Router } from "vue-router";

function createSpaMonitorRouterGuard(router: Router) {
    router.beforeEach((to, _, next) => {
        $liushiMonitor.spaStartLoadTimiing(to.path)
        next()
    })
}

export default createSpaMonitorRouterGuard
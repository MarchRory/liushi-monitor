import { Router } from "vue-router";
import createBaseRouterGuide from "./base";

function mountRouterGuard(router: Router) {
    createBaseRouterGuide(router)
}

export default mountRouterGuard
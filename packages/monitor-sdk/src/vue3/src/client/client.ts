import { ISDKInitialOptions } from "monitor-sdk/src/types";
import { Vue3BreadCrumbClient } from "./Vue3BreadCrumbClient";
import { App } from "vue";
import { BaseClient } from "../../../core";

class Vue3AppMonitorClient extends BaseClient {
    private readonly Vue3BreadCrumb: Vue3BreadCrumbClient
    constructor(initialOptions: ISDKInitialOptions & { VueApp?: App }) {
        super(initialOptions)
        this.Vue3BreadCrumb = new Vue3BreadCrumbClient({
            baseTransport: this.baseTransport,
            storageCenter: this.storageCenter,
            options: initialOptions.customBreadCrumb
        })
        this.Vue3BreadCrumb.init()
    }
}

export default Vue3AppMonitorClient
import { BaseBreadCrumb, BaseTransport } from "monitor-sdk/src/core";
import { IBaseBreadCrumbOptions } from "monitor-sdk/src/types";
import { StorageCenter } from "monitor-sdk/src/utils/storage";

export class Vue3BreadCrumbClient extends BaseBreadCrumb {
    constructor(initialOptions: {
        baseTransport: BaseTransport,
        storageCenter: StorageCenter,
        options?: IBaseBreadCrumbOptions,
    }) {
        super(initialOptions)
    }
    /**
     * 
     */
    init() {

    }
}
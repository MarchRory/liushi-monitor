import { BaseGlobalAOPEventType, ISDKInitialOptions, MonitorTypes, RequestBundlePriorityEnum } from "../types";
import { ReportDataStorageType, StorageOrder } from "../types/storage";
import { OrderedConcurrentQueue } from "../utils/common";

export function getStorage(key: string) {
    return localStorage.getItem(key)
}

export function setStorage(key: string, value: any) {
    return localStorage.setItem(key, value)
}

export function removeStorage(key: string) {
    return localStorage.removeItem(key)
}


/**
 * 上报数据缓存管理中心
 */
export class StorageCenter extends OrderedConcurrentQueue {
    private readonly LOCALSTORAGE_KEY: ISDKInitialOptions['localStorageKey']
    private storage: ReportDataStorageType
    private unloadSaveEventCnt: number = 0
    private getPluginsCount: () => number
    constructor({ storageKey, getPluginsCount }: {
        storageKey: ISDKInitialOptions['localStorageKey'],
        getPluginsCount: () => number
    }) {
        super(Infinity)
        this.LOCALSTORAGE_KEY = storageKey
        this.storage = this.getAllStorage(storageKey)
        this.getPluginsCount = getPluginsCount
    }
    private getAllStorage(key: ISDKInitialOptions['localStorageKey']): ReportDataStorageType {
        let storage: ReportDataStorageType | string | null = getStorage(key)
        if (storage) {
            try {
                storage = JSON.parse(storage)
            } catch (error) {
                storage = {
                    [RequestBundlePriorityEnum.USERBEHAVIOR]: [],
                    [RequestBundlePriorityEnum.PERFORMANCE]: [],
                    [RequestBundlePriorityEnum.ERROR]: []
                }
            }
        } else {
            storage = {
                [RequestBundlePriorityEnum.USERBEHAVIOR]: [],
                [RequestBundlePriorityEnum.PERFORMANCE]: [],
                [RequestBundlePriorityEnum.ERROR]: []
            }
        }
        return storage as ReportDataStorageType
    }
    getSpecificStorage(key: RequestBundlePriorityEnum) {
        return this.storage[key]
    }
    /**
     * 唯一对外方法, 缓存读写指令调度
     * @param order 
     * @returns 
     */
    async dispatchStorageOrder<T extends RequestBundlePriorityEnum>(order: StorageOrder<T>): Promise<void> {
        return this.enQueue(async () => {
            try {
                switch (order.type) {
                    case 'update':
                        this.setSpecificStorage(order.category, order.data)
                        break;
                    case 'clear':
                        this.clearSpecificStorage(order.category)
                        break;
                    case 'clearAll':
                        this.clearAllStorage()
                        break;
                    default:
                        throw new Error(`未知的storage操作指令: ${order}`)
                }
            } catch (error) {
                console.error("Storage operation failed:", error);
            }
        })
    }
    private clearSpecificStorage(key: RequestBundlePriorityEnum) {
        this.storage[key] = []
        setStorage(this.LOCALSTORAGE_KEY, this.storage)
    }
    private clearAllStorage() {
        removeStorage(this.LOCALSTORAGE_KEY)
        for (const key in this.storage) {
            // @ts-ignore
            this.storage[key] = []
        }
    }
    private setSpecificStorage(key: RequestBundlePriorityEnum, value: string[][]) {
        this.storage[key] = value
    }
    /**
     * 给插件使用
     * 网页卸载前进行未上报数据的存储
     * @param key 
     * @param value 
     * @param isPluginUse 是否插件使用, 默认false
     * @returns 
     */
    handleSaveBeforeUnload(key: RequestBundlePriorityEnum, value: string[], isPluginUse: boolean = false) {
        this.storage[key].push(value)

        if (isPluginUse) {
            this.unloadSaveEventCnt++;
        }
        // 所有插件和 路径访问栈 完成待发送数据的缓存转移后
        if (this.unloadSaveEventCnt === this.getPluginsCount() + 1) {
            setTimeout(() => {
                setStorage(this.LOCALSTORAGE_KEY, this.storage)
                this.cleanupAfterSave()
            })
        }
    }
    /**
     * 保存后的清理
     */
    private cleanupAfterSave() {
        this.unloadSaveEventCnt = 0;

        // 清理临时数据（根据业务需求决定是否保留）
        Object.keys(this.storage).forEach((key) => {
            this.storage[Number(key) as RequestBundlePriorityEnum] = [];
        });
    }
}
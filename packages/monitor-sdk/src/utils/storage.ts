import { ISDKInitialOptions, MonitorTypes } from "../types";
import { ReportDataStorageType, StorageOrder } from "../types/storage";
import { OrderedConcurrentQueue } from "./common";

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
 * 缓存管理中心
 */
export class StorageCenter extends OrderedConcurrentQueue {
    private readonly LOCALSTORAGE_KEY: ISDKInitialOptions['localStorageKey']
    private storage: ReportDataStorageType
    constructor(storageKey: ISDKInitialOptions['localStorageKey']) {
        super(Infinity)
        this.LOCALSTORAGE_KEY = storageKey
        this.storage = this.getAllStorage(storageKey)
    }
    private getAllStorage(key: ISDKInitialOptions['localStorageKey']): ReportDataStorageType {
        let storage: ReportDataStorageType | string | null = getStorage(key)
        if (storage) {
            try {
                storage = JSON.parse(storage)
            } catch (error) {
                storage = {
                    'performance': [],
                    'userBehavior': [],
                    'error': []
                }
            }
        } else {
            storage = {
                'performance': [],
                'userBehavior': [],
                'error': []
            }
        }
        return storage as ReportDataStorageType
    }
    getSpecificStorage(key: MonitorTypes) {
        return this.storage[key]
    }
    clearSpecificStorage(key: MonitorTypes) {
        this.storage[key] = []
        setStorage(this.LOCALSTORAGE_KEY, this.storage)
    }
    clearAllStorage() {
        removeStorage(this.LOCALSTORAGE_KEY)
        for (let key in this.storage) {
            // @ts-ignore
            this.storage[key] = [] // eslint-disabled-line
        }
    }
    setSpecificStorage(key: MonitorTypes, value: object[]) {
        this.storage[key] = value
        setStorage(this.LOCALSTORAGE_KEY, this.storage)
    }
    async dispatchStorageOrder<T extends MonitorTypes>(order: StorageOrder<T>): Promise<void> {
        return this.runWithLock(async () => {
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
                        break
                    default:
                        throw new Error(`未知的storage操作指令: ${order}`)
                }
            } catch (error) {
                console.error("Storage operation failed:", error);
                // 交给上层处理异常
                throw error
            }
        })
    }
}
import { ISDKInitialOptions, MonitorTypes } from "../types";
import { ReportDataStorageType, StorageOrder } from "../types/storage";
import { OrderedConcurrentQueue } from "./common";

function getStorage(key: string) {
    return localStorage.getItem(key)
}

function setStorage(key: string, value: any) {
    return localStorage.setItem(key, value)
}

function removeStorage(key: string) {
    return localStorage.removeItem(key)
}


/**
 * 缓存管理中心
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
    /**
     * 唯一对外方法, 缓存读写指令调度
     * @param order 
     * @returns 
     */
    async dispatchStorageOrder<T extends MonitorTypes>(order: StorageOrder<T>): Promise<void> {
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
                    case 'saveBeforeUnload':
                        this.handleSaveBeforeUnload(order.category, order.data)
                        break;
                    default:
                        throw new Error(`未知的storage操作指令: ${order}`)
                }
            } catch (error) {
                console.error("Storage operation failed:", error);
            }
        })
    }
    private clearSpecificStorage(key: MonitorTypes) {
        this.storage[key] = []
        setStorage(this.LOCALSTORAGE_KEY, this.storage)
    }
    private clearAllStorage() {
        removeStorage(this.LOCALSTORAGE_KEY)
        for (let key in this.storage) {
            // @ts-ignore
            this.storage[key] = []
        }
    }
    private setSpecificStorage(key: MonitorTypes, value: string[]) {
        this.storage[key] = value
        setStorage(this.LOCALSTORAGE_KEY, this.storage)
    }
    /**
     * 网页卸载前进行未上报数据的存储
     * @param key 
     * @param value 
     * @returns 
     */
    private handleSaveBeforeUnload(key: MonitorTypes, value: string[]) {
        const mergedData = [...this.getSpecificStorage(key), ...value]
        // 调用一次传一个更新指令, 及时更新
        this.dispatchStorageOrder({
            type: 'update',
            category: key,
            data: mergedData
        })
        this.unloadSaveEventCnt++;
        // 所有插件和路径行为栈完成待发送数据的缓存转移后, 注册事件监听器
        if (this.unloadSaveEventCnt === this.getPluginsCount() + 1) {
            this.registerUnloadListeners()
        }
    }
    /**
     * 注册页面卸载事件监听器, 考虑到上报机制是优先级队列立即消费策略, 所以关闭页面时应该剩余的未上报数据不多
     * 这些数据可以直接缓存起来, 下次打开应用时再发送
     */
    private registerUnloadListeners() {
        const saveHandler = () => {
            try {
                const finalData = this.prepareFinalData();
                setStorage(this.LOCALSTORAGE_KEY, JSON.stringify(finalData));
            } catch (error) {
                console.error('卸载时保存失败:', error);
                this.fallbackToSessionStorage();
            }
            this.cleanupAfterSave();
        };

        // 多事件类型监听
        const events: (keyof WindowEventMap)[] = ['pagehide', 'beforeunload'];
        events.forEach(event => {
            window.addEventListener(event, saveHandler, { capture: true });
        });

        // 移动端适配
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                saveHandler();
            }
        });

        // 防止内存泄漏
        const cleanup = () => {
            events.forEach(event => {
                window.removeEventListener(event, saveHandler, { capture: true });
            });
            document.removeEventListener('visibilitychange', cleanup);
        };
        window.addEventListener('pageshow', cleanup);
        window.addEventListener('load', cleanup);
    }

    /**
     * 准备最终存储数据
     */
    private prepareFinalData(): ReportDataStorageType {
        const finalData = { ...this.storage };

        // 数据完整性校验
        Object.keys(finalData).forEach((key) => {
            if (!Array.isArray(finalData[key as MonitorTypes])) {
                console.warn(`非法存储数据格式: ${key}`, finalData[key as MonitorTypes]);
                finalData[key as MonitorTypes] = [];
            }
        });

        return finalData;
    }
    /**
     * 降级存储
     */
    private fallbackToSessionStorage() {
        try {
            sessionStorage.setItem(this.LOCALSTORAGE_KEY, JSON.stringify(this.storage));
            console.warn('已降级使用sessionStorage存储');
        } catch (error) {
            console.error('所有存储方案均失败，数据将丢失:', error);
        }
    }
    /**
     * 保存后的清理
     */
    private cleanupAfterSave() {
        this.unloadSaveEventCnt = 0;

        // 清理临时数据（根据业务需求决定是否保留）
        Object.keys(this.storage).forEach((key) => {
            this.storage[key as MonitorTypes] = [];
        });
    }
}
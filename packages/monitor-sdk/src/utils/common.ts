import { deepCloneRegExp } from "../configs/reg"
import { CustomUserFunctionEnum, UserCustomFunctions } from "../types/function"
import { Queue } from "./dataStructure"
import { isObject } from "./is"
import { PessimisticLockMixin } from "./mixin"

/**
 * 深拷贝
 * @param source 数据源
 * @param hash 
 * @returns 数据源的深拷贝
 */
export function deepClone<T = any>(source: T, hash = new WeakMap()): T {
    if (source === null || !isObject(source)) return source

    let constructor = source.constructor
    if (deepCloneRegExp.test(constructor.name)) return constructor(source)
    if (hash.has(source)) return hash.get(source)

    let cloneObj = constructor()
    hash.set(source, cloneObj)

    for (let key in source) {
        if (Object.hasOwn(source, key)) {
            cloneObj[key] = deepClone(source[key], hash)
        }
    }

    return cloneObj
}

/**
 * 引入悲观锁队列
 */
const LockableQueue = PessimisticLockMixin(Queue)

type runTask = (...args: any) => Promise<any>
/**
 * 有序并发队列, 在队列的基础上加入了并发限制和悲观锁, 用于高并发的有序执行场景
 */
export class OrderedConcurrentQueue<T extends runTask = runTask> extends LockableQueue<T> {
    private debounceStart = debounce(() => this.startConsumingTask())
    constructor(queueLimit: number = 10) {
        super(queueLimit)
    }
    /**
     * 消费任务
     * 子类可重写, 要求最后返回一个promise
     * @param task 
     * @returns 
     */
    protected async processTask(task: T): Promise<void> {
        await task()
    }
    /**
     * 开始有序消费队列中的任务。
     * 通过 runWithLock 保证同一时刻只有一个消费流程在执行。
     */
    private async startConsumingTask() {
        await this.runWithLock(async () => {
            while (this.showAll().length > 0) {
                const task = this.deQueue();
                if (!task) break;

                try {
                    // 按顺序等待当前任务完成，再处理下一个
                    await this.processTask(task);
                } catch (error) {
                    console.error("Error processing task:", error);
                    // 根据需要决定是继续还是中断
                }
            }
        });
    }
    /**
     * 重写 enQueue 方法，在添加任务后自动触发消费流程。
     */
    async enQueue(element: T) {
        super.enQueue(element);
        // 自动启动消费流程（如果当前未在消费中，则 runWithLock 会启动，否则直接返回）
        this.debounceStart();
    }
}

/**
 * 收集用户传入的一些自定义方法, 在全局使用, 避免循环引用出现
 */
export const customFunctionBucket = new Map<CustomUserFunctionEnum, UserCustomFunctions[CustomUserFunctionEnum]>()
/**
 * 类型完备的map.get方法
 * @param key map的key
 * @returns 准确类型推导的value
 */
export function getCustomFunction<K extends CustomUserFunctionEnum = CustomUserFunctionEnum>(key: K): UserCustomFunctions[K] | undefined {
    return customFunctionBucket.get(key) as UserCustomFunctions[K] | undefined;
}

/**
 * 防抖
 * @param fn 
 * @param delay 默认300ms
 * @param immediate 
 * @returns 
 */
export function debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number = 300,
    otherConfig?: { immediate?: boolean, thisArg?: any })
    : (...args: Parameters<T>) => void {
    const {
        immediate = false,
        thisArg = undefined
    } = (otherConfig || {})
    let timer: NodeJS.Timeout | null = null
    // @ts-ignore
    const _this = this || thisArg

    return (...args) => {
        if (timer) {
            clearTimeout(timer)
            timer = null
        }
        if (!immediate) {
            timer = setTimeout(() => {
                // @ts-ignore
                fn.call(_this, ...args)
            }, delay)
        } else {
            let flag = !timer
            // @ts-ignore
            flag && fn.call(_this, ...args)
            timer = null
        }
    }
}

/**
 * 节流
 * @param fn 
 * @param lockTime 默认800ms内只触发第一次
 * @returns 
 */
export function throttle<T extends (...args: any[]) => any>(
    fn: T,
    lockTime: number = 800
): (...args: Parameters<T>) => void {
    let timer = null;
    let isThrottle = false;
    return (...args: any[]) => {
        if (!isThrottle) {
            // @ts-ignore
            fn.apply(this, args);
            isThrottle = true;
            timer = setTimeout(() => {
                isThrottle = false;
                timer = null;
            }, lockTime);
        }
    };
}
/* 简易轮询, 暂时这么写, 应付下答辩, 后面有空了优化一下 */
import { sleep } from '../freqCtrl/freqCtrl';

// 竞态令牌
export type CancellationToken = {
    isCancelled: () => boolean;
    cancel: () => void;
};
/**
 * @description 竞态令牌, 用于外界手动关闭进行中的轮询
 */
export function createCancellationToken(): CancellationToken {
    let cancelled = false;

    return {
        isCancelled() {
            return cancelled;
        },
        cancel() {
            cancelled = true;
        },
    };
}

interface PollingParams<T = any> {
    // 需要轮询的方法
    method: (...args: any[]) => Promise<T>;
    // 轮询主动退出条件
    quitWhen: (...args: any[]) => boolean;
    // 轮询间隔
    sleepTime?: number;
    cancelToken?: CancellationToken;
}

/**
 * @description 简易轮询, 带竞态控制功能
 * @param params
 * @returns
 */
export async function usePolling<T = any>(params: PollingParams<T>) {
    const { method, sleepTime = 2000, quitWhen, cancelToken } = params;

    let result: T;
    do {
        result = await method(); // eslint-disable-line
        // 外界影响被动终止轮询
        if (cancelToken && cancelToken.isCancelled()) {
            // eslint-disable-line
            break;
        }
        await sleep(sleepTime); // eslint-disable-line
    } while (!quitWhen());
    // 释放token
    cancelToken && cancelToken.cancel(); // eslint-disable-line

    // 如果需要, 取回最后一次轮询的结果
    return result;
}
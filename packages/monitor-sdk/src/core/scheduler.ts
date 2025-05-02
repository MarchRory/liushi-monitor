import { MaybeHigherOrderFunction } from "../types/utils";
import { Queue } from "../utils/dataStructure";

/**
 * 异步并发任务调度器, 为了兼容未执行任务全部取出, 将其含参转入缓存, 添加的任务需要是能再接受一个参数的柯里化函数
 */
export class TaskScheduler<T extends MaybeHigherOrderFunction<'higher', 'promise'> = MaybeHigherOrderFunction<'higher', 'promise'>> {
    private taskQueue: Queue<T> = new Queue(Infinity);
    private activeTasks: number = 0;
    private stopSchedule: boolean = false
    private readonly maxConcurrentTasks: number;

    constructor(maxConcurrentTasks: number) {
        this.maxConcurrentTasks = maxConcurrentTasks;
    }

    addTask(preloadTask: T) {
        this.taskQueue.enQueue(preloadTask);
        this.runNext();
    }
    private runNext(...args: any[]) {
        if (!this.stopSchedule && this.activeTasks < this.maxConcurrentTasks && this.taskQueue.size() > 0) {
            const preloadTask = this.taskQueue.deQueue();
            if (preloadTask) {
                this.activeTasks++;
                const taskSelf = preloadTask(...args)
                taskSelf().then(() => {
                    this.activeTasks--;
                    this.runNext();
                });
            }
        }
    }
    stopScheduleAndReturnRestTasks(): T[] {
        const res: T[] = []
        if (this.stopSchedule) return res

        this.stopSchedule = true
        while (!this.taskQueue.isEmpty()) {
            const task = this.taskQueue.deQueue()
            task && res.push(task)
        }
        return res
    }
}

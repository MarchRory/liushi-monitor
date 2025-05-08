import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue, Job, Worker } from 'bullmq';
import {
    COUNT_OF_EXECS_TO_CONSUME_LOWER_PRIORITY_JOB,
    JOBS_BATCH_SIZE,
    MONITOR_QUEUE,
    MQ_JOB_TOKEN,
    REDIS_CLIENT,
    RequestBundlePriorityEnum
} from 'src/common/constant';
import { MonitorService } from './monitor.service';
import { DecryptionService } from 'src/config/decrypt/decrypt.service';
import { Redis } from 'ioredis';


@Injectable()
export class MonitorScheduler {
    private readonly logger = new Logger(MonitorScheduler.name);
    /**
     * Batch执行次数记录
     */
    private execCount = 0
    /**
     * 下一轮等待被解决可能存在的饥饿现象的优先级
     */
    private nextRoundHungerResolutionPriority = RequestBundlePriorityEnum.PERFORMANCE
    /**
     * 每轮处理任务限额
     */
    private readonly batch_size = JOBS_BATCH_SIZE
    private readonly token = MQ_JOB_TOKEN
    /**
     * 任务优先级关系
     */
    private readonly priorities = [
        RequestBundlePriorityEnum.ERROR,
        RequestBundlePriorityEnum.PERFORMANCE,
        RequestBundlePriorityEnum.USERBEHAVIOR
    ];

    private readonly worker: Worker

    constructor(
        @Inject(MONITOR_QUEUE) private readonly monitorQueue: Queue<string>,
        @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
        private readonly decryptService: DecryptionService,
        private readonly monitorService: MonitorService,
    ) {
        // this.worker = new Worker(
        //     MONITOR_MQ_WORKER,
        //     async (job) => { },
        //     {
        //         connection: this.redisClient,
        //     }
        // )
    }

    /**
     * 定时记录监控数据
     * @returns 
     */
    @Cron(CronExpression.EVERY_5_SECONDS)
    async handleBatch() {
        this.execCount++;
        let jobs: Job<string>[] = []

        // 达到轮转计数, 优先消费低一级优先级任务
        if (this.execCount == COUNT_OF_EXECS_TO_CONSUME_LOWER_PRIORITY_JOB) {
            jobs = await this.getJobsByPriority(this.nextRoundHungerResolutionPriority)
            this.execCount = 0
            await this.processJobsByPriority(jobs, this.batch_size);

            const currentIndex = this.priorities.indexOf(this.nextRoundHungerResolutionPriority);
            this.nextRoundHungerResolutionPriority =
                this.priorities[(currentIndex + 1) % this.priorities.length];
            return;
        }

        //按默认优先级消费
        jobs = await this.getJobsByPriority()
        this.execCount = (this.execCount + 1) % COUNT_OF_EXECS_TO_CONSUME_LOWER_PRIORITY_JOB
        await this.processJobsByPriority(jobs, this.batch_size)
    }

    /**
     * 获取特定优先级优先排列的任务队列
     */
    private async getJobsByPriority(targetPriority?: RequestBundlePriorityEnum) {
        // 获取本批次待处理任务
        const waitingJobs = await this.monitorQueue.getJobs(['prioritized'], 0, this.batch_size)
        let result: Job<string>[] = []
        if (typeof targetPriority === 'undefined') {
            result = waitingJobs
        } else {
            result = waitingJobs.sort((a, b) => {
                // 保证特定优先级任务
                if (a.priority == targetPriority && b.priority != targetPriority) {
                    return -1;
                }
                if (a.priority != targetPriority && b.priority == targetPriority) {
                    return 1;
                }
                return a.priority - b.priority;
            })
        }
        return result
    }

    /**
     * 处理特定优先级任务
     * @param priority 
     * @param limit 
     * @returns 
     */
    private async processJobsByPriority(allJobs: Job<string>[], limit: number) {
        for (const job of allJobs) {
            try {
                const decryptedData = await this.decryptService.decryptLog(job.data)
                if (!decryptedData) continue

                await this.monitorService.saveLog(decryptedData);
                // await job.moveToCompleted('done', `${this.token}:${job.id}`);
                await job.remove()
            } catch (err) {
                this.logger.error(`Failed to process job ${job.id}: ${err}`);
                await job.remove()
                // await job.moveToFailed(new Error(err), `${this.token}:${job.id}`);
            }
        }
    }
}

/**
 * 为基类混入悲观锁功能
 * @param BaseClass 基类
 * @returns 拓展后的类
 */
export function PessimisticLockMixin<TBase extends new (...args: any) => object>(BaseClass: TBase) {
    return class extends BaseClass {
        private _lock = false
        protected async runWithLock(fn: (...args: any) => Promise<any>): Promise<any> {
            if (this._lock) return

            this._lock = true
            try {
                await fn()
            } finally {
                this._lock = false
            }
        }
    }
}
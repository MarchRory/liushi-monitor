class LRUCache {
    private MAX_SIZE: number;

    private cacheMap: Map<number | string, unknown>;

    constructor(MAX_SIZE: number) {
        this.MAX_SIZE = MAX_SIZE;
        this.cacheMap = new Map();
    }

    get(key: number | string) {
        if (!this.cacheMap.has(key)) return -1
        const useCache = this.cacheMap.get(key)
        if (typeof useCache === 'undefined') return -1

        // 清楚当前存储的位置
        this.cacheMap.delete(key);
        // 重新存在最后, 表明最近被使用 
        this.cacheMap.set(key, useCache);

        return useCache;
    }

    put(key: number | string, data: unknown) {
        if (this.cacheMap.has(key)) {
            // 有旧值删旧值
            this.cacheMap.delete(key);
        } else if (this.cacheMap.size >= this.MAX_SIZE) {
            // 存满了就删除头部最久没有使用的值
            const deletedKey = this.cacheMap.keys().next().value;
            this.cacheMap.delete(deletedKey);
        }
        this.cacheMap.set(key, data);
    }

    clear() {
        this.cacheMap.clear();
    }
}

export default LRUCache;
class Queue<T> {
    private items: T[] = []

    /**
     * @description  出队
     * @returns
     */
    deQueue() {
        return this.items.shift()
    }
    /**
     * @description  入队
     * @returns
     */
    enQueue(element: T) {
        this.items.push(element)
    }

    /**
     * @description 读取队头
     * @returns 
     */
    getFront() {
        return this.items[0]
    }

    /**
     * @description 判断队列是否为空
     * @returns 
     */
    isQueueEmpty() {
        return this.items.length === 0
    }

    /**
     * @description 获取队列长度
     * @returns 
     */
    size() {
        return this.items.length
    }

    /**
     * @description 清空队列
     */
    clear() {
        this.items = []
    }
}

export default Queue
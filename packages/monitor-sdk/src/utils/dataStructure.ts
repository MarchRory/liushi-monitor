export class Queue<T = unknown> {
    private limit = 10
    private queue: T[]
    constructor(initLimit: number) {
        this.queue = []
        this.limit = initLimit
    }
    deQueue() {
        return this.queue.shift()
    }
    enQueue(element: T) {
        if (this.queue.length < this.limit) {
            this.queue.push(element)
        } else {
            throw new Error('队列长度已超出限制')
        }
    }
    showAll() {
        return this.queue
    }
    size() {
        return this.queue.length
    }
    clear() {
        this.queue.length = 0
    }
    isEmpty() {
        return this.queue.length === 0
    }
}

export class Stack<T = unknown> {
    private stack: T[]
    constructor() {
        this.stack = []
    }
    pop() {
        return this.stack.pop()
    }
    push(element: T) {
        this.stack.push(element)
    }
    showAll() {
        return this.stack
    }
    clear() {
        this.stack.length = 0
    }
    getTop() {
        return this.stack[this.stack.length - 1]
    }
    isEmpty() {
        return this.stack.length === 0
    }
}
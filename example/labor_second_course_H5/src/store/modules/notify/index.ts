import { defineStore } from "pinia";

/* function planObj<T>(arg: Array<T>):Array<T> {
    return arg
} */
interface windowNotifyBar {
    isNotifyShow: boolean
    notifyText: string
    notifyScrollCnt: number
    notifyScrollLimit: number
}

export const useNotifyStore = defineStore("useNotifyStore", {
    state: (): windowNotifyBar => {
        return {
            isNotifyShow: false,
            notifyText: '',
            notifyScrollCnt: 0,
            notifyScrollLimit: 2
        };
    },
    actions: {
        notify(notifyText: string) {
            this.notifyText = notifyText
            this.isNotifyShow = true
        },
        close() {
            this.notifyText = ''
            this.isNotifyShow = false
            this.notifyScrollCnt = 0
        }
    },
});
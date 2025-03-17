import { defineStore } from "pinia";
import { RouteRecordName } from "vue-router";
interface routerCacheType {
    cache: RouteRecordName[]
}
export const useRouterCacheStore = defineStore("useRouterCacheStore", {
    state: (): routerCacheType => {
        return {
            cache: []
        };
    },
    actions: {
        initRouterCache() {
            this.cache = ['home', 'user', 'plan']
        },
        clearRouterCache() {
            this.cache = []
        }
    },
    persist: true, // 持久化
});
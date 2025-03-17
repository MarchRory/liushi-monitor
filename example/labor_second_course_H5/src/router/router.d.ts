import 'vue-router'

declare module 'vue-router' {
    interface RouteMeta {
        /**
         * @description 路由名, 中文
         */
        title: string

        /**
         * @description 页面层级, 用于页面切换动画
         */
        index?: number
    }
}
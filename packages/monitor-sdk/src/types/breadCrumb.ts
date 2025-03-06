/**
 * 基本路由跳转信息
 */
export interface IBaseRouteInfo {
    /**
     * 跳转前路径
     */
    from: string
    /**
     * 跳转后路径
     */
    to: string
}

/**
 * 路由面包屑单项记录信息，用于记录用户的页面浏览行为
 */
export interface IBaseBreadCrumbItem {
    /**
     * 页面路径
     */
    url: string
    /**
     * 页面访问路径, 记录从当前页面开始, 一直访问子页面直到回到当前页面并退出的整个过程中，用户依次访问的页面url
     */
    access_path: string[]
    /**
     * 从前置页面进入当前页面的时间戳
     */
    enter_time: number
    /**
     * 从当前页面返回，回到前置页面的时间戳
     */
    leave_time: number
    /**
     * 当前页面及其包括内容的整体曝光时间（包括当前页面的子页面）
     */
    page_exposure: string
}

/**
 * 路由面包屑自定义配置项
 */
export interface IBaseBreadCrumbOptions {
    /**
     * 忽略的url数组, 其中的url不会被sdk进行路由面包屑记录
     */
    ignore_urls: string[]
    /**
     * 最大BreadCrumbs栈大小，默认50
     * 该项为应对内存泄漏使用，建议根据app实际子页面层级设置
     */
    max_bread_crumbs_stack_size?: number
    /**
     * 单起点路径最大保留的子页面页面记录规模，默认15
     * 该项为应对内存泄漏使用，建议根据app实际子页面层级设置
     */
    max_access_path_size?: number
}
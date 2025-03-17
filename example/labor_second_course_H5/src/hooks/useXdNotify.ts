import { useWebNotification, createEventHook } from "@vueuse/core";


interface XdNoftifyOptions {

    /**
     * @description 弹窗消息内容
     */
    message: string

    /**
     * @description 通知标题
     */
    title?: string;

    /**
     * @description 通知封面图
     */
    cover?: string;

    /**
     * @description 页面跳转配置
     */
    jumpConfig?: {
        path: string
        query: Record<string, any>
    };

    /**
     * @description 自定义点击触发方法
     * @param args 
     * @returns 
     */
    customClickTrigger?: (...args: any[]) => any
}


/**
 * @description 基于vueUse封装的弹窗提醒
 * @param options 
 */
function useXdNotify() {
    const {
        isSupported,
        show,
        close,
        onClick,
        onError,
        onClose,
        onShow
    } = useWebNotification({
        title: 'hello',
        dir: 'auto',
        lang: 'zh',
        renotify: false,
    })

    onClick((evt: Event) => {
        console.log('用户点击了弹窗: ')
    })

    onClose((evt: Event) => {
        console.log('弹窗关闭')
    })

    onError((evt: Event) => {
        console.log('弹窗发生异常: ', evt)
    })

    onShow((evt: Event) => {
        console.log('弹窗正常显示: ', evt)
    })

    const showNotify = (options: XdNoftifyOptions) => {
        const { message, title = import.meta.env.VITE_APP_TITLE, cover = '' } = options
        show({
            title,
            body: message,
            icon: cover
        })
    }

    if (isSupported.value) {
        console.log('当前浏览器支持使用弹窗')
    } else {
        console.log('当前浏览器环境不支持使用弹窗')
    }

    return {
        isSupported,
        showNotify,
        close
    }
}

export default useXdNotify
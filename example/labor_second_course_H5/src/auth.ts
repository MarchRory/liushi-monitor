import router from "./router"
import { getToken, setToken } from "./utils/auth/auth"
import NProgress from "nprogress"   // 路由加载时候的进度条
import getPageTitle from "./utils/pageTitle"
import { showNotify } from "vant"

NProgress.configure({ showSpinner: false })

const whiteList = ['/wait', '/']

router.beforeEach((to: any, _, next: Function) => {
    NProgress.start()
    document.title = getPageTitle(to.meta.title)
    const hasToken = getToken()
    // 读取到token
    if (hasToken) {
        if (to.path === '/') {
            let originUrl = window.location.href
            let url = originUrl.split('/#/')[0].split('/')

            if (url.indexOf('user') != -1 && originUrl.includes('errorMessage')) {
                let message = window.location.href.split('errorMessage=')[1].split('#/')[0]
                let res = decodeURIComponent(message)
                setTimeout(() => {
                    showNotify({ type: 'danger', message: res })
                }, 400)
                next({ path: '/user', query: { isBind: false } })
            }
            else if (url[url.length - 1] === 'user' && !originUrl.includes('errorMessage')) {
                next({ path: '/user', query: { isBind: true } })
            } else {
                next('/wait')
            }
            NProgress.done()
        } else {
            next()
            NProgress.done()
        }
    } else {  // 初次登录无 token 或者 退出登录
        if (whiteList.indexOf(to.path) != -1 && !to.query.isLogOut) {
            let path = window.location.href
            if (path.includes('?')) {
                const token = window.location.href.split('?')[1].split('=')[1].split('#/')[0]
                setToken(token)
                next('/wait')
                NProgress.done()
            } else {
                next()
            }
        } else {
            // to.query 里有isLogOut, 但是tokne依然在url里, 这时候必须要对url处理去token
            let url = window.location.href
            if (url.includes('wait')) {
                // 授权登录登出
                url = url.split('wait')[0] + '#/'
                window.location.href = url
            } else {
                // 账号密码登录登出
                next(`/?redirect=${to.path}`)
            }
            //next()
            NProgress.done()
        }
    }
    NProgress.done()
})

router.afterEach(() => {
    NProgress.done()
})

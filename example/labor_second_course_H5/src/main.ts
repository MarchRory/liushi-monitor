import { createApp } from "vue";
import "./style.css";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import App from "./App.vue";
import "@/styles/index.less";
import { Toast } from "vant";
import "vant/es/toast/style";
import "vant/es/dialog/style";
import { Notify, Swipe, SwipeItem } from "vant";
import "vant/es/notify/style";
import router from "./router";
import stores from "@/store/index";
import { Lazyload } from "vant";
import { Icon } from "@iconify/vue";
import { liushiMonitor, ISDKInitialOptions } from '@liushi-monitor/monitor-sdk'
import { useUserStore } from "./store/modules/user";

const liushiMonitorOptions: ISDKInitialOptions = {
  customBreadCrumb: {
    ignore_urls: ['/login'],
    tabbar_urls: ['/home', '/plan', '/user']
  },
  reportConfig: {
    debugMode: false,
    reportbaseURL: "https://localhost:443",
    reportInterfaceUrl: "/monitor",
  },
  userInteractionMonitorConfig: {
    customClickMonitorConfig: new Map([
    ]),
    clickMonitorClassName: 'm_click_track'
  },

  getUserInfo: () => {
    const userStore = useUserStore()
    return {
      userId: userStore.userId,
      sex: userStore.sex,
    }
  },
  hooks: {}
}

setTimeout(() => {
  $liushiMonitor.postEncryptionConfigToWorker({
    'SECRET_KEY': '9fH3kL0pQrStUvWx',
    'SECRET_IV': 'AbCdEfGhIjKlMnOp'
  })
}, 3000)

createApp(App)
  .use(router)
  .use(stores)
  .use(Toast)
  .use(Notify)
  .use(Lazyload)
  .use(Swipe)
  .use(SwipeItem)
  .use(liushiMonitor, liushiMonitorOptions)
  .component("t-icon", Icon)
  .mount("#app")
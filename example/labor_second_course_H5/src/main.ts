import { createApp } from "vue";
import "./style.css";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import App from "./App.vue";
import "@/styles/index.less";
import { Toast } from "vant";
import "vant/es/toast/style"; // 全局引入toast样式
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
  debugMode: true,
  sdkKey: 'liushi_test_sdk_001',
  localStorageKey: 'liushi_test_storage_001',
  customBreadCrumb: {
    ignore_urls: ['/login'],
    tabbar_urls: ['/home', '/plan', '/user']
  },
  reportbaseURL: "https://localhost:8080",
  reportInterfaceUrl: "/monitor",
  getUserInfo: () => {
    const userStore = useUserStore()
    return {
      userId: userStore.userId,
      campus: userStore.campus,
      sex: userStore.sex,
    }
  },
  dataEncryptionMethod(transformedJsonData) {
    return '自定义加密方法运行成功: ' + transformedJsonData
  },
  hooks: {
    async onDataCollected(_, originalData) {
      return {
        hookInfo: 'hook: onDataCollected 执行成功',
        ...originalData,
      }
    },
    async onDataTransformed(_, transformedData) {
      return {
        hookInfo: 'hook: onDataTransformed 执行成功',
        ...transformedData
      }
    },
    async onBeforeDataReport(encryptedData) {
      return 'hook: onBeforeDataReport 执行成功' + encryptedData
    },
    onBeforeAjaxSend(config) {
      config.headers['custom-hook-test'] = 'hook: onBeforeAjaxSend 执行成功'
      return config
    },
  }
}

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




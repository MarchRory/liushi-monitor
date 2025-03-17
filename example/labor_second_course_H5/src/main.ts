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
import { VueAppMonitorClient } from '@liushi-monitor/monitor-sdk'

createApp(App)
  .use(router)
  .use(stores)
  .use(Toast)
  .use(Notify)
  .use(Lazyload)
  .use(Swipe)
  .use(SwipeItem)
  .component("t-icon", Icon)
  .mount("#app");


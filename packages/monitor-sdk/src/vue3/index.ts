import { ISDKInitialOptions } from "../types";
import SDKBasePlugins from "../plugins";
import Vue3AppMonitorClient from "./src/client/client";
import Vue3ErrorMonitorPlugin from "./src/plugin/errorTrapMonitorPlugin";
import { type App } from "vue";
import { IEncryptionConfig } from "../types/excryption";

declare global {
  interface Window {
    $liushiMonitor: {
      spaStartLoadTimiing(path: string): void;
      sendSpaLoadPerformance(): Promise<void>;
      postEncryptionConfigToWorker(
        payload: IEncryptionConfig<"unParsed">,
      ): void;
    };
  }
  const $liushiMonitor: {
    spaStartLoadTimiing(path: string): void;
    sendSpaLoadPerformance(): Promise<void>;
    postEncryptionConfigToWorker(payload: IEncryptionConfig<"unParsed">): void;
  };
}

/**
 * 注册监控插件
 */
function install(VueApp: App, options: ISDKInitialOptions): void {
  const monitorInstance = new Vue3AppMonitorClient({ ...options, VueApp });
  const { customPlugins = [] } = options;
  const plugins = [Vue3ErrorMonitorPlugin, ...SDKBasePlugins, ...customPlugins];
  window.$liushiMonitor = monitorInstance;
  // @ts-ignore
  monitorInstance.use(plugins);
}

export default install;

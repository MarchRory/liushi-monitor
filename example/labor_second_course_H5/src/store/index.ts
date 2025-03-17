import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'


/* 使用defineStore 创建 Store 时，将 persist 选项设置为 true, 开启pinia持久化 */

const stores = createPinia();
stores.use(piniaPluginPersistedstate)

export default stores;


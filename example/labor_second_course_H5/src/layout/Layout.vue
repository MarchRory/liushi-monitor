s<script setup lang="ts">
import { ref } from "vue";
import { useRouterCacheStore } from "@/store/modules/routerCache/index";
import { routes } from '@/router/index'
import { RouteRecordRaw } from "vue-router";
import { storeToRefs } from "pinia";

defineOptions({
  name:  "layOut"
})

const routerCache = useRouterCacheStore();
const tabbar = ref();

// 自动生成tabbar
const generaterTabbar = () => {
  const tabbarRoutes = routes.filter((route) => route.name === 'layOut')[0].children as RouteRecordRaw[]
  tabbar.value = tabbarRoutes.map((route) => {
    const {path, name, meta} = route
    return {
      path,
      name,
      icon: meta?.icon,
      title: meta?.title
    }
  })
}
generaterTabbar()

const {cache} = storeToRefs(routerCache);
</script>

<template>
  <div class="container">
    <div class="page-main">
      <router-view v-slot="{ Component }">
        <keep-alive :include="cache">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>

    <div>
      <van-tabbar
        route
        safe-area-inset-top
        safe-area-inset-bottom
        inactive-color="#BEBAB3"
        active-color="#E3562A"
      >
        <van-tabbar-item
          replace
          v-for="(item, index) in tabbar"
          :key="index"
          :to="item.path"
        >
          <span>{{ item.title }}</span>
          <template #icon>
            <t-icon class="tabbar-icon" :icon="item.icon" />
          </template>
        </van-tabbar-item>
      </van-tabbar>
    </div>
  </div>
</template>

<style lang="less" scoped>
:deep(.van-tabbar) {
  overflow: hidden;
  box-sizing: border-box;
  height: var(--van-tabbar-height);
}
:deep(.van-tabbar-item) {
  font-size: 18px;
  font-weight: bold;
}
.tabbar-icon {
  font-size: 35px;
}

.page-main {
  width: 100vw;
  height: calc(100vh - var(--van-tabbar-height));
  margin-bottom: var(--van-tabbar-height);
}
</style>

<script setup>
import { onMounted } from "vue";
import { getInfo } from "@/api/user/user";
import router from "@/router/index";
import { getToken, removeToken } from "@/utils/auth/auth";
import { useUserStore } from "@/store/modules/user";
import { useRouterCacheStore } from "@/store/modules/routerCache/index";

const XdLoading = defineAsyncComponent(() => import('@/components/loading/index.vue'))

// 需要跳转回登录界面的错误码
const errCode = ["ERR_NETWORK", "ECONNABORTED"];

const init = () => {
  let oldtoken = getToken();
  if (oldtoken) {
    getUserInfo(oldtoken);
  } else {
    const token = window.location.href
      .split("/?")[1]
      .split("=")[1]
      .split("#/")[0];
    getUserInfo(token);
  }
};

const getUserInfo = (token) => {
  const userStore = useUserStore();
  userStore.init(token).then(() => {
    getInfo(token)
      .then((res) => {
        const {userInfo, nowSemester} = res[0].data
        const info = Object.assign(userInfo, res[1].data)
        userStore.initInfo(userInfo, nowSemester).then((res) => {
          setTimeout(() => {
            useRouterCacheStore().initRouterCache();
            router.replace({ path: "/home" });
          }, 800);
        });
      }, (err) => {
        userStore.logOut()
      })
      .catch((err) => {
        const {status = 500} = err.response
        if (status === 500) {
          window.localStorage.clear()
          router.replace({ path: "/" });
        }else {
          userStore.logOut()
        }
      });
  });
};

onMounted(() => {
  init();
});
</script>

<template>
  <div class="container">
    <van-overlay :show="true">
      <XdLoading :visible="true" />
    </van-overlay>
  </div>
</template>

<style scoped lang="less">
:deep(.van-overlay) {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e1e1e1b3;
  .van-loading {
    .flex-c-c {
      flex-direction: column;
    }
  }
}
.container {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  padding: 0 16px;
  height: 100vh;
}
</style>

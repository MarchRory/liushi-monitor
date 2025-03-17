<template>
  <van-config-provider :theme-vars="themeVars">
    <div>
      <XdHeader title="密码修改" />
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="oldPassword"
            type="password"
            name="原密码"
            label="原密码"
            placeholder="密码"
            :rules="[{ required: true, message: '请填写密码' }]"
          />
          <van-field
            v-model="newPassword"
            type="password"
            name="新密码"
            label="新密码"
            placeholder="密码"
            :rules="[{ required: true, message: '请填写密码' }]"
          />
        </van-cell-group>
        <div style="margin: 40px">
          <van-button block type="warning" native-type="submit">
            提交
          </van-button>
        </div>
      </van-form>
    </div>
  </van-config-provider>
</template>

<script setup lang="ts">
import { changePassword } from "@/api/user/user";
import { showToast, showFailToast } from "vant";

defineOptions({
  name: "updatePwd",
});

const XdHeader = defineAsyncComponent(
  () => import("@/components/header/index.vue")
);

const router = useRouter();
const oldPassword = ref("");
const newPassword = ref("");
const themeVars = reactive({
  navBarTextColor: "#e1562a",
  navBarIconColor: "#e1562a",
});
const onSubmit = () => {
  changePassword({
    newPassword: newPassword.value,
    oldPassword: oldPassword.value,
  })
    .then((res) => {
      showToast("修改成功");
      setTimeout(() => {
        router.back();
      }, 500);
    })
    .catch((e) => {
      showFailToast(e.message);
    });
};
</script>

<style scoped lang="less"></style>

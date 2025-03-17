<script setup lang="ts">
import { addFlagApi } from "@/api/user/user";
import useLoading from "@/hooks/useLoading";
import { showFailToast, showSuccessToast } from "vant";
import { useRouter } from "vue-router";
const XdHeader = defineAsyncComponent(
  () => import("@/components/header/index.vue")
);
const content = ref("");
const { loading, setLoading } = useLoading(false);
const router = useRouter();
const submit = () => {
  if (!content.value) {
    showFailToast("还没有填写内容");
    return;
  }
  if (loading.value) {
    return;
  }
  setLoading(true);
  addFlagApi(content.value, 1).then(() => {
    setLoading(false);
    showSuccessToast({
      message: "立Flag成功",
      duration: 100,
    });
    setTimeout(() => {
      router.back();
    }, 100);
  });
};
</script>

<template>
  <div class="create-flag-container">
    <!--@vue-ignore-->
    <XdHeader :title="$route.meta.title" />
    <main>
      <section class="input-header">
        <t-icon class="icon" icon="tabler:flag-filled" color="orange" />
        <span>一个新的小目标</span>
      </section>
      <section class="input-area">
        <van-field
          v-model="content"
          autosize
          type="textarea"
          placeholder="内容"
          label-align="top"
        />
      </section>
      <div
        class="flag-btn"
        :style="{
          backgroundColor: `${content ? '#f48a38' : '#cacaca'}`,
        }"
        @click="submit"
      >
        立下Flag!
      </div>
    </main>
    <van-toast
      v-model:show="loading"
      type="loading"
      message="Flag上传中"
    ></van-toast>
  </div>
</template>

<style scoped lang="less">
.create-flag-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
  main {
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    .input-header {
      width: 96%;
      height: 40px;
      padding: 35px 0 20px 0;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      border-bottom: 5px solid hsl(0, 0%, 95%);
      .icon {
        font-size: 40px;
        margin-right: 20px;
      }
      span {
        font-size: 1.1em;
        font-weight: 700;
        color: rgb(163, 163, 163);
      }
    }
    .input-area {
      :deep(textarea) {
        height: calc(100vh - 90px - 80px - 210px) !important;
        width: 92vw;
        font-size: 1.2em;
        font-weight: 700;
        margin: 0 auto;
        word-wrap: break-word;
        word-break: break-word;
      }
    }
    .flag-btn {
      position: fixed;
      bottom: 60px;
      margin: 0 auto;
      width: 70%;
      padding: 20px 0;
      font-weight: bold;
      font-size: 1em;
      letter-spacing: 5px;
      border-radius: 15px;
      color: white;
      background-color: #f48a38;
    }
  }
}
</style>

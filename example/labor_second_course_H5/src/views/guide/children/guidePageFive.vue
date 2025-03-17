<template>
  <div class="container">
    <div class="guide">
      <div class="title">
        <div class="head animate__animated animate__fadeInLeft">
          亲爱的同学们，愿你的大学生活如同<span>绚烂的彩虹</span>，成为德智体美劳全面发展的高素质劳动者！
        </div>
      </div>
      <div class="imgs">
        <van-row>
          <van-col span="12"
            ><img
              src="https://fingerbed.oss-cn-chengdu.aliyuncs.com/2024/10/22/e1397a81-80ec-4c29-b8ab-905a88f5ab8c.jpg"
              alt=""
          /></van-col>
          <van-col span="12"
            ><img
              src="https://fingerbed.oss-cn-chengdu.aliyuncs.com/2024/10/22/cf4bd549-ff1c-476c-8aa3-6aac6c7bcebb.jpg"
              alt=""
          /></van-col>
        </van-row>
        <van-row>
          <van-col span="8"
            ><img
              src="https://fingerbed.oss-cn-chengdu.aliyuncs.com/2024/10/22/b4c785d9-d6dc-4c74-895a-b640b8ba558f.png"
              alt=""
          /></van-col>
          <van-col span="8"
            ><img
              src="https://fingerbed.oss-cn-chengdu.aliyuncs.com/2024/10/22/383d318e-679c-4067-bc75-d9786757e28c.jpg"
              alt=""
          /></van-col>
          <van-col span="8"
            ><img
              src="https://fingerbed.oss-cn-chengdu.aliyuncs.com/2024/10/22/09953a9d-78bc-4776-863c-e46a4293354d.png"
              alt=""
          /></van-col>
        </van-row>
        <van-row>
          <van-col span="6"
            ><img
              src="https://fingerbed.oss-cn-chengdu.aliyuncs.com/2024/10/22/3ef61ee4-9611-4cc9-b659-8f7f7d48914b.png"
              alt=""
          /></van-col>
          <van-col span="6"
            ><img
              src="https://fingerbed.oss-cn-chengdu.aliyuncs.com/2024/10/22/56485ef0-3339-495a-923a-2bfe6f42fcc2.png"
              alt=""
          /></van-col>
          <van-col span="6"
            ><img
              src="https://fingerbed.oss-cn-chengdu.aliyuncs.com/2024/10/22/2761edce-b1de-46ac-a5b8-0353ae18c192.png"
              alt=""
          /></van-col>
          <van-col span="6"
            ><img
              src="https://fingerbed.oss-cn-chengdu.aliyuncs.com/2024/10/22/43de53e3-4809-4ee7-abba-9fa2bb14234e.jpg"
              alt=""
          /></van-col>
        </van-row>
      </div>
      <div class="openBtn">
        <button
          class="contactButton animate__animated animate__fadeInLeft animate__delay-1s"
          @click="open"
        >
          开启新旅程
          <div class="iconButton">
            <svg
              height="24"
              width="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 0h24v24H0z" fill="none"></path>
              <path
                d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import router from "@/router";

const open = () => {
  router.push({ path: "/wait" });
};
</script>

<style scoped lang="less">
.container {
  width: 100%;
  overflow-x: hidden;
  background: url("@/assets/imgs/guidePage.jpg");
  background-size: 100% auto;
  .guide {
    width: 90%;
    height: 150vh;
    background-color: rgba(255, 255, 255, 0.5);
    .title {
      height: 25%;
      display: flex;
      flex-direction: row;
      justify-content: center;
      .head {
        width: 90%;
        margin: auto;
        font-size: 40px;
        font-weight: 600;
        color: #8b92f5;
        span {
          background-image: -webkit-linear-gradient(
            left,
            rgb(255, 191, 0),
            #e13cfa,
            rgb(0, 242, 255)
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }
    }
    .imgs {
      height: 50%;
      img {
        width: 95%;
      }
    }
  }
  .openBtn {
    height: 10%;
    display: flex;
    justify-content: center;
    align-items: center;
    .contactButton {
      background: #7079f0;
      color: white;
      font-family: inherit;
      padding: 0.45em;
      padding-left: 1em;
      font-size: 35px;
      font-weight: 500;
      border-radius: 0.9em;
      border: none;
      cursor: pointer;
      letter-spacing: 0.05em;
      display: flex;
      align-items: center;
      box-shadow: inset 0 0 1.6em -0.6em #714da6;
      overflow: hidden;
      position: relative;
      height: 2.8em;
      padding-right: 3em;
      .iconButton {
        margin-left: 1em;
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 2.2em;
        width: 2.2em;
        border-radius: 0.7em;
        box-shadow: 0.1em 0.1em 0.6em 0.2em #7a8cf3;
        right: 0.3em;
        transition: all 0.3s;
      }
    }
  }
}
</style>

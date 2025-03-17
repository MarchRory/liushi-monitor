<template>
  <div class="container">
    <div class="guide">
      <div class="title">
        <div class="head animate__animated animate__fadeInDown">
          在这里你可以...
        </div>
        <div class="text animate__animated animate__fadeIn animate__delay-1s">
          制定自己<span style="color: #ef82a0; font-size: 20px">专属</span
          >的劳动素养提升计划
        </div>
        <div class="text animate__animated animate__fadeIn animate__delay-2s">
          通过<span style="color: #ef82a0; font-size: 20px">6</span>种活动类型
        </div>
        <div class="text animate__animated animate__fadeIn animate__delay-3s">
          <span style="color: #ef82a0; font-size: 20px">200</span>余个活动
        </div>
        <div class="text animate__animated animate__fadeIn animate__delay-4s">
          锻炼<span style="color: #ef82a0; font-size: 20px">三</span
          >个维度的能力
        </div>
      </div>
      <div class="imgs">
        <img
          v-show="isShow"
          src="https://fingerbed.oss-cn-chengdu.aliyuncs.com/2024/10/22/f887b443-ddd4-4e5e-9c7c-6546ee3fc5bf.png"
          alt=""
          class="animate__animated animate__rotateIn animate__delay-5s"
        />
        <img
          v-show="!isShow"
          src="https://fingerbed.oss-cn-chengdu.aliyuncs.com/2024/10/22/dc90977d-5593-42e3-a19d-50498c15a8cc.png"
          alt=""
          class="animate__animated animate__fadeIn"
        />
        <img
          v-show="!isShow"
          src="https://fingerbed.oss-cn-chengdu.aliyuncs.com/2024/10/22/68987afc-7469-4c81-86d8-8fa222733d54.png"
          alt=""
          class="animate__animated animate__fadeIn animate__delay-1s"
        />
      </div>
      <div class="openBtn" v-if="!isShow">
        <button
          class="contactButton animate__animated animate__fadeInLeft animate__delay-2s"
          @click="$emit('onChange')"
        >
          继续探索
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
      <div
        class="next animate__animated animate__fadeIn animate__delay-5s"
        v-else
        @click="nextBtn"
      >
        点击我进行下一步>>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const isShow = ref(true);

const nextBtn = function () {
  isShow.value = false;
};
</script>

<style scoped lang="less">
.container {
  width: 100%;
  overflow-x: hidden;
  background: url("@/assets/imgs/guidePage.jpg") top no-repeat;
  background-size: cover;
  .guide {
    width: 90%;
    height: 110vh;
    background-color: rgba(255, 255, 255, 0.5);
    .title {
      height: 35%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      .head {
        height: 20%;
        font-size: 50px;
        font-weight: 600;
        color: #8b92f5;
      }
      .animate__bounceIn {
        --animate-duration: 4s;
      }
      .text {
        font-weight: 600;
        color: #2f90b9;
      }
    }
    .imgs {
      height: 40%;
      // display: flex;
      // justify-items: center;
      img {
        &:first-child {
          margin-top: 10%;
          width: 90%;
        }
        &:nth-child(2) {
          width: 48%;
        }
        &:nth-child(3) {
          width: 43%;
          margin-right: 10px;
        }
      }
    }
  }

  .openBtn {
    height: 30%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.8);
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
  .next {
    font-size: 35px;
    font-weight: 600;
    color: #469a9c;
  }
}
</style>

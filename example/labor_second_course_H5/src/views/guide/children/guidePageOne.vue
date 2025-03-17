<template>
  <div class="container">
    <div class="guide">
      <div class="title animate__animated animate__bounceIn">
        <div class="head">新的学业阶段</div>
        <div class="head">你想收获什么?</div>
        <div class="head">想成为怎样的劳动者?</div>
      </div>
      <div class="imgs animate__animated animate__fadeIn animate__delay-2s">
        <img
          src="https://fingerbed.oss-cn-chengdu.aliyuncs.com/2024/10/22/91331371-62a9-42a5-abef-573eecb5496f.png"
          alt=""
        />
      </div>
      <div
        class="openBtn animate__animated animate__fadeInLeft animate__delay-4s"
      >
        <button class="contactButton" @click="$emit('onChange')">
          开启旅行指南
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

<script lang="ts" setup></script>

<style scoped lang="less">
.container {
  display: flex;
  width: 100%;
  overflow-x: hidden;
  background: url("@/assets/imgs/guidePage.jpg") top no-repeat;
  background-size: cover;
  // background-color: rgb(154, 195, 249);
  .guide {
    width: 90%;
    height: 100vh;
    background-color: rgba(255, 255, 255, 0.5);
    .title {
      height: 25%;
      margin-top: 9%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      .head {
        font-size: 50px;
        font-weight: 600;
        color: #8b92f5;
      }
    }
    .animate__bounceIn {
      --animate-duration: 4s;
    }
    .imgs {
      height: 50%;
      width: 100%;
      img {
        width: 100%;
      }
    }
    .animate__fadeIn {
      --animate-duration: 3s;
    }
  }

  .openBtn {
    height: 15%;
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

<template>
  <div class="container">
    <div class="guide">
      <div class="title">
        <div class="head animate__animated animate__fadeInDown">
          在这里你可以...
        </div>
        <div class="text animate__animated animate__fadeIn animate__delay-1s">
          生成自己的专属年度报告
        </div>
        <div class="text animate__animated animate__fadeIn animate__delay-2s">
          回顾和分享自己成长足迹的点点滴滴
        </div>
      </div>
      <div class="imgs">
        <img
          src="https://fingerbed.oss-cn-chengdu.aliyuncs.com/2024/10/22/87b36a91-5db2-4a87-b100-51e74e5d601f.jpg"
          alt=""
          class="animate__animated animate__rotateInDownLeft animate__delay-3s"
        />
        <img
          src="https://fingerbed.oss-cn-chengdu.aliyuncs.com/2024/10/22/3e9e3076-329b-4c53-9f5f-8c2624bc941c.png"
          alt=""
          class="animate__animated animate__rotateInDownRight animate__delay-4s"
        />
      </div>
      <div class="openBtn">
        <button
          class="contactButton animate__animated animate__fadeInLeft animate__delay-5s"
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
    </div>
  </div>
</template>

<script lang="ts" setup></script>

<style scoped lang="less">
.container {
  // position: relative
  // display: flex;
  width: 100%;
  overflow-x: hidden;
  background: url("@/assets/imgs/guidePage.jpg") top no-repeat;
  background-size: cover;
  .guide {
    margin-top: 0%;
    width: 90%;
    height: 150vh;
    // border: solid 7px black;
    background-color: rgba(255, 255, 255, 0.5);
    .title {
      height: 25%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      .head {
        font-size: 50px;
        font-weight: 600;
        color: #8b92f5;
      }
      .text {
        font-weight: 600;
        color: #2f90b9;
      }
    }
    .imgs {
      height: 58%;
      img {
        &:first-child {
          width: 50%;
        }
        &:nth-child(2) {
          width: 46%;
        }
      }
    }
  }

  .openBtn {
    // height: 20%;
    // background-color: rgba(255, 255, 255, 0.8);
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

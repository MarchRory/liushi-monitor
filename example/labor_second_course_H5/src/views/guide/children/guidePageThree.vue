<template>
  <div class="container">
    <div class="guide">
      <div class="head animate__animated animate__fadeInDown">
        在这里你可以...
      </div>
      <div
        class="text animate__animated animate__fadeIn animate__delay-1s"
        v-show="show1"
      >
        对课程进行特色评价,大胆吐槽
        <img
          src="https://fingerbed.oss-cn-chengdu.aliyuncs.com/2024/10/22/83559fc7-1e17-4f6a-975b-55be643b77ed.png"
          alt=""
        />
      </div>
      <div class="text animate__animated animate__fadeIn" v-show="show2">
        伴随课程一起成长，立下Flag
        <img
          src="https://fingerbed.oss-cn-chengdu.aliyuncs.com/2024/10/22/3b5add64-c69c-4c59-a66c-62b76c8b509c.png"
          alt=""
        />
      </div>
      <div class="text animate__animated animate__fadeIn" v-show="show3">
        <div>和未来的自己对话</div>
        <img
          src="https://fingerbed.oss-cn-chengdu.aliyuncs.com/2024/10/22/6aea1552-959c-4104-a68c-fff3e40c781e.png"
          alt=""
        />
      </div>
      <div class="text animate__animated animate__fadeIn" v-show="show4">
        <div>收获独特的荣誉勋章</div>
        <img
          src="https://fingerbed.oss-cn-chengdu.aliyuncs.com/2024/10/22/c1d83b46-b47e-4a5c-baa9-d1b34a437f59.png"
          alt=""
        />
      </div>
      <div class="openBtn" v-if="show4">
        <button
          class="contactButton animate__animated animate__fadeInLeft animate__delay-1s"
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
        v-else
        class="next animate__animated animate__fadeIn animate__delay-2s"
        @click="nextBtn"
      >
        点击我进行下一步>>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const show1 = ref(true);
const show2 = ref(false);
const show3 = ref(false);
const show4 = ref(false);

const nextBtn = function () {
  if (show1.value) {
    show2.value = true;
    show1.value = false;
  } else {
    if (show2.value) {
      show3.value = true;
      show2.value = false;
    } else {
      if (show3.value) {
        show4.value = true;
        show3.value = false;
      }
    }
  }
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
    height: 150vh;
    background-color: rgba(255, 255, 255, 0.5);
    .head {
      height: 25%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 50px;
      font-weight: 600;
      color: #8b92f5;
    }
    .text {
      height: 30%;
      font-weight: 600;
      color: #2f90b9;
      img {
        width: 78%;
      }
    }
  }
  .openBtn {
    height: 40%;
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
  .next {
    margin-top: 30%;
    font-size: 35px;
    font-weight: 600;
    color: #469a9c;
  }
}
</style>

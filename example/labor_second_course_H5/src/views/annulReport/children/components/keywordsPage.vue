<script setup lang="ts">
import { onMounted } from "vue";
import { gsap } from "gsap";
import { annualReportKeyword } from "@/api/types/annualReport/index";
const tl = gsap.timeline();
const props = defineProps<{
  keywordsObj: annualReportKeyword;
}>();
const animationConfig = {
  duration: 0.6,
};
function initAnimation() {
  tl.to(".title", {
    yPercent: 10,
    opacity: 1,
    duration: animationConfig.duration,
  })
    .from(".keywordName", {
      opacity: 0,
      yPercent: -10,
      duration: animationConfig.duration,
    })
    .fromTo(
      ".description",
      {
        scale: 0,
        duration: animationConfig.duration,
      },
      {
        scale: 1,
      }
    );
}
onMounted(() => {
  if (props.keywordsObj) {
    setTimeout(() => {
      initAnimation();
    }, 800);
  }
});
</script>

<template>
  <div class="mainBox">
    <header class="title">年度<br />关键词</header>
    <div class="keywordName">
      {{ keywordsObj.keyword }}
    </div>
    <footer class="description">
      <article>"&nbsp;{{ keywordsObj.unscramble }}&nbsp;”</article>
    </footer>
  </div>
</template>

<style scoped lang="less">
.mainBox {
  position: absolute;
  width: 100%;
  height: 90%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: bolder;
  .title {
    width: 85%;
    height: 13%;
    font-size: 60px;
    margin-bottom: 40px;
    color: #60381b;
    margin: 0 auto;
    margin-top: 20px;
    text-align: left;
    font-weight: 900;
  }
  .keywordName {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 120px;
    margin-top: 13%;
    width: 100%;
    height: 40%;
  }
  .description {
    max-width: 80%;
    font-size: 23px;
    width: 50%;
    height: fit-content;
    margin: 0 auto;
    padding: 20px;
    color: rgb(180, 106, 10);
    border-radius: 15px;
    --borderColor: #c5a486;
    &:before {
      position: relative;
      left: -20%;
      display: block;
      content: "";
      width: 45px;
      height: 45px;
      border-left: 5px solid var(--borderColor);
      border-top: 5px solid var(--borderColor);
    }
    &:after {
      position: relative;
      left: 100%;
      top: 100%;
      display: block;
      content: "";
      width: 45px;
      height: 45px;
      border-right: 5px solid var(--borderColor);
      border-bottom: 5px solid var(--borderColor);
    }
    article {

    }
  }
}
</style>

<script setup lang="ts">
import { coursesItem, EvalutionItem } from "@/api/types/courses";
import { gsap } from "gsap";
import { onMounted, onBeforeUnmount } from "vue";
import defaultCover from "@/assets/imgs/default-avatar.jpg";
const props = defineProps<{
  maxEvalution: EvalutionItem;
  maxEvaluateCourse: coursesItem;
}>();
var tl: gsap.core.Timeline | null = gsap.timeline();
const animationConfig = {
  header: {
    duration: 0.6,
  },
  course: {
    textStagger: 0.3,
    duration: 0.8,
  },
};
function initAnimation() {
  tl.to(".headerAnimation", {
    yPercent: 10,
    opacity: 1,
    duration: animationConfig.header.duration,
  })
    .from(".photoFrame", {
      opacity: 0,
      scaleX: 0,
      rotateX: 5,
      translateX: -100,
      rotateZ: 20,
      rotateY: -20,
      transformOrigin: "50% 0%",
      duration: animationConfig.header.duration + 0.4,
    })
    .to(".courseTextAnimation", {
      duration: animationConfig.course.duration,
      stagger: animationConfig.course.textStagger,
      keyframes: {
        "0%": {
          yPercent: 10,
          opacity: 0,
        },
        "100%": {
          yPercent: 10,
          opacity: 1,
        },
      },
    })
    .to(".evalute", {
      yPercent: 15,
      opacity: 1,
      duration: animationConfig.course.duration,
    });
}
onMounted(() => {
  if (props.maxEvaluateCourse) {
    setTimeout(() => {
      initAnimation();
    }, 800);
  }
});
onBeforeUnmount(() => {
  tl = null;
});
</script>

<template>
  <div class="mainBox">
    <header class="headerAnimation">
      <div>年度</div>
      <div>教师评语</div>
    </header>
    <div class="main">
      <div class="coursePreview">
        <div class="photoFrame">
          <div class="imgBox">
            <img
              :src="props.maxEvaluateCourse.cover.url || defaultCover"
              alt="课程封面"
            />
          </div>
        </div>
        <div class="title courseTextAnimation">
          {{ props.maxEvaluateCourse.title }}
        </div>
        <div class="location courseTextAnimation">
          {{ props.maxEvaluateCourse.courseLocation }}
        </div>
      </div>
      <div class="evalute">
        <span class="guide">教师评语: </span>
        <article class="context" v-html="props.maxEvalution.evaluate"></article>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.mainBox {
  position: absolute;
  width: 100%;
  height: 90%;
  header {
    width: 85%;
    height: 13%;
    color: #60381b;
    margin: 0 auto;
    text-align: left;
    font-size: 60px;
    font-weight: 900;
  }
  .main {
    margin-top: 13%;
    width: 100%;
    height: 80%;
    .coursePreview {
      width: 80%;
      height: 40%;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      margin-bottom: 60px;
      .photoFrame {
        transform: perspective(500px);
        margin-top: 30px;
        height: 100%;
        width: fit-content;
        border-top: 10px solid white;
        border-bottom: 10px solid rgb(241, 241, 241);
        border-right: 10px solid white;
        border-left: 20px solid rgb(241, 241, 241);
        background: linear-gradient(to right, rgb(241, 241, 241), white);
        box-shadow:
          0px 0.1px 2.1px -6px rgba(0, 0, 0, 0.085),
          0px 0.4px 6.9px -6px rgba(0, 0, 0, 0.125),
          0px 2px 31px -6px rgba(0, 0, 0, 0.21);
        margin-bottom: 20px;
        .imgBox {
          width: 100%;
          height: 100%;
          img {
            width: 100%;
            height: 100%;
          }
        }
      }
      .courseTextAnimation {
        opacity: 0;
        font-weight: bolder;
      }
      .title {
        color: #194f6a;
        font-size: 45px;
        width: 100%;
        word-break: break-word;
        margin-bottom: 30px;
      }
      .location {
        color: #678ea2;
        font-size: 35px;
      }
    }
    .evalute {
      margin: 0 auto;
      width: 80%;
      text-align: left;
      word-wrap: normal;
      opacity: 0;
      .guide {
        font-size: 38px;
        font-weight: bolder;
        color: #db9b6c;
        display: inline;
      }
      article {
        text-indent: 2em;
      }
    }
  }
}
</style>

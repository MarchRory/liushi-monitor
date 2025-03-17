<script setup lang="ts">
import { coursesItem } from "@/api/types/courses";
import { gsap } from "gsap";
import { onMounted } from "vue";
import { ref, defineAsyncComponent, computed } from "vue";
const Cuboid = defineAsyncComponent(() => import("../card/cuboid.vue"));
const props = defineProps<{
  maxCourse: coursesItem[];
}>();
const tl = gsap.timeline();
const cuboidColor = [
  { top: "#78b4f1", front: "#6397cc", aside: "#7dbdff" },
  { top: "#5e75e7", front: "#4b5fbf", aside: "#6580ff" },
  { top: "#2dcfcf", front: "#26c4c4", aside: "#2de2e2" },
  { top: "#8540df", front: "#7b38d1", aside: "#8c41ec" },
  { top: "#9add99", front: "#8ac689", aside: "#a2e7a1" },
  { top: "#ef9453", front: "#e18b4d", aside: "#ff9e58" },
  { top: "#a45923", front: "#85491d", aside: "#c26b2a" },
];
const booksVisible = ref(false);
const selectedIndex = ref(0);
const animationConfig = {
  headerDuration: 0.6,
  booksDuration: cuboidColor.length * 0.2,
  booksStagger: 0.05,
  courseItemDuration: 0.8,
  courseStagger: 0.3,
};
function exchangeCover() {
  selectedIndex.value = (selectedIndex.value + 1) % props.maxCourse.length;
}
function initBooksAnimation() {
  setTimeout(() => {
    booksVisible.value = true;
  }, animationConfig.headerDuration * 2);
  tl.to(".header", {
    yPercent: 10,
    opacity: 1,
    duration: animationConfig.headerDuration,
  })
    .to(".cuboid_item", {
      stagger: animationConfig.booksStagger,
      duration: animationConfig.booksDuration,
      keyframes: {
        "0%": {
          scale: 1.5,
          xPercent: 0,
          yPercent: 20,
          rotateZ: 120,
        },
        "100%": {
          scale: 1.5,
          xPercent: 120,
          yPercent: 0,
          rotateZ: 0,
        },
      },
    })
    .to(".courseItem", {
      stagger: animationConfig.courseStagger,
      duration: animationConfig.courseItemDuration,
      keyframes: {
        "0%": {
          opacity: 0,
          yPercent: 20,
        },
        "100%": {
          opacity: 1,
          yPercent: 0,
        },
      },
    });
}
onMounted(() => {
  if (props.maxCourse) {
    setTimeout(() => {
      initBooksAnimation();
    }, 800);
  }
});
const selectCover = computed(() => {
  return props.maxCourse[selectedIndex.value].cover;
});
</script>
<template>
  <div class="mainBox">
    <header class="header">
      <div>你的</div>
      <div>年度课程</div>
    </header>
    <div class="main">
      <div class="leftSide">
        <div v-for="(item, index) in cuboidColor" :key="index">
          <Cuboid
            @click="exchangeCover"
            :index="index"
            :cover="selectCover"
            class="cuboid_item"
            :style="{ zIndex: cuboidColor.length + 1 - index }"
            :top-color="item.top"
            :aside-color="item.aside"
            :front-color="item.front"
          />
        </div>
        <div></div>
      </div>
      <div class="rightSide">
        <ul>
          <li
            class="courseItem"
            v-for="(course, index) in props.maxCourse"
            :key="index"
          >
            <div class="courseIndex">
              <span>{{ index + 1 }}</span>
            </div>
            <div class="courseInfo">
              <div class="title">{{ course.title }}</div>
              <div class="location">{{ course.courseLocation }}</div>
            </div>
          </li>
        </ul>
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
    width: 94%;
    margin-top: 40px;
    height: 80%;
    display: flex;
    .leftSide {
      width: 40%;
      height: 100%;
      position: relative;
      top: 20%;
      left: -8%;
      .cuboid_item {
        position: relative;
        transform: translateX(-150%) translateY(20%);
      }
    }
    .rightSide {
      overflow-x: hidden;
      width: 60%;
      height: 100%;
      ul {
        margin-top: 40px;
        list-style: none;
        width: 100%;
        height: fit-content;
        li {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          height: 100px;
          width: 100%;
          margin-bottom: 80px;
          opacity: 0;
          .courseIndex {
            width: 20%;
            width: 20%;
            font-size: 40px;
            font-weight: bolder;
            font-family: sans-serif;
            color: #5d939c;
            span {
              display: inline-block;
              height: 100%;
              vertical-align: middle;
            }
          }
          .courseInfo {
            display: flex;
            flex-direction: column;
            height: 90%;
            text-align: left;
            justify-content: space-between;
            color: #295a55;
            .title {
              font-weight: bolder;
              font-size: 38px;
            }
            .location {
              font-size: 25px;
              font-weight: bold;
              color: #6f8d8a;
            }
          }
        }
      }
    }
  }
}
</style>

<script lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
export default {
  props: {
    course: {
      type: Object as any,
      required: true,
      default: () => {},
    },
  },
  setup(props) {
    const { course } = toRefs(props);
    const isComplusory = ref(0);

    let courseType = course.value.objectivesType;
    if (courseType == null || typeof courseType == "undefined") {
      isComplusory.value = 0; // 无此字段
    } else if (courseType == 0) {
      isComplusory.value = 2; // 选修
    } else {
      isComplusory.value = 1; // 必修
    }
    const stateColor = ref("");
    const stateConent = ref("");
    if (course.value.state == -1) {
      stateConent.value = "审核中";
      stateColor.value = "#ed6161";
    } else if (course.value.state == 2) {
      if (course.value.signUpstate == 0) {
        stateConent.value = "待报名";
        stateColor.value = "#30b7c5";
      } else if (course.value.signUpstate == 1) {
        stateConent.value = "待审核";
        stateColor.value = "#8d51cf";
      } else if (course.value.signUpstate == -1) {
        stateConent.value = "被拒绝";
        stateColor.value = "#eb3b3b";
      } else if (course.value.signUpstate == 2) {
        stateConent.value = "被录取";
        stateColor.value = "#30c572";
      } else {
        stateConent.value = "报名中";
        stateColor.value = "#7ca0e9";
      }
    } else if (course.value.state == 3) {
      if (course.value.signUpstate == 4) {
        stateConent.value = "已签到";
      } else if (course.value.signUpstate == 5) {
        stateConent.value = "已完成";
      } else if (course.value.signUpstate == 2) {
        stateConent.value = "待签到";
      }
      stateColor.value = "#f9944c";
    } else if (course.value.state == 4) {
      stateColor.value = "#afadad";
      if (course.value.signUpstate == 5) {
        stateConent.value = "已完成";
      } else if (course.value.signUpstate == 4) {
        stateConent.value = "已签到";
      } else if (course.value.signUpstate == 0) {
        stateConent.value = "未报名";
        stateColor.value = "#f61e1e";
      }
    }
    const router = useRouter();
    const defaultCover = ref("");
    (async () => {
      let dc = await import("@/assets/imgs/Cool-Kids-Discussion.png");
      defaultCover.value = dc.default;
    })();
    return {
      course,
      defaultCover,
      router,
      isComplusory,
      stateConent,
      stateColor,
    };
  },
  methods: {
    openDetail() {
      this.router.push({
        path: "/detail",
        query: { courseId: this.course.id },
      });
    },
  },
};
</script>

<template>
  <div @click="openDetail">
    <div class="course">
      <div>
        <van-image
          width="100%"
          height="230"
          fit="cover"
          lazy-load
          :src="course.cover || defaultCover"
        >
          <div class="category">{{ course.courseCategory }}</div>
          <van-tag
            v-if="isComplusory"
            size="medium"
            class="complusoryTag"
            :color="isComplusory == 1 ? '#ffb475' : '#52cdbd'"
            text-color="#ffffff"
          >
            {{ isComplusory == 1 ? "必修" : "选修" }}
          </van-tag>

          <van-tag
            size="medium"
            class="stateTag"
            :color="stateColor"
            text-color="#ffffff"
          >
            {{ stateConent }}
          </van-tag>
        </van-image>
      </div>
      <div class="timeRange">
        {{ course.hostingStart }} 至 {{ course.hostingEnd }}
      </div>
      <div class="title">
        {{ course.title }}
      </div>
      <div class="introduce">
        {{ course.courseLocation }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.course {
  width: 680px;
  //min-height: 500px;
  height: auto;
  border-radius: 30px;
  background-color: white;
  overflow: hidden;
  margin-bottom: 18px;
  border: 0.8px solid rgba(132, 132, 132, 0.43);

  .category {
    position: absolute;
    padding: 3px 19px;
    border-radius: 27px;
    background-color: #65aaea;
    color: white;
    left: 67%;
    bottom: 5%;
  }

  .complusoryTag {
    position: absolute;
    padding: 7px 18px;
    color: white;
    left: 6%;
    top: 8%;
  }

  .stateTag {
    position: absolute;
    padding: 7px 18px;
    color: white;
    left: 6%;
    bottom: 5%;
  }

  .timeRange,
  .title,
  .introduce {
    text-align: left;
    margin-left: 20px;
    margin-bottom: 13px;
  }

  .timeRange {
    color: #5ba092;
  }

  .title {
    font-size: 40px;
    text-overflow: ellipsis;
    overflow: hidden;
    word-break: break-all;
    white-space: nowrap;
    font-family: Gen Jyuu Gothic;
    line-height: 43px;
    color: rgb(121, 121, 121);
  }

  .introduce {
    font-weight: 300;
  }
}
</style>

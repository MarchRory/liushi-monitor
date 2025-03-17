<script setup lang="ts">
import { EvalutionItem } from "@/api/types/courses";
import { useRouter } from "vue-router";
import defaultCover from "@/assets/imgs/default-cover.jpg";

interface Props {
  evalution: EvalutionItem;
}

const props = defineProps<Props>();

const router = useRouter();

const JumpToDetail = () => {
  router.push({
    path: "/detail",
    query: { courseId: props.evalution.courseId },
  });
};

const img = ref<HTMLDivElement | null>();
const maskHeight = ref(0);
nextTick(() => {
  maskHeight.value = img.value?.$el.offsetHeight!;
});
</script>

<template>
  <div class="evalution-card" @click="JumpToDetail">
    <van-image
      fit="cover"
      :src="props.evalution.cover.url || defaultCover"
      width="100%"
      ref="img"
    >
    </van-image>
    <section
      class="evalution-mask"
      :class="{ 'new-evaluation': !props.evalution.checked }"
      :style="{
        height: maskHeight + 'px',
      }"
    >
      <div class="evalution-info">
        <div class="evalution-header">
          <div class="evalution-title">{{ props.evalution.title }}</div>
          <div class="evalution-score">
            <span class="score-value">{{ props.evalution.score }}</span>
            <span class="score-label">学分</span>
          </div>
        </div>
      </div>
    </section>
    <div class="evaluation-label"> 教师评语: </div>
    <!-- <span class="evaluation-label">教师评语: </span><br /> -->
    <article>
      {{ props.evalution.text }}
    </article>
  </div>
</template>

<style scoped lang="less">
.evalution {
  &-card {
    position: relative;
    .card-shadow;
    width: calc(100% - 40px);
    height: auto;
    margin: 20px auto 0;
    background-color: white;
    border-radius: 15px;
  }
  &-mask {
    position: absolute;
    top: 0px;
    width: 100%;
    border-radius: 15px;
    background: linear-gradient(to bottom, #ffffff00 5%, #111111e0);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    .evalution-info {
      margin: 0 auto;
      width: 96%;
      height: auto;
      display: flex;
      align-items: flex-start;
      flex-direction: column;
      justify-content: flex-start;
      .evalution-header {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .evalution-title {
          text-align: left;
          width: 85%;
          text-overflow: ellipsis;
          font-size: 1.2em;
          color: rgb(216, 216, 216);
          font-weight: bolder;
        }
        .evalution-score {
          flex: 1;
          font-weight: bolder;
          color: #e79603;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-around;
          .score-value {
            font-size: 50px;
          }
          .score-label {
            font-size: 25px;
          }
        }
      }
    }
  }
}
.evaluation-label {
//   display: block;
  position: relative;
//   top: 10%;
  right: calc(90% - 80px);
}
article {
  text-align: left;
  width: 90%;
  text-indent: 2em;
  padding: 10px 30px;
  text-align: left;
  color: rgb(88, 88, 88);
  font-size: 25px;
}

:deep(.van-image__img) {
  border-radius: 15px;
  filter: brightness(70%);
}

.new-evaluation {
  &::before {
    display: block;
    content: "New";
    font-size: 40px;
    font-weight: bolder;
    color: #e79603;
    position: absolute;
    top: 3%;
    left: 3%;
  }
}
</style>

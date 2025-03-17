<template>
  <van-config-provider :theme-vars="themeVars">
    <van-nav-bar left-text="返回" left-arrow @click-left="onClickLeft">
      <template #title><span style="color: #e1562a">历史目标</span></template>
    </van-nav-bar>
    <course-page-skeleton
      :skeLoad="listLoading"
      v-if="listLoading"
    ></course-page-skeleton>
    <div class="container" v-else>
      <van-list
        v-if="objectList.length"
        class="list"
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadList"
      >
        <div>
          <van-cell
            v-for="obj in objectList"
            :key="obj.id"
            @click="openObject(obj.id)"
          >
            <div class="object">
              <div class="seat">
                <van-image
                  width="80%"
                  height="80%"
                  fit="contain"
                  :lazy-load="true"
                  :src="swpuLogo"
                />
              </div>
              <div class="ObjInfo">
                <div class="name">
                  {{ obj.objectivesName }}
                </div>
                <div>
                  <van-progress
                    v-if="obj.fixRestrictions"
                    :pivot-text="`${
                      (obj.completed / obj.fixRestrictions) * 100
                    }%`"
                    color="#E3562A"
                    :percentage="(obj.completed / obj.fixRestrictions) * 100"
                  />
                  <div v-else style="color: #bbbbba">
                    该目标暂时没有设置修读要求
                  </div>
                </div>
              </div>
            </div>
          </van-cell>
        </div>
      </van-list>
      <van-empty v-else description="暂无历史目标数据" />
    </div>
  </van-config-provider>
</template>

<script setup>
import CoursePageSkeleton from "@/components/coursePageSkeleton/coursePageSkeleton.vue";
import { getObjects } from "@/api/objectives/objectives";
const themeVars = reactive({
  navBarTextColor: "#e1562a",
  navBarIconColor: "#e1562a",
});
const objectList = ref([]);
const objectivesTotal = ref(0);
const router = useRouter();
const listLoading = ref(false);
const pageParams = ref({
  pageNum: 1,
  pageSize: 10,
});
const loading = ref(false);
const finished = ref(false);

const loadList = () => {
  listLoading.value = true;
  if (finished.value) return;
  getObjects({ ...pageParams.value, userType: 1 })
    .then((res) => {
      const { list, total } = res.data;
      list.forEach((item) => {
        objectList.value.push(item);
      });
      objectivesTotal.value = total;
      listLoading.value = false;
      if (objectList.value.length >= objectivesTotal.value) {
        finished.value = true;
      } else {
        pageParams.value.pageNum++;
      }
    })
    .finally(() => {
      loading.value = true;
    });
};
const onClickLeft = () => {
  router.back();
};
const openObject = (id) => {
  router.push({ path: "/coursesPlanDetail", query: { id: id } });
};
loadList();
</script>

<style scoped lang="less">
@objInfoWidth: 430px;

.container {
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;

  .list {
    overflow-y: auto;
    padding: 20px 20px 50px;
    max-height: 1400px;

    .object {
      width: 660px;
      height: 200px;
      border-radius: 10px;
      border: 1px solid #cdcdcd;
      overflow: hidden;
      display: flex;
      flex-direction: row;
      margin-top: 20px;
      padding-right: 30px;

      .seat {
        height: 100%;
        width: calc(690px - @objInfoWidth);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .ObjInfo {
        width: @objInfoWidth;
        display: flex;
        justify-content: center;
        flex-direction: column;
        height: 100%;

        .name {
          font-family: Gen Jyuu Gothic;
          font-size: 37px;
          font-weight: 300;
          line-height: 26px;
          letter-spacing: 3px;
          text-align: left;
          margin-bottom: 40px;
        }

        :deep(.van-progress) {
          height: 12px;
        }
      }
    }
  }
}
</style>

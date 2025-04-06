<script setup lang="ts">
import { getAnnualReportListAPI } from "@/api/annulReport/annulReport";
import useAutoLoadList from "@/hooks/useAutoLoadList";
import { annualReportListItemType } from "@/api/types/annualReport";

const XdHeader = defineAsyncComponent(
  () => import("@/components/header/index.vue")
);
const XdLoading = defineAsyncComponent(
  () => import("@/components/loading/index.vue")
);
const ReportPreview = defineAsyncComponent(
  () => import("./components/reportItem.vue")
);
const AnnulReportSwiper = defineAsyncComponent(
  () => import("@/components/swiper/Stack-Swpier.vue")
);

const otherRequestParms = { page: 1, pageSize: 20, state: 3 };
const { listData, loading, totalAll, loadList } =
  useAutoLoadList({
    requestApi: getAnnualReportListAPI,
    otherRequestParms,
  });

const activeTab = ref(0);

const handleChange = (current: number) => {
  activeTab.value = current;
};

loadList();
</script>

<template>
  <div class="pageContainer">
    <XdHeader
      class="xd-header"
      title="年度报告"
      bg-color="transparent"
      :font-color="totalAll ? 'white' : 'black'"
      back-path="/user"
    />
    <main class="report-container">
      <AnnulReportSwiper
        v-if="totalAll"
        :list="listData"
        :active-tab="activeTab"
        :total="totalAll"
        width="100vw"
        height="100%"
        @on-change="handleChange"
      >
        <template
          #item="{
            item,
            index,
          }: {
            item: annualReportListItemType;
            index: number;
          }"
        >
          <ReportPreview
            :preview="item"
            :is-active="activeTab === index"
            :index="index"
            @on-to-be-active="handleChange"
          />
        </template>
      </AnnulReportSwiper>
      <div v-else>暂无数据</div>
    </main>
    <XdLoading :visible="loading" />
    <div
      class="list-back"
      :style="{
        backgroundImage: totalAll
          ? `url(${listData[activeTab].cover || swpuLogo})`
          : 'gray',
      }"
    />
  </div>
</template>

<style scoped lang="less">
@objInfoWidth: 430px;
@bg-color: #cdcdcd;
.pageContainer {
  overflow: hidden;
  position: relative;
  .xd-header {
    z-index: 10;
    backdrop-filter: blur(10px);
  }
  .list-back {
    background-size: cover;
    background-position: center;
    filter: blur(20px) brightness(0.9);
    transition: all 0.4s ease;
    position: absolute;
    z-index: 1;
    width: 100vw;
    height: 100vh;
    transform: scale(1.2);
  }
}
.report-container {
  z-index: 10;
  background: transparent !important;
  overflow-x: auto !important;
  width: 100% !important;
  padding: 20px 0 !important;

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

import { getFLagListApi, updateFlagApi } from "@/api/user/user";
import { defineStore } from "pinia";

export const useFlagStore = defineStore("useFlagStore", {
  state: () => {
    return {
      flagTotal: 0,
      flagFromCourse: 0,
    };
  },
  actions: {
    // 用户总Flag
    updateFlagTotal() {
      getFLagListApi({ pageSize: 100 }).then(({ data }) => {
        this.flagTotal = Number(data.total);
      });
    },
    // 用户课程Flag
    updateFlagCourseTotal() {
      getFLagListApi({ pageSize: 100, origin: 0 }).then(({ data }) => {
        this.flagFromCourse = Number(data.total);
      });
    },
  },
});

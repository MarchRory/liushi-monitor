import { getUserPointTotalAPi, addPointApi } from "@/api/user/user";
import { defineStore } from "pinia";

export const usePointStore = defineStore("usePointStore", {
  state: () => {
    return {
      pointTotal: 0,
      pointHistory: [],
    };
  },
  actions: {
    updatePointTotal() {
      getUserPointTotalAPi().then(({ data }) => {
        this.pointTotal = data;
      });
    },
  },
});

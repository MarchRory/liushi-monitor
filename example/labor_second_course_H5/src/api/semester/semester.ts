import request from "@/utils/http/request";
enum API {
  semesterNow = "/curriculum/semester/now",
}
export default {
  getSemesterNow() {
    return request.get(
      API.semesterNow,
      null,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        }
      }
    );
  },
};

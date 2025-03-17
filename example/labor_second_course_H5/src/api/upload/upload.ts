import request from "@/utils/http/request";

export default {
  setAvatar(file: never) {
    const formData = new FormData();
    formData.append("file", file);
    return request.post("/user/file/upload", formData, {
      headers: { "Content-type": "multipart/form-data" },
    });
  },
};

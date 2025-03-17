<template>
  <div>
    <van-config-provider :theme-vars="themeVars">
      <XdHeader title="设置">
        <template #right>
          <span @click="onSubmit">保存</span>
        </template>
      </XdHeader>
      <van-form>
        <van-cell-group inset>
          <van-field name="uploader" label="头像">
            <template #input>
              <van-uploader
                v-model="files"
                :after-read="afterRead"
                :before-read="beforeRead"
                :max-count="1"
              >
                <van-image
                  width="60"
                  height="60"
                  :src="avatar || defaultAvatar"
                />
              </van-uploader>
            </template>
          </van-field>
          <van-field
            v-model="nickname"
            name="昵称"
            label="昵称"
            placeholder="用户名"
            :rules="[{ required: true, message: '请填写用户名' }]"
          />
          <van-field
            v-model="sex"
            readonly
            name="picker"
            label="性别"
            placeholder="选择性别"
            @click="showSexPicker = true"
            :rules="[{ required: true, message: '请选择性别' }]"
          />
          <van-field
            v-model="campus"
            readonly
            name="picker"
            label="校区"
            placeholder="选择校区"
            @click="showCampusPicker = true"
            :rules="[{ required: true, message: '请选择校区' }]"
          />
          <van-field
            v-model="year"
            readonly
            name="picker"
            label="年级"
            placeholder="选择年级"
            @click="showYearPicker = true"
            :rules="[{ required: true, message: '请选择年级' }]"
          />
          <van-field
            v-model="myDepartmentName"
            readonly
            name="picker"
            label="学院"
            placeholder="选择学院"
            @click="handleShowDepartment"
            :rules="[{ required: true, message: '请选择学院' }]"
          />
          <van-field
            v-model="major"
            readonly
            name="picker"
            label="专业"
            placeholder="选择专业"
            @click="showMajorPicker = true"
            :rules="[{ required: true, message: '请选择专业' }]"
          />
        </van-cell-group>

        <van-cell-group inset title="联系方式（任意）">
          <van-field
            v-model="contact['电话']"
            label="手机号"
            placeholder="输入手机号"
          />
          <van-field
            v-model="contact['QQ']"
            label="QQ"
            placeholder="输入QQ号"
          />
          <van-field
            v-model="contact['微信']"
            label="微信"
            placeholder="输入微信号"
          />
          <van-field
            v-model="contact['邮箱']"
            label="邮箱"
            placeholder="输入邮箱"
          />
        </van-cell-group>

        <van-popup v-model:show="showDepartmentPicker" position="bottom">
          <van-picker
            :columns="departmentColumns"
            :loading="departmentLoading"
            @confirm="onDepartmentConfirm"
            @cancel="showDepartmentPicker = false"
          />
        </van-popup>
        <van-popup v-model:show="showYearPicker" position="bottom">
          <van-picker
            :columns="yearColumns"
            @confirm="onYearConfirm"
            @cancel="showYearPicker = false"
          />
        </van-popup>
        <van-popup v-model:show="showSexPicker" position="bottom">
          <van-picker
            :columns="sexColumns"
            @confirm="onSexConfirm"
            @cancel="showSexPicker = false"
          />
        </van-popup>
        <van-popup v-model:show="showCampusPicker" position="bottom">
          <van-picker
            :columns="campusColumns"
            @confirm="onCampusConfirm"
            @cancel="showCampusPicker = false"
          />
        </van-popup>
        <van-popup v-model:show="showMajorPicker" position="bottom">
          <van-picker
            :columns="majorColumns"
            @confirm="onMajorConfirm"
            @cancel="showMajorPicker = false"
          />
        </van-popup>
      </van-form>
    </van-config-provider>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "@/store/modules/user";
import { debounce } from "@/utils/freqCtrl/freqCtrl";
import upload from "@/api/upload/upload";
import { updateUser } from "@/api/user/user";
import { watch, defineAsyncComponent } from "vue";
import { getDepartments, getMajorList } from "@/api/department/department";
import { showFailToast, showSuccessToast, Toast } from "vant";

const defaultAvatar =
  "https://fingerbed.oss-cn-chengdu.aliyuncs.com/2024/05/24/e095bd80-8564-4825-ba1d-c1d78c2cab18.webp";

defineOptions({
  name: "UserInfo",
});

const XdHeader = defineAsyncComponent(
  () => import("@/components/header/index.vue")
);

const themeVars = reactive({
  navBarTextColor: "#e1562a",
  navBarIconColor: "#e1562a",
});
const router = useRouter();
const userStore = useUserStore();
const files = ref([]);
const nickname = ref(JSON.parse(JSON.stringify(userStore.name)));
const avatar = ref(userStore.avatar);
const sex = ref(
  userStore.sex === 0 ? "女" : userStore.sex == 1 ? "男" : "未设置"
);
const myDepartmentId = ref(null);
const myDepartmentName = ref(JSON.parse(JSON.stringify(userStore.department)));
const contact = ref(JSON.parse(JSON.stringify(userStore.contact)));
const year = ref("");
const enrollmentYear = ref(
  JSON.parse(JSON.stringify(userStore.enrollmentYear))
);
const major = ref(JSON.parse(JSON.stringify(userStore.major)));
const majorId = ref();
const campus = ref(JSON.parse(JSON.stringify(userStore.campus)));
const sexColumns = [
  { text: "男", value: 0 },
  { text: "女", value: 1 },
];
const showSexPicker = ref(false);
const showYearPicker = ref(false);
const showDepartmentPicker = ref(false);
const showCampusPicker = ref(false);
const showMajorPicker = ref(false);
const departmentLoading = ref(false);
const yearColumns = ref([]);
const majorColumns = ref([]);
const campusColumns = ref([
  { text: "成都", value: "成都" },
  { text: "南充", value: "南充" },
  { text: "未知", value: "未知" },
]);
{
  let nowYear = new Date().getFullYear();
  for (let i = nowYear; i >= nowYear - 3; i--) {
    yearColumns.value.push({
      text: `${i}级`,
      value: `${i}-09-01`,
    });
  }
  if (userStore.enrollmentYear && userStore.enrollmentYear != "") {
    year.value = userStore.enrollmentYear.substring(0, 4) + "级";
  } else {
    year.value = "";
  }
}
const departmentColumns = ref([]);
const afterRead = (file: never) => {
  file.status = "uploading";
  file.message = "上传中...";
  upload.setAvatar(file.file).then((res) => {
    avatar.value = res.data;
    showFailToast("上传成功");
    (file.status = ""), (file.message = "");
  });
};
const beforeRead = (file) => {
  if (file.type !== "image/jpeg") {
    Toast("请上传 jpg 格式图片");
    return false;
  }
  return true;
};
const onSexConfirm = ({ selectedOptions }) => {
  sex.value = selectedOptions[0].text;
  showSexPicker.value = false;
};
const onCampusConfirm = ({ selectedOptions }) => {
  campus.value = selectedOptions[0].value;
  showCampusPicker.value = false;
};
const onMajorConfirm = ({ selectedOptions }) => {
  major.value = selectedOptions[0].text;
  majorId.value = selectedOptions[0].value;
  showMajorPicker.value = false;
};
const onYearConfirm = ({ selectedOptions }) => {
  year.value = selectedOptions[0].text;
  enrollmentYear.value = selectedOptions[0].value;
  showYearPicker.value = false;
};
const handleShowDepartment = () => {
  if (!departmentColumns.value.length) {
    loadDepartmentColumns();
  }
  showDepartmentPicker.value = true;
};
const onDepartmentConfirm = ({ selectedOptions }) => {
  myDepartmentName.value = selectedOptions[0].text;
  myDepartmentId.value = selectedOptions[0].value;
  showDepartmentPicker.value = false;
};
const loadDepartmentColumns = () => {
  departmentLoading.value = true;
  getDepartments({ page: 1, pageSize: 100 })
    .then((res) => {
      if (res.code == 200) {
        const { list } = res.data;
        list.shift();
        list.forEach((item) => {
          departmentColumns.value.push({
            text: item.departmentName,
            value: item.id,
          });
        });
      }
    })
    .catch((err) => {
      showFailToast("获取学院列表失败");
    })
    .finally(() => {
      departmentLoading.value = false;
    });
};
const loadMajorColumns = () => {
  const departmentId = departmentColumns.value.find(
    (department) => department.text == myDepartmentName.value
  );
  getMajorList({ page: 1, pageSize: 20, departmentId: departmentId.value })
    .then(({ data }) => {
      const { list } = data;
      majorColumns.value = list.map((major) => {
        return {
          text: major.majorName,
          value: major.id,
        };
      });
    })
    .catch((err) => {
      showFailToast("获取专业列表失败");
    });
};
const onSubmit = debounce(() => {
  updateUser({
    id: userStore.userId,
    nickname: nickname.value,
    avatar: avatar.value,
    enrollmentYear: enrollmentYear.value + " 00:00:00",
    departmentId: myDepartmentId.value,
    department: myDepartmentName.value,
    sex: sex.value == "男" ? 1 : 0,
    contact: contact.value,
    campus: campus.value,
    majorId: majorId.value,
  }).then((res) => {
    if (res.code == 200) {
      userStore.avatar = avatar.value;
      userStore.name = nickname.value;
      userStore.enrollmentYear = enrollmentYear.value;
      userStore.department = myDepartmentName.value;
      userStore.sex = sex.value == "男" ? 1 : 0;
      (userStore.campus = campus.value), (userStore.major = major.value);
      userStore.contact = contact.value;
      showSuccessToast("信息已更新");
      setTimeout(() => {
        router.back();
      }, 1500);
    } else {
      showFailToast(res.message);
    }
  });
}, 300);
loadDepartmentColumns();
watch(
  () => showMajorPicker.value,
  (newVal) => {
    if (newVal && !majorColumns.value.length) {
      loadMajorColumns();
    }
  }
);
watch(
  () => myDepartmentId.value,
  () => {
    majorColumns.value = [];
  }
);
</script>

<style scoped></style>

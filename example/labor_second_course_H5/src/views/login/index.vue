<script setup>
import { useUserStore } from "@/store/modules/user";
import { ref, reactive, onMounted, onBeforeMount } from "vue";
import { login, yibanLogin, changePassword } from "@/api/user/user";
import { showFailToast } from "vant";
import { Loading } from "vant";
import router from "@/router/index";
import { getToken } from "@/utils/auth/auth";

const userStore = useUserStore();
const loginForm = reactive({
  username: "",
  passwords: "",
});
const resetPasswordForm = reactive({
  newPassword: "",
  oldPassword: "",
});
const confirmNewPassword = ref("");
const showCenter = ref(false);
const isShowPwd = ref("password");
const showPwd = () => {
  isShowPwd.value = isShowPwd.value == "password" ? "text" : "password";
};
const onSubmit = (values) => {
  const { password, username } = values;
  if (!username) {
    showFailToast("请输入账号");
    return;
  } else if (!password) {
    showFailToast("请输入密码");
    return;
  }
  login(values).then((res) => {
    if (res.code == 200) {
      const userStore = useUserStore();
      const { data } = res;
      const vertifyStr = "swpu" + loginForm.username.slice(-4);
      if (loginForm.passwords == vertifyStr) {
        userStore.init(data).then((res) => (showCenter.value = true));
      } else {
        userStore.init(data).then((res) => {
          router.replace({ path: "/wait" });
        });
      }
    } else {
      showFailToast(res.message);
    }
  });
};

const resetPasswordFirst = () => {
  if (resetPasswordForm.newPassword != confirmNewPassword.value) {
    showFailToast("两次密码输入不一致，请重新输入");
  } else {
    resetPasswordForm.oldPassword = loginForm.passwords;
    changePassword(resetPasswordForm).then((res) => {
      if (res.code == 200) {
        router.push({ path: "/guidePage" });
      }
    });
  }
};

const authLogin = () => {
  yibanLogin();
};

() => {
  if (getToken()) {
    router.replace({ path: "/wait" });
  }
};
</script>

<template>
  <div class="container">
    <div class="cover"></div>
    <div class="content">
      <span style="color: black; font-size: 30px; margin-top: -31px">登录</span>
    </div>
    <div class="loginForm">
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="loginForm.username"
            autocomplete="off"
            name="username"
            label="账号"
            placeholder="请输入账号"
            style="color: white"
          >
            <template #label>
              <t-icon icon="tabler:user" class="label-icon" />
            </template>
          </van-field>
          <van-field
            v-model="loginForm.passwords"
            :type="isShowPwd"
            name="password"
            label="密码"
            placeholder="请输入密码"
            autocomplete="false"
          >
            <template #label>
              <t-icon icon="tabler:lock" class="label-icon" />
            </template>
            <template #button>
              <span @click="showPwd" style="color: black">
                <van-icon name="closed-eye" v-if="isShowPwd === 'password'" />
                <van-icon name="eye-o" v-else />
              </span>
            </template>
          </van-field>
        </van-cell-group>
        <div class="tools">
          <van-button round block native-type="submit" class="button"
            >登录</van-button
          >
          <van-button round block class="button authButton" @click="authLogin"
            >易班授权</van-button
          >
        </div>
      </van-form>
    </div>
    <van-dialog
      v-model:show="showCenter"
      width="300px"
      title="修改密码"
      @confirm="resetPasswordFirst"
    >
      <div class="dialogForm">
        <van-field
          v-model="resetPasswordForm.newPassword"
          size="normal"
          :type="isShowPwd"
          name="password"
          placeholder="请输入新密码"
          autocomplete="false"
        >
          <template #button>
            <span @click="showPwd" style="color: black">
              <van-icon name="closed-eye" v-if="isShowPwd === 'password'" />
              <van-icon name="eye-o" v-else />
            </span>
          </template> </van-field
        ><van-field
          v-model="confirmNewPassword"
          :type="isShowPwd"
          name="password"
          placeholder="请再次输入新密码"
          autocomplete="false"
        >
          <template #button>
            <span @click="showPwd" style="color: black">
              <van-icon name="closed-eye" v-if="isShowPwd === 'password'" />
              <van-icon name="eye-o" v-else />
            </span>
          </template>
        </van-field>
      </div>
    </van-dialog>
  </div>
</template>

<style scoped lang="less">
:deep(.van-cell-group) {
  background-color: transparent;
}

.label-icon {
  font-size: 40px;
}
:deep(.van-field) {
  .card-shadow;
  padding: 25px 16px;
  align-self: stretch;
  gap: 16px;
  box-sizing: border-box;
  background-color: rgba(255, 255, 255, 0.705);
  border-radius: 10px;
  input {
    color: rgb(143, 143, 143);
    font-size: 30px;
    letter-spacing: 2px;
    font-weight: bolder;
    &::placeholder {
      color: #929292;
    }
  }

  .van-field__label {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2em;
    color: black;
  }
}

:deep(.van-form) {
  display: flex;
  align-items: center;
  flex-direction: column;
}

:deep(.van-button) {
  border-radius: 16px;
  border: 0;
}

/**  loading  */
:deep(.van-overlay) {
  display: flex;
  align-items: center;
  justify-content: center;

  .van-loading {
    .flex-c-c {
      flex-direction: column;
    }
  }
}

.container {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  padding: 0 16px;
  height: 100vh;
  background-color: #f1f1f17a;
  div {
    margin-bottom: 30px;
  }
  .content {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    height: 105px;
    color: white;

    span {
      line-height: 32px;
      text-align: center;
      letter-spacing: -0.5px;
      font-family: Gen Jyuu Gothic;
    }
  }

  .loginForm {
    .tools {
      width: 90%;
      height: 200px;
      position: relative;
      top: 200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
    }

    .greyFont {
      font-size: 25px;
      color: #151514;
    }

    .button {
      .card-shadow;
      color: black;
      background-color: white;
      font-family: Gen Jyuu Gothic;
      letter-spacing: 0px;
      line-height: 18px;
      font-weight: 500;
    }

    :deep(.authButton) {
      .card-shadow;
      color: white;
      background: -webkit-linear-gradient(right, #f89a57, #ea8210);
    }
  }
  .dialogForm {
    padding: 5% 10%;
    :deep(.van-field) {
      .card-shadow;
      padding: 25px 16px;
      align-self: stretch;
      gap: 16px;
      box-sizing: border-box;
      background-color: rgba(255, 255, 255, 0.162);
      border-radius: 10px;
      input {
        color: rgb(143, 143, 143);
        font-size: 30px;
        letter-spacing: 2px;
        font-weight: bolder;
        &::placeholder {
          color: #929292;
        }
      }

      .van-field__label {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1em;
        color: black;
      }
    }
  }
}
</style>

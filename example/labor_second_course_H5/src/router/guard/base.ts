import { RouteLocationNormalized, type Router } from "vue-router";
import { getToken, setToken } from "@/utils/auth/auth";
import NProgress from "nprogress"; // 路由加载时候的进度条
import getPageTitle from "@/utils/pageTitle";
import { showNotify } from "vant";
import { useUserStore } from "@/store/modules/user";
import { login } from "@/api/user/user";
import { showFailToast } from "vant";

// 筛选路由
const getQueryParam = (url: string, param: string) => {
  const regex = new RegExp("[?&]" + param + "(=([^&#]*)|&|#|$)");
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

function createBaseRouterGuard(router: Router) {
  NProgress.configure({ showSpinner: false });

  const whiteList = ["/wait", "/"];

  router.beforeEach((to: RouteLocationNormalized, _, next: Function) => {
    NProgress.start();
    document.title = getPageTitle(to.meta.title);
    let hasToken = null;
    hasToken = getToken();
    // 读取到token
    if (hasToken) {
      if (to.path === "/") {
        let originUrl = window.location.href;
        let url = originUrl.split("/#/")[0].split("/");

        if (url.indexOf("user") != -1 && originUrl.includes("errorMessage")) {
          let message = window.location.href
            .split("errorMessage=")[1]
            .split("#/")[0];
          let res = decodeURIComponent(message);
          setTimeout(() => {
            showNotify({ type: "danger", message: res });
          }, 400);
          next({ path: "/user", query: { isBind: false } });
        } else if (
          url[url.length - 1] === "user" &&
          !originUrl.includes("errorMessage")
        ) {
          next({ path: "/user", query: { isBind: true } });
        } else {
          next("/wait");
        }
        NProgress.done();
      } else {
        next();
        NProgress.done();
      }
    } else {
      if (document.title == "问卷调查") {
        next();
        NProgress.done();
      }
      if (document.title == "登录") {
        const name = getQueryParam(to.fullPath, "UserName");
        if (name) {
          login({ username: name, password: "swpu" + name }).then((res) => {
            if (res.code == 200) {
              const userStore = useUserStore();
              const { data } = res;
              userStore.init(data).then(() => {
                router.replace({ path: "/wait" });
              });
            } else {
              showFailToast(res.message!);
            }
          });
        }
      }
      if (whiteList.indexOf(to.path) != -1 && !to.query.isLogOut) {
        // 初次登录无 token 或者 退出登录
        let path = window.location.href;
        if (path.includes("?")) {
          const token = window.location.href
            .split("?")[1]
            .split("=")[1]
            .split("#/")[0];
          setToken(token);
          next("/wait");
          NProgress.done();
        } else {
          next();
        }
      } else {
        // to.query 里有isLogOut, 但是tokne依然在url里, 这时候必须要对url处理去token
        let url = window.location.href;
        if (url.includes("token")) {
          // 授权登录登出
          url = url.split("?")[0] + "#/";
          window.location.href = url;
        } else {
          // 账号密码登录登出
          next(`/?redirect=${to.path}`);
        }
        //next()
        NProgress.done();
      }
    }
    NProgress.done();
  });

  router.afterEach(() => {
    NProgress.done();
  });
}

export default createBaseRouterGuard;

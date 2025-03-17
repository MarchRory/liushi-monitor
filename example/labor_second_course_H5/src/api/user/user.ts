import request from "@/utils/http/request";
import * as userApiTypes from "../types/user";
import {
  ListResponseModel,
  TombstoneGeneratedFields,
  pageParams,
} from "../types/public";
import { FlagStateEnum } from "@/views/Flag/config";
import { PointItem, PointTypeEnum } from "../types/user";
enum API {
  login = "/user/login",
  logOut = "/user/logout",
  getUserInfoBySysToken = "/user/info?type=0", // type=0是学生
  getStuInfoBySysToken = "/user/student/user",
  changePassword = "/user/password",
  updateUserInfo = "/user/student/by/student",
  flag = "/user/flag", // flag
  point = "/user/integral", // 积分
  mailToSelf = "/user/wishes",
  CateGoryScore = "/user/course/total",
}
/**
 * @param 一个对象，{ username, password }
 * @returns swpu_token
 */
export function login(data: userApiTypes.loginParams) {
  return request.post(API.login, data);
}
/**
 *
 */

// 易班授权登录跳转到授权登录页
export function yibanLogin() {
  const cb = encodeURIComponent(import.meta.env.VITE_APP_REDIRECT_PATH);
  return (window.location.href =
    import.meta.env.VITE_APP_API_BASE_URL + `/user/yiban/login?callback=${cb}`);
}

// 账号与易班账号绑定
export function yibanBind(uid: number) {
  window.location.href =
    import.meta.env.VITE_APP_API_BASE_URL +
    "/user/yiban/bind?id=" +
    uid +
    "&callback=" +
    import.meta.env.VITE_APP_YIBANBIND_CALLBACK;
}

/**
 * 通过token获取用户信息
 * @returns
 */
export function getInfo(token: string) {
  return Promise.all([
    request.get<userApiTypes.getInfoByTokenResultModel>(
      API.getUserInfoBySysToken,
      { token },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          swpu_token: token,
        },
      }
    ),
    request.get<userApiTypes.getInfoByStuIdResultModel>(
      API.getStuInfoBySysToken,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          swpu_token: token,
        },
      }
    ),
  ]);
}
export function logOut() {
  return request.get(API.logOut, null, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}

/**
 * 修改密码
 * @param data { newPassword: string; oldPassword: string }
 * @returns
 */
export function changePassword(data: {
  newPassword: string;
  oldPassword: string;
}) {
  return request.post(API.changePassword, data);
}
/**
 * 更新用户个人信息
 * @param data
 * @returns
 */
export function updateUser(data: {
  id: string | number;
  nickname: string;
  avatar: string;
  sex: number;
  departmentId: number;
  department: string;
  contact: any;
  enrollmentYear: string;
}) {
  return request.put<null>(API.updateUserInfo, data);
}

/** --------------
 * @description Flag相关
 *-----------------*/
export interface FlagItem extends TombstoneGeneratedFields {
  uid: string;
  content: string;
  state: FlagStateEnum;
  comment: string;
}
/**
 * 创建flag
 * @param data
 * @returns
 */
export function addFlagApi(content: string, origin: number) {
  return request.post(API.flag, {
    origin,
    state: FlagStateEnum.ing,
    content,
    comment: "",
  });
}

/**
 * 分页查询flag
 * @param params
 * @returns
 */
export function getFLagListApi(params: Omit<pageParams, "page">) {
  return request.get<ListResponseModel<FlagItem>>(API.flag + "/page", params);
}

/**
 * 删除flag
 * @param id
 * @returns
 */
export function deleteFlagApi(id: number | string) {
  return request.delete(API.flag, { id });
}

/**
 * 修改flag
 * @param newFlagInfo
 * @returns
 */
export function updateFlagApi(newFlagInfo: FlagItem) {
  return request.put(API.flag, newFlagInfo);
}

/**
 * id查询flag
 * @param id
 * @returns
 */
export function findFlagApi(id: number | string) {
  return request.get(API.flag, { id });
}

/** --------------
 * @description 积分相关
 *-----------------*/

/**
 * 新增积分
 * @param point 积分值
 * @param type 积分类型
 * @param departmentId 学院id
 * @returns
 */
export function addPointApi(
  point: number,
  type: PointTypeEnum,
  departmentId: string | number
) {
  return request.post(API.point, {
    point,
    type,
    departmentId,
    state: 1,
  } as PointItem);
}

/**
 * @description 积分历史记录
 * @param params
 * @returns
 */
export function getPointHistoryApi(params: pageParams) {
  return request.get<ListResponseModel<userApiTypes.PointHistoryItem>>(
    API.point + "/log/page/front",
    params
  );
}

/**
 * @description 获取用户账号总积分
 * @returns
 */
export function getUserPointTotalAPi() {
  return request.get(API.point + "/total");
}

/** --------------
 * @description 寄语相关
 *-----------------*/

/**
 * 创建寄语
 * @param data
 * @returns
 */
export function createMailToSelf(
  data: Omit<userApiTypes.MailToSelfItem, "id">
) {
  return request.post(API.mailToSelf, data);
}

/**
 * 分页获取寄语列表
 * @param params
 * @returns
 */
export function getMailToSelfList(params: pageParams) {
  return request.get<ListResponseModel<userApiTypes.MailToSelfItem>>(
    API.mailToSelf + "/page/front",
    params
  );
}

/**
 * id获取单个寄语
 * @param id
 * @returns
 */

// export function getMailApi(id: string | number) {
//   return request.get(API.mailToSelf, { id });
// }

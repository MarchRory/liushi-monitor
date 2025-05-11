import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, FormProps } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { ILoginForm } from "../../../../apis/user/types";
import * as userApis from "../../../../apis/user/index";
import useUserStore from "../../../../store/user";
import { getHomePath } from "../../../../utils/navigate";

const LoginPage: React.FC = () => {
  const { setUserInfo } = useUserStore((state) => ({
    setUserInfo: state.setUserInfo,
  }));
  const navigate = useNavigate();

  const onSubmit: FormProps<ILoginForm>["onFinish"] = useCallback(
    async (values: ILoginForm) => {
      try {
        await userApis.Login(values);
        const { data: UserData } = await userApis.GetUserInfo();
        setUserInfo(UserData);
        const targetPath = getHomePath(UserData.userType);
        targetPath && navigate(targetPath, { replace: true });
      } catch (e) {
        console.log("login error: ", e);
      }
    },
    [],
  );
  return (
    <main className="min-h-dvh bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          欢迎回到六时监控分析平台
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Form name="login" className="space-y-6" onFinish={onSubmit}>
            <Form.Item<ILoginForm>
              name="account"
              rules={[{ required: true, message: "请输入用户名" }]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="用户名"
                className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </Form.Item>

            <Form.Item<ILoginForm>
              name="password"
              rules={[{ required: true, message: "请输入密码" }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="密码"
                className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </Form.Item>

            <div>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                登录
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;

import React from "react";
import { Form, Input, Select, TableColumnType, Tag } from "antd";
import * as userAPis from "../../apis/user";
import { useTable, CommonTable } from "../../components/table";
import {
  ISystemUserListItem,
  IUserTypeEnum,
  UserTypesMap,
} from "../../apis/user/types";
import { SelectProps } from "antd/lib";
import { useCommonForm } from "../../components/form";
import { CommonForm, FormItemConfig } from "../../components/form/commonForm";

const columns: TableColumnType<ISystemUserListItem>[] = [
  {
    title: "用户名",
    dataIndex: "userName",
    align: "center",
  },
  {
    title: "账号",
    dataIndex: "account",
    align: "center",
  },
  {
    title: "用户类别",
    dataIndex: "userType",
    align: "center",
    render: (value: ISystemUserListItem["userType"]) => {
      const config = UserTypesMap[value];
      return <Tag color={config.tagColor}>{config.text}</Tag>;
    },
  },
];
const options: SelectProps["options"] = Object.entries(UserTypesMap).map(
  ([type, { text }]) => ({ value: +type, label: text }),
);

const formItems: FormItemConfig<ISystemUserListItem>[] = [
  {
    name: "userName",
    label: "用户名",
    rules: [{ required: true }],
    component: () => <Input placeholder="请设置用户名" />,
  },
  {
    name: "account",
    label: "账号",
    rules: [
      { required: true },
      {
        validator: (_, v: string) => {
          if (!(v.length >= 4 && v.length <= 10)) return Promise.reject();
          return Promise.resolve();
        },
        message: "账号长度为4到10个字符",
      },
    ],
    component: () => <Input placeholder="请设置账号" />,
  },
  {
    name: "password",
    label: "密码",
    rules: [
      { required: true },
      {
        validator: (_, v: string) => {
          if (!(v.length >= 4 && v.length <= 15)) return Promise.reject();
          return Promise.resolve();
        },
        message: "密码长度为4到15个字符",
      },
    ],
    component: () => <Input.Password placeholder="请设置密码" />,
  },
  {
    name: "userType",
    label: "类型",
    rules: [{ required: true }],
    component: () => (
      <Select
        placeholder="请选择用户类型"
        options={options.filter((item) => item.value != IUserTypeEnum.INITIAL)}
      />
    ),
  },
];

const UserMgmtPage: React.FC = () => {
  const [form] = Form.useForm<ISystemUserListItem>();
  const {
    pagination,
    tableState,
    loading,
    pageParams,
    loadList,
    handleDelete,
    updateSearchParams,
  } = useTable({
    otherSearchParams: {
      userType: +IUserTypeEnum.INITIAL,
    },
    requestApi: userAPis.GetSystemUserList,
    deleteApi: userAPis.DeleteSystemUser,
  });
  const {
    submitLoading,
    modalLoading,
    visible,
    formType,
    id,
    openModal,
    closeModal,
    handleSubmit,
    resetForm,
  } = useCommonForm({
    createApi: userAPis.AddSystemUser,
    updateApi: userAPis.UpdateSystemUser,
    getItemApi: userAPis.GetSystemUserInfo,
    onCreateSuccess: () => loadList(),
    onUpdateSuccess: () => loadList(),
    initialValue: {
      account: "",
      password: "",
      userName: "",
      userType: +IUserTypeEnum.OPERATOR,
    },
    formInstance: form,
  });
  return (
    <>
      <CommonTable<ISystemUserListItem, { userType: IUserTypeEnum }>
        columns={columns}
        rowKey="id"
        isAllowDelete={(colomn) => colomn.userType !== IUserTypeEnum.ADMIN}
        handleCreate={() => openModal("create")}
        searchComponent={[
          <Select
            defaultValue={IUserTypeEnum.INITIAL}
            value={pageParams.userType}
            options={options}
            onChange={(userType) => {
              updateSearchParams({ userType });
            }}
          />,
        ]}
        actions={(column) => [
          {
            variant: "filled",
            text: "编辑",
            size: "middle",
            disabled: column.account === "root",
            onClick: () => openModal("update", column.id),
          },
        ]}
        loading={loading}
        pagination={pagination}
        tableState={tableState}
        handleDelete={(id) => handleDelete(id, loadList)}
        loadList={loadList}
      />
      <CommonForm<ISystemUserListItem>
        id={id}
        form={form}
        title="系统用户"
        formType={formType}
        formItems={formItems}
        modalLoading={modalLoading}
        visible={visible}
        submitLoading={submitLoading}
        openModal={openModal}
        closeModal={closeModal}
        handleSubmit={handleSubmit}
        resetForm={resetForm}
      />
    </>
  );
};

export default UserMgmtPage;

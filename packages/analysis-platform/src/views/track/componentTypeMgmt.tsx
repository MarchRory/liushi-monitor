import React from "react";
import { BooleanToNumber } from "../../utils/transformer";
import * as trackingApis from "../../apis/track";
import { CommonTable, useTable } from "../../components/table";
import { Form, Input, Switch, TableColumnType, Tag } from "antd";
import { useCommonForm } from "../../components/form";
import { CommonForm, FormItemConfig } from "../../components/form/commonForm";
import { ICompType, ICompTypeListItem } from "../../apis/track/types";
import { DefaultIndicatorNap } from "../../types/common";

const columns: TableColumnType<ICompTypeListItem>[] = [
  {
    title: "监控组件大类",
    dataIndex: "componentTypeName",
    align: "center",
  },
  {
    title: "中文释义",
    dataIndex: "componentTypeCn",
    align: "center",
  },
  {
    title: "具体组件数量",
    dataIndex: "componentCount",
    align: "center",
  },
  {
    title: "事件类型",
    dataIndex: "isDefault",
    align: "center",
    render: (value: ICompTypeListItem["isDefault"]) => {
      const boolNumber = BooleanToNumber(value);
      const config = DefaultIndicatorNap[boolNumber];
      return <Tag color={config.tagColor}>{config.text}</Tag>;
    },
  },
];

const formItems: FormItemConfig<ICompType>[] = [
  {
    name: "componentTypeName",
    label: "监控事件大类(英文)",
    rules: [{ required: true }],
    component: () => <Input placeholder="请输入英文, 便于配置" />,
  },
  {
    name: "componentTypeCn",
    label: "中文释义",
    rules: [{ required: true }],
    component: () => <Input placeholder="请输入监控组件大类的中文名" />,
  },
  {
    name: "isDefault",
    label: "是否SDK默认",
    rules: [],
    component: () => <Switch defaultChecked disabled />,
  },
];

const CompTypeMgmt: React.FC = () => {
  const [form] = Form.useForm<ICompType>();
  const { tableState, loading, pagination, loadList, handleDelete } = useTable({
    requestApi: trackingApis.GetCompTypeList,
    deleteApi: trackingApis.DeleteCompType,
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
    createApi: trackingApis.AddCompType,
    updateApi: trackingApis.UpdateCompType,
    onCreateSuccess: () => loadList(),
    onUpdateSuccess: () => loadList(),
    initialValue: {
      isDefault: false,
    },
    formInstance: form,
  });

  return (
    <>
      <CommonTable<ICompTypeListItem, {}>
        rowKey="id"
        columns={columns}
        isAllowDelete={(column) => !column.isDefault}
        handleCreate={() => openModal("create")}
        searchComponent={[]}
        loading={loading}
        pagination={pagination}
        tableState={tableState}
        handleDelete={(id) => handleDelete(id, loadList)}
        loadList={loadList}
      />

      <CommonForm<ICompType>
        id={id}
        form={form}
        title="监控组件大类"
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

export default CompTypeMgmt;

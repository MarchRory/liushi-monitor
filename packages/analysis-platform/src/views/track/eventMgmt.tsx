import React from "react";
import { BooleanToNumber } from "../../utils/transformer";
import * as trackingApis from "../../apis/track";
import { CommonTable, useTable } from "../../components/table";
import { IEventListItem, IEventType } from "../../apis/track/types";
import { Form, Input, Switch, TableColumnType, Tag } from "antd";
import { useCommonForm } from "../../components/form";
import { DefaultIndicatorMap } from "../../types/common";
import { CommonForm, FormItemConfig } from "../../components/form/commonForm";

const columns: TableColumnType<IEventListItem>[] = [
  {
    title: "监控事件大类",
    dataIndex: "eventTypeName",
    align: "center",
  },
  {
    title: "中文释义",
    dataIndex: "eventTypeCn",
    align: "center",
  },
  {
    title: "监控指标数量",
    dataIndex: "indicatorCount",
    align: "center",
  },
  {
    title: "事件类型",
    dataIndex: "isDefault",
    align: "center",
    render: (value: IEventType["isDefault"]) => {
      const boolNumber = BooleanToNumber(value);
      const config = DefaultIndicatorMap[boolNumber];
      return <Tag color={config.tagColor}>{config.text}</Tag>;
    },
  },
];

const formItems: FormItemConfig<IEventType>[] = [
  {
    name: "eventTypeName",
    label: "监控事件大类(英文)",
    rules: [{ required: true }],
    component: () => <Input placeholder="请输入英文, 便于配置" />,
  },
  {
    name: "eventTypeCn",
    label: "中文释义",
    rules: [{ required: true }],
    component: () => <Input placeholder="请输入监控事件大类的中文名" />,
  },
  {
    name: "isDefault",
    label: "是否SDK默认",
    rules: [{ required: true }],
    component: () => <Switch defaultChecked />,
  },
];

const EventMgmt: React.FC = () => {
  const [form] = Form.useForm<IEventType>();
  const { tableState, loading, pagination, loadList, handleDelete } = useTable({
    requestApi: trackingApis.GetEventTypeList,
    deleteApi: trackingApis.DeleteEventType,
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
    createApi: trackingApis.AddEventType,
    updateApi: trackingApis.UpdateEventType,
    onCreateSuccess: () => loadList(),
    onUpdateSuccess: () => loadList(),
    initialValue: {
      eventTypeName: "",
      isDefault: false,
    },
    formInstance: form,
  });

  return (
    <>
      <CommonTable<IEventListItem, {}>
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

      <CommonForm<IEventType>
        id={id}
        form={form}
        title="监控事件大类"
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

export default EventMgmt;

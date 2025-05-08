import {
  Form,
  Input,
  Select,
  SelectProps,
  Switch,
  TableColumnType,
  Tag,
} from "antd";
import React, { useCallback, useEffect, useState } from "react";
import * as trackingApis from "../../apis/track";
import { IEventListItem, IEventType, IIndicator } from "../../apis/track/types";
import { DefaultIndicatorMap } from "../../types/common";
import { BooleanToNumber } from "../../utils/transformer";
import { CommonForm, FormItemConfig } from "../../components/form/commonForm";
import { CommonTable, useTable } from "../../components/table";
import { useCommonForm } from "../../components/form";
import { IResponseCodeEnum } from "../../types/request";
import { SEARCH_ALL_VALUE } from "../../utils/constant";

const columns: TableColumnType<IIndicator>[] = [
  {
    title: "指标名",
    dataIndex: "indicatorName",
    align: "center",
  },
  {
    title: "中文释义",
    dataIndex: "indicatorCn",
    align: "center",
  },
  {
    title: "所属监控事件大类",
    dataIndex: "eventTypeCn",
    align: "center",
  },
  {
    title: "指标类型",
    dataIndex: "isDefault",
    align: "center",
    render: (value: IEventType["isDefault"]) => {
      const boolNumber = BooleanToNumber(value);
      const config = DefaultIndicatorMap[boolNumber];
      return <Tag color={config.tagColor}>{config.text}</Tag>;
    },
  },
];

const formItems: (
  eventOpts: SelectProps<IEventListItem>["options"],
) => FormItemConfig<IIndicator>[] = (eventOpts) => [
  {
    name: "indicatorName",
    label: "指标名",
    rules: [{ required: true }],
    component: () => <Input placeholder="请输入英文, 便于配置" />,
  },
  {
    name: "indicatorCn",
    label: "中文释义",
    rules: [{ required: true }],
    component: () => <Input placeholder="请输入指标名的中文名" />,
  },
  {
    name: "eventTypeId",
    label: "所属监控事件大类",
    rules: [{ required: true }],
    component: () => <Select options={eventOpts} />,
  },
  {
    name: "isDefault",
    label: "是否SDK默认",
    rules: [{ required: true }],
    component: () => <Switch defaultChecked />,
  },
];

const IndicatorMgmt: React.FC = () => {
  const [eventOpts, setEventOpts] = useState<
    SelectProps<IEventListItem>["options"]
  >([]);
  const initData = useCallback(async () => {
    const { code, data } = await trackingApis.GetEventTypeList({
      pageNum: 1,
      pageSize: 20,
    });
    if (code === IResponseCodeEnum.SUCCESS) {
      setEventOpts(() =>
        data.list.map(({ id, eventTypeCn }) => ({
          value: +id,
          label: eventTypeCn,
        })),
      );
    }
  }, []);

  const [form] = Form.useForm<IIndicator>();
  const {
    tableState,
    pagination,
    loading,
    pageParams,
    updateSearchParams,
    loadList,
    handleDelete,
  } = useTable({
    requestApi: trackingApis.GetIndicatorsList,
    deleteApi: trackingApis.DeleteIndicator,
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
    createApi: trackingApis.AddIndicator,
    updateApi: trackingApis.UpdateIndicator,
    onCreateSuccess: () => loadList(),
    onUpdateSuccess: () => loadList(),
    initialValue: {
      eventTypeId: SEARCH_ALL_VALUE,
      isDefault: false,
    },
    formInstance: form,
  });
  useEffect(() => {
    initData();
  }, []);
  return (
    <>
      <CommonTable<IIndicator, {}>
        rowKey="id"
        columns={columns}
        isAllowDelete={(column) => !column.isDefault}
        handleCreate={() => openModal("create")}
        searchComponent={[
          <Select
            defaultValue={SEARCH_ALL_VALUE}
            options={[
              { value: SEARCH_ALL_VALUE, label: "全部" },
              ...(eventOpts || []),
            ]}
            value={pageParams.eventTypeId}
            onChange={(eventTypeId) => updateSearchParams({ eventTypeId })}
          />,
        ]}
        loading={loading}
        pagination={pagination}
        tableState={tableState}
        handleDelete={(id) => handleDelete(id, loadList)}
        loadList={loadList}
      />

      <CommonForm<IIndicator>
        id={id}
        form={form}
        title="监控指标"
        formType={formType}
        formItems={formItems(eventOpts)}
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

export default IndicatorMgmt;

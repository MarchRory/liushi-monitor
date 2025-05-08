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
import { DefaultIndicatorMap } from "../../types/common";
import { BooleanToNumber } from "../../utils/transformer";
import { CommonForm, FormItemConfig } from "../../components/form/commonForm";
import { CommonTable, useTable } from "../../components/table";
import { useCommonForm } from "../../components/form";
import { IResponseCodeEnum } from "../../types/request";
import { SEARCH_ALL_VALUE } from "../../utils/constant";
import { IComp, ICompListItem, ICompType } from "../../apis/track/types";

const columns: TableColumnType<ICompListItem>[] = [
  {
    title: "组件名",
    dataIndex: "componentName",
    align: "center",
  },
  {
    title: "中文释义",
    dataIndex: "componentCn",
    align: "center",
  },
  {
    title: "所属监控组件大类",
    dataIndex: "componentCn",
    align: "center",
  },
  {
    title: "组件类型",
    dataIndex: "isDefault",
    align: "center",
    render: (value: ICompListItem["isDefault"]) => {
      const boolNumber = BooleanToNumber(value);
      const config = DefaultIndicatorMap[boolNumber];
      return <Tag color={config.tagColor}>{config.text}</Tag>;
    },
  },
];

const formItems: (
  compTypeOpts: SelectProps<IComp>["options"],
) => FormItemConfig<IComp>[] = (compTypeOpts) => [
  {
    name: "componentName",
    label: "组件名",
    rules: [{ required: true }],
    component: () => (
      <Input placeholder="请输入英文, 与被监控项目中的对应组件名匹配" />
    ),
  },
  {
    name: "componentCn",
    label: "中文释义",
    rules: [{ required: true }],
    component: () => <Input placeholder="请输入组件名的中文名" />,
  },
  {
    name: "componentTypeId",
    label: "所属监控组件大类",
    rules: [{ required: true }],
    component: () => <Select options={compTypeOpts} />,
  },
  {
    name: "isDefault",
    label: "是否SDK默认",
    rules: [],
    component: () => <Switch disabled />,
  },
];

const CompMgmt: React.FC = () => {
  const [compTypeOpts, setEventOpts] = useState<
    SelectProps<ICompType>["options"]
  >([]);
  const initData = useCallback(async () => {
    const { code, data } = await trackingApis.GetCompTypeList({
      pageNum: 1,
      pageSize: 20,
    });
    if (code === IResponseCodeEnum.SUCCESS) {
      setEventOpts(() =>
        data.list.map(({ id, componentTypeCn }) => ({
          value: +id,
          label: componentTypeCn,
        })),
      );
    }
  }, []);

  const [form] = Form.useForm<IComp>();
  const {
    tableState,
    pagination,
    loading,
    pageParams,
    updateSearchParams,
    loadList,
    handleDelete,
  } = useTable({
    requestApi: trackingApis.GetCompList,
    deleteApi: trackingApis.DeleteComp,
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
    createApi: trackingApis.AddComp,
    updateApi: trackingApis.UpdateComp,
    onCreateSuccess: () => loadList(),
    onUpdateSuccess: () => loadList(),
    initialValue: {
      componentTypeId: SEARCH_ALL_VALUE,
      isDefault: false,
    },
    formInstance: form,
  });
  useEffect(() => {
    initData();
  }, []);
  return (
    <>
      <CommonTable<ICompListItem, {}>
        rowKey="id"
        columns={columns}
        isAllowDelete={(column) => !column.isDefault}
        handleCreate={() => openModal("create")}
        searchComponent={[
          <Select
            defaultValue={SEARCH_ALL_VALUE}
            options={[
              { value: SEARCH_ALL_VALUE, label: "全部" },
              ...(compTypeOpts || []),
            ]}
            value={pageParams.componentTypeId}
            onChange={(componentTypeId) =>
              updateSearchParams({ componentTypeId })
            }
          />,
        ]}
        loading={loading}
        pagination={pagination}
        tableState={tableState}
        handleDelete={(id) => handleDelete(id, loadList)}
        loadList={loadList}
      />

      <CommonForm<IComp>
        id={id}
        form={form}
        title="监控指标"
        formType={formType}
        formItems={formItems(compTypeOpts)}
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

export default CompMgmt;

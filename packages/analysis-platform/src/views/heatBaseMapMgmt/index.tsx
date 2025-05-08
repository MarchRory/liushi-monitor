import React, { useEffect } from "react";
import { Form, Input, TableColumnType, Image, Upload, UploadFile } from "antd";
import * as heatBaseMapApis from "../../apis/heatMap";
import { useTable, CommonTable } from "../../components/table";
import { useCommonForm } from "../../components/form";
import { CommonForm, FormItemConfig } from "../../components/form/commonForm";
import { IHeatBaseMapItem } from "../../apis/heatMap/types";
import { UploadProps } from "antd/lib";
import requestInstance from "../../utils/request";
import { IResponseCodeEnum } from "../../types/request";
import useMessage from "antd/es/message/useMessage";

const columns: TableColumnType<IHeatBaseMapItem>[] = [
  {
    title: "对应页面",
    dataIndex: "name",
    align: "center",
  },
  {
    title: "适用底图",
    dataIndex: "imageUrl",
    align: "center",
    render: (url) => {
      return <Image src={url} height={200} />;
    },
  },
  {
    title: "附加描述",
    dataIndex: "description",
    align: "center",
  },
];

const formItems: FormItemConfig<IHeatBaseMapItem>[] = [
  {
    name: "name",
    label: "对应页面路径",
    rules: [{ required: true }],
    component: () => (
      <Input placeholder="请填写该底图对应的页面路径" prefix="#" />
    ),
  },
  {
    name: "description",
    label: "附加说明",
    rules: [{ required: false }],
    component: () => <Input placeholder="若必要, 请填写对该底图的附加说明" />,
  },
  {
    name: "width",
    label: "底图宽度",
    rules: [{ required: true }],
    component: () => <Input disabled placeholder="上传后自动计算底图宽度" />,
  },
  {
    name: "height",
    label: "底图高度",
    rules: [{ required: true }],
    component: () => <Input disabled placeholder="上传后自动计算底图高度" />,
  },
  {
    name: "imageUrl",
    label: "图片URL",
    rules: [{ required: true }],
    component: () => <Input disabled />,
  },
];

const HeatBaseMapPage: React.FC = () => {
  const [message, messageHolder] = useMessage();
  const [form] = Form.useForm<
    IHeatBaseMapItem & { fileList?: UploadProps["fileList"] }
  >();
  const { pagination, tableState, loading, loadList, handleDelete } = useTable({
    requestApi: heatBaseMapApis.GetHeatBaseMapList,
    deleteApi: heatBaseMapApis.DeleteHeatBaseMapById,
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
    createApi: heatBaseMapApis.CreateHeatBaseMap,
    updateApi: heatBaseMapApis.UpdateHeatBaseMap,
    getItemApi: heatBaseMapApis.GetHeatBaseMapInfoById,
    onCreateSuccess: () => loadList(),
    onUpdateSuccess: () => loadList(),
    initialValue: {},
    formInstance: form,
  });

  // 自定义处理Upload组件的值
  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleUploadChange: UploadProps["onChange"] = ({ file }) => {
    if (file.status === "done") {
      form.setFieldValue("imageUrl", file.response?.data || "");
      message.success("上传成功");
      const img = document.createElement("img");
      img.onload = () => {
        form.setFieldValue("width", img.width);
        form.setFieldValue("height", img.height);
      };
      img.src = file.response?.data;
    } else if (file.status === "removed") {
      const fileUrlSplited = file.response.data.split("/");
      requestInstance
        .delete("upload", undefined, {
          params: { filename: fileUrlSplited[fileUrlSplited.length - 1] },
        })
        .then(({ code }) => {
          if (code === IResponseCodeEnum.SUCCESS) {
            message.success("删除成功");
            form.setFieldValue("imageUrl", "");
            form.setFieldValue("width", "");
            form.setFieldValue("height", "");
          }
        });
    }
  };

  useEffect(() => {
    if (formType === "update" && visible) {
      const imageUrl = form.getFieldValue("imageUrl");
      if (imageUrl && !form.getFieldValue("fileList")?.length) {
        const fileList: UploadFile[] = [
          {
            uid: "-1",
            name: "当前图片",
            status: "done",
            url: imageUrl,
          },
        ];
        form.setFieldValue("fileList", fileList);
      }
    } else if (formType === "create" && visible) {
      form.setFieldValue("fileList", []);
    }
  }, [formType, visible, form]);
  return (
    <>
      {messageHolder}
      <CommonTable<IHeatBaseMapItem, {}>
        columns={columns}
        rowKey="id"
        handleCreate={() => openModal("create")}
        searchComponent={[]}
        // actions={
        //     (column) => [
        //   {
        //     variant: "filled",
        //     text: "编辑",
        //     size: "middle",
        //     onClick: () => openModal("update", column.id),
        //   },
        // ]}
        loading={loading}
        pagination={pagination}
        tableState={tableState}
        handleDelete={(id) => handleDelete(id, loadList)}
        loadList={loadList}
      />
      <CommonForm<IHeatBaseMapItem & { fileList?: UploadProps["fileList"] }>
        id={id}
        form={form}
        title="热力图底图"
        formType={formType}
        formItems={[
          {
            name: "fileList",
            label: "热力图底图",
            rules: [{ required: true, message: "请上传热力图底图" }],
            valuePropName: "fileList",
            getValueFromEvent: normFile,
            component: () => (
              <Upload
                action={import.meta.env.VITE_APP_API_BASE_URL + "/upload"}
                accept=".jpg, .jpeg, .png"
                maxCount={1}
                withCredentials={true}
                name="file"
                listType="picture-card"
                headers={{
                  // @ts-ignore
                  "X-Requested-With": null,
                }}
                onChange={handleUploadChange}
              >
                {form.getFieldValue("fileList")?.length ? null : (
                  <div>
                    <div style={{ marginTop: 8 }}>上传图片</div>
                  </div>
                )}
              </Upload>
            ),
            componentProps: {
              // CommonForm组件会将componentProps传递给子组件
              fileList: form.getFieldValue("fileList") || [],
            },
          },
          ...formItems,
        ]}
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

export default HeatBaseMapPage;

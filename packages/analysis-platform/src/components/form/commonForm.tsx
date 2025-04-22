import React, { useEffect, useState } from "react";
import { Button, Form, FormItemProps, Modal, Space } from "antd";
import { useCommonForm } from "./useCommonForm";
import { FormInstance } from "antd/lib";
import { PartiallyRequired } from "../../types/utils";

export type FormItemConfig<T extends Object> = PartiallyRequired<
  FormItemProps<T>,
  "name" | "label" | "rules"
> & {
  component: () => React.ReactElement;
  componentProps?: Record<string, any>;
};

type CommonFormProps<T extends Object> = {
  formItems: FormItemConfig<T>[];
  title: string;
  form: FormInstance<T>;
};

type SubmitText = "创建" | "更新";

export function CommonForm<T extends Object>({
  form,
  formType,
  formItems,
  title,
  modalLoading,
  submitLoading,
  visible,
  closeModal,
  handleSubmit,
}: CommonFormProps<T> & ReturnType<typeof useCommonForm<T>>) {
  const [submitText, setText] = useState<SubmitText>("创建");
  useEffect(() => {
    setText(() => (formType === "create" ? "创建" : "更新"));
  }, [formType]);

  return (
    <>
      <Modal
        destroyOnClose={false}
        open={visible}
        forceRender
        loading={modalLoading}
        title={<span>{`${submitText}${title}`}</span>}
        onCancel={closeModal}
        footer={null}
        maskClosable={false}
      >
        <Form
          form={form}
          layout="horizontal"
          labelCol={{ span: 8 }}
          onFinish={(data) => handleSubmit(formType, data)}
          className="space-y-4"
        >
          {formItems.map((item, index) => (
            <Form.Item
              valuePropName={item.name === "isDefault" ? "checked" : "value"}
              key={index}
              name={item.name}
              label={item.label}
              rules={item.rules || []}
            >
              {item.component()}
            </Form.Item>
          ))}
          <Form.Item wrapperCol={{ span: 12, offset: 6 }}>
            <Space>
              <Button loading={submitLoading} type="primary" htmlType="submit">
                {`${submitText}`}
              </Button>
              <Button onClick={closeModal}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

import {
  Table,
  Spin,
  Space,
  Popconfirm,
  Button,
  TableColumnType,
  Flex,
} from "antd";
import { useTable } from "./useTable";
import React, { useMemo } from "react";
import { IResponseModel } from "../../types/request";
import { ButtonProps } from "antd/lib";

type CommonTableProps<R extends Object> = {
  columns: TableColumnType<R>[];
  searchComponent?: React.ReactNode[];
  rowKey: keyof R;
  handleCreate: (...args: any[]) => any;
  tableClassName?: string; // 表格额外样式
  isAllowDelete?: (colunm: R) => boolean;
  actions?: (columns: R) => (ButtonProps & { text: string })[]; // 自定义操作列
  deleteApi?: (...args: any[]) => Promise<IResponseModel<void>>;
};

export function CommonTable<R extends object, T extends object>({
  columns = [],
  searchComponent = [],
  rowKey,
  tableClassName = "",
  tableState,
  loading,
  pagination,
  handleCreate,
  isAllowDelete,
  actions,
  loadList,
  handleDelete,
}: CommonTableProps<R> &
  Omit<
    ReturnType<typeof useTable<R, T>>,
    "pageParams" | "updateSearchParams"
  >) {
  // 添加操作列
  const enhancedColumns = useMemo<TableColumnType<R>[]>(() => {
    const actionColumn: TableColumnType<R> = {
      title: "操作",
      key: "action",
      align: "center",
      minWidth: 80,
      render: (record: R) => (
        <Space size="middle">
          {actions &&
            actions(record).map((props, index) => (
              <Button {...props} key={index}>
                {props.text}
              </Button>
            ))}
          {isAllowDelete && !isAllowDelete(record) ? null : (
            <Popconfirm
              title="确认删除？"
              onConfirm={() => handleDelete(record[rowKey] as string)}
              okText="删除"
              cancelText="取消"
              placement="top"
            >
              <Button danger variant="filled" size="middle" color="red">
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    };

    return columns.includes(actionColumn)
      ? columns
      : [...columns, actionColumn];
  }, [columns, actions, handleDelete, rowKey]);
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      {/* 搜索区域 */}
      {searchComponent?.length ? (
        <div className="mb-6 border-b pb-4">
          <Flex>
            {searchComponent.map((component, index) => (
              <div key={index} className="flex items-center gap-2">
                {component}
                {index === searchComponent.length - 1 && (
                  <Button
                    type="primary"
                    onClick={() => loadList()}
                    className="min-w-[80px]"
                  >
                    搜索
                  </Button>
                )}
              </div>
            ))}
          </Flex>
        </div>
      ) : (
        <div className="mb-6 border-b pb-4">
          <div className="flex items-center gap-4">
            <Button type="primary" onClick={() => loadList()}>
              搜索
            </Button>
          </div>
        </div>
      )}
      <div className=" py-1">
        <Button type="primary" onClick={() => handleCreate()}>
          创建
        </Button>
      </div>

      <Spin spinning={loading} indicator={<Spin size="large" />}>
        <Table
          columns={enhancedColumns}
          dataSource={tableState.tableData}
          rowKey={rowKey}
          pagination={pagination}
          loading={loading}
          bordered
          size="middle"
          scroll={{ x: "max-content" }}
          className={`w-full h-full ${tableClassName}`}
        />
      </Spin>
    </div>
  );
}

import { useState, useMemo, useCallback } from 'react';
import { message } from 'antd';
import { TablePaginationConfig } from 'antd/lib/table';
import { IResponseModel, IListModel, ListRequestParamsModel, IResponseCodeEnum } from '../../types/request';

type CommonObj = Record<string, any>;

type TableState<R = CommonObj> = {
    tableData: R[];
    totalAll: number;
}

type ITableBaseMethodsType<R extends object, T extends object> = {
    requestApi: (params: ListRequestParamsModel<T>) => Promise<IResponseModel<IListModel<R>>>;
    deleteApi?: (...args: any[]) => Promise<IResponseModel<void>>;
    otherSearchParams?: Omit<T, keyof ListRequestParamsModel<T>>;
}

export function useTable<R extends object, T extends object>({
    requestApi,
    deleteApi,
    otherSearchParams = {} as ITableBaseMethodsType<R, T>['otherSearchParams'],
}: ITableBaseMethodsType<R, T>) {
    // 状态管理
    const [pageParams, setPageParams] = useState<ListRequestParamsModel<T>>({
        // @ts-ignore
        pageNum: 1,
        pageSize: 10,
        ...otherSearchParams
    });

    const [tableState, setTableState] = useState<TableState<R>>({
        tableData: [],
        totalAll: 0,
    });

    const [loading, setLoading] = useState(false);

    // 分页配置（Ant Design 格式）
    const pagination: TablePaginationConfig = useMemo(() => ({
        total: tableState.totalAll,
        current: pageParams.pageNum,
        pageSize: pageParams.pageSize,
        showTotal: (total) => `共 ${total} 条数据`,
        onChange: (pageNum, pageSize) => handlePageChange(pageNum, pageSize),
        onShowSizeChange: (_, newSize) => handlePageChange(1, newSize),
        showSizeChanger: true,
        pageSizeOptions: [10, 20, 30, 40, 50],
        showQuickJumper: true,
        size: 'default',
        className: 'mt-6',
    }), [tableState.totalAll, pageParams]);


    // 数据加载（带防抖和错误处理）
    const loadList = useCallback(async (params?: Partial<ListRequestParamsModel<T>>) => {
        setLoading(true);
        try {
            const res = await requestApi({
                ...pageParams,
                ...params,
            } as ListRequestParamsModel<T>);

            if (res.code === IResponseCodeEnum.SUCCESS) {
                setTableState({
                    tableData: res.data.list || [],
                    totalAll: Number(res.data.total),
                });
            }
        } catch (error) {
            message.error('请求失败，请检查网络');
            setTableState({ tableData: [], totalAll: 0 });
        } finally {
            setLoading(false);
        }
    }, [pageParams, requestApi]);

    // 删除处理（支持批量/单条）
    const handleDelete = useCallback(
        async (id: string | number, onSuccess?: () => void) => {
            if (!deleteApi) return;

            try {
                const res = await deleteApi(id);
                if (res.code === IResponseCodeEnum.SUCCESS) {
                    onSuccess?.();

                    // 最后一条数据删除后处理
                    if (tableState.tableData.length === 1 && pageParams.pageNum > 1) {
                        setPageParams(prev => ({ ...prev, page: prev.pageNum - 1 }));
                    }
                    loadList();
                }
            } catch (error) {
                message.error('删除失败，请重试');
            }
        },
        [deleteApi, loadList, tableState, pageParams]
    );

    const updateSearchParams = useCallback((newParams: Partial<Omit<T, keyof ListRequestParamsModel<T>>>) => {
        setPageParams(prev => ({ ...prev, ...newParams, pageNum: 1 })); // 重置页码
        loadList();
    }, [loadList]);

    // 分页事件处理
    const handlePageChange = useCallback(
        (pageNum: number, pageSize: number) => {
            setPageParams(prev => ({ ...prev, pageNum, pageSize }));
            loadList();
        },
        [loadList]
    );

    return {
        tableState,
        pageParams,
        loading,
        pagination,
        loadList,
        handleDelete,
        updateSearchParams
    };
}
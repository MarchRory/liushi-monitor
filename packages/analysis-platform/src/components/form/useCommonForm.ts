import { useCallback, useEffect, useState } from 'react'
import { IResponseCodeEnum, IResponseModel } from "../../types/request"
import { FormValues } from '../../types/utils'
import { FormInstance } from 'rc-field-form'
import { message } from 'antd'

export type FormType = 'create' | 'update'

type FormBaseMethods<
    T extends Object,
    R extends Omit<T, 'id'> = Omit<T, 'id'>,
> = {
    createApi: (data: R) => Promise<IResponseModel>,
    updateApi: (data: T) => Promise<IResponseModel>,
    getItemApi?: (id: number) => Promise<IResponseModel<FormValues<T>>>
    onCreateSuccess?: (data: IResponseModel) => void
    onUpdateSuccess?: (data: IResponseModel) => void
}
type FormState<T extends Object> = {
    initialValue: FormValues<T>
    formInstance: FormInstance<T>
}

type useFormParams<T extends Object> = FormBaseMethods<T> & FormState<T>

export function useCommonForm<T extends Object>({
    initialValue,
    formInstance,
    createApi,
    updateApi,
    getItemApi,
    onCreateSuccess,
    onUpdateSuccess
}: useFormParams<T>) {
    const [formType, setFormType] = useState<FormType>('create')
    const [modalLoading, setModalLoading] = useState(false)
    const [submitLoading, setSubmitLoading] = useState(false)
    const [visible, setVisible] = useState(false)
    const [id, setId] = useState<number | null>(null)

    const resetForm = useCallback(() => {
        formInstance && formInstance.resetFields();
        setId(null)
    }, [formInstance]);

    useEffect(() => {
        formInstance && visible && formInstance.setFieldsValue(initialValue);
    }, [initialValue]);


    const openModal = useCallback(async (formType: FormType, id?: number) => {
        setFormType(formType)
        setVisible(true)
        try {
            setModalLoading(true)
            if (formType === 'update' && typeof id === 'number' && getItemApi) {
                const { code, data } = await getItemApi(id)
                setId(id)
                setTimeout(() => {
                    code === IResponseCodeEnum.SUCCESS && formInstance.setFieldsValue(data)
                })
            }
        } catch (e) {
            setVisible(false)
        } finally {
            setModalLoading(false)
        }

    }, [formInstance])
    const closeModal = useCallback(() => {
        resetForm()
        setVisible(false)
    }, [formInstance])


    const handleSubmit = useCallback(async (type: FormType, formData: T) => {
        setSubmitLoading(true)
        try {
            const api = type === 'create' ? createApi : updateApi
            const submitForm = Object.assign({}, { ...formData }) as T & { id?: number }
            if (formType === 'update' && typeof id === 'number') {
                submitForm['id'] = id
            }
            const data = await api(submitForm)

            if ('code' in data && data.code === IResponseCodeEnum.SUCCESS) {
                type === 'create' && onCreateSuccess && onCreateSuccess(data)
                type === 'update' && onUpdateSuccess && onUpdateSuccess(data)
            }
            message.open({
                type: "success",
                content: `${type === 'create' ? '创建' : "修改"}成功`
            })
            closeModal()
        } catch (e) {
            console.log('form error: ', e)
        } finally {
            setSubmitLoading(false)
        }
    }, [createApi, updateApi, onCreateSuccess, onUpdateSuccess, formInstance])

    return {
        submitLoading,
        modalLoading,
        visible,
        formType,
        id,
        openModal,
        closeModal,
        handleSubmit,
        resetForm
    }
}
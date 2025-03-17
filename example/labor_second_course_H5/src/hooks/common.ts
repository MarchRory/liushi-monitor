
type useBoolean = (
    defaultValue: boolean,
) => [Ref<boolean>, (newValue: boolean) => void];

export const useBoolean: useBoolean = (defaultValue: boolean = false) => {
    const state = ref(defaultValue)
    const setState = (newState: boolean) => {
        state.value = newState
    }
    return [state, setState]
}
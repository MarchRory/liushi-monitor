function useLoading(InitialValue = false) {
    const loading = ref(InitialValue)
    const setLoading = (newState: boolean) => {
        loading.value = newState
    }

    return {
        loading,
        setLoading
    }
}

export default useLoading
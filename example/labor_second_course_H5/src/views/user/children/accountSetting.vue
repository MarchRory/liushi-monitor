<script setup lang="ts">
/**
 * @description 账号设置信息页
 */
import { UserSettingItem } from '../components/type';
import { yibanBind } from "@/api/user/user";
import { useUserStore } from '@/store/modules/user';
import { showFailToast } from 'vant';
import { showConfirmDialog } from 'vant/es/dialog';

const XdHeader = defineAsyncComponent(() => import('@/components/header/index.vue'))
const SettingPart = defineAsyncComponent(() => import('../components/setting-part.vue'))

const userStore = useUserStore()
const handleBindYiban = () => {
    if (userStore.userId) {
        if (!userStore.hasBind) {
            yibanBind(+userStore.userId)
        }
    }else {
        showFailToast('账号异常, 请联系负责老师处理')
    }
}

const baseSettingConfig = ref<UserSettingItem[]>([
    {icon: 'tabler:user-edit', label: '编辑资料', path: '/userInfo'},
    {icon: 'tabler:brand-samsungpass', label: '修改密码', path: '/password'},
    {icon: 'tabler:brand-oauth', label: '易班绑定', path: '', customTrigger: handleBindYiban, forbidJump: userStore.hasBind}
])

const handleLogout = () => {
    showConfirmDialog({
        title: "退出登录",
        message: "确定要退出当前登录的账号吗? ",
    })
    .then(() => {
      // on confirm
      userStore.logOut();
    })
    .catch(() => {
      // on cancel
    });
}


</script>

<template>
    <div class="setting-container">
        <XdHeader title="设置" />
        <main>
            <SettingPart title="用户信息" :settings="baseSettingConfig" >
                <template #before-action="{item}">
                    <span class="before-action-text">
                        {{
                            item.label === '易班绑定' 
                                ? 
                                    userStore.hasBind
                                        ? '已绑定'
                                        : '去绑定'
                                : "" 
                        }}
                    </span>
                </template>
            </SettingPart>
        </main>
        <footer>
            <div class="logout-btn" @click="handleLogout">退出登录</div>
        </footer>
    </div>
</template>

<style scoped lang="less">
.setting-container {
    width: 100%;
    height: 100vh;
    overflow-y: auto;
    background-color: rgba(219, 219, 219, 0.059);
}
.before-action-text {
    color: rgb(169, 169, 169);
    font-weight: bold;
}
.logout-btn {
    margin: 0 auto;
    margin-top: 100px;
    width: 70%;
    padding: 20px 0;
    font-weight: bold;
    font-size: 1em;
    letter-spacing: 5px;
    border-radius: 15px;
    color: white;
    background-color: #f35749;
}
</style>
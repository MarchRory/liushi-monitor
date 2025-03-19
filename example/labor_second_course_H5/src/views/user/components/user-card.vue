<script setup lang="ts">
import { useUserStore } from '@/store/modules/user';
import {usePointStore} from '@/store/modules/point'
import { storeToRefs } from 'pinia';

const userStore = useUserStore()
const pointStore = usePointStore()

const {pointTotal} = storeToRefs(pointStore)
const {campus, major, department} = storeToRefs(userStore)

const userData = computed(() => {
    return [
        { label: '年级', value: userStore.currentGrade },
        { label: '课程', value: 30 },
        { label: '积分', value: pointTotal.value }
    ]
})
const defaultAvatar = 'https://fingerbed.oss-cn-chengdu.aliyuncs.com/2024/05/24/e095bd80-8564-4825-ba1d-c1d78c2cab18.webp'
</script>

<template>
    <div class="user-info-card">
        <section class="user-info-base">
            <van-image
                round
                fit="cover"
                width="4rem"
                height="4rem"
                :src="userStore.avatar || defaultAvatar"
            />
            <div class="info">
                <span  class="username">
                    <t-icon
                        :icon="`${userStore.sex === 0 ? 'tabler:gender-female' : 'tabler:gender-male'}`"
                        :color="`${userStore.sex === 0 ? '#e720a6' : '#288eca'}`"
                        :size="20"
                    />
                    {{ userStore.name }}
                </span>
                <div class="list-container">
                    <div class="tag-list">
                        <ul>
                            <li class="info-tag campus-tag"> <t-icon class="icon" icon="tabler:current-location" :size="5" /> <span>{{ campus }}校区</span> </li>
                            <li class="info-tag department-tag"> <t-icon class="icon" icon="tabler:building-community" :size="5" /> <span>{{ department }}</span> </li>
                            <li class="info-tag major-tag"> <t-icon class="icon" icon="tabler:notebook" :size="5" /> <span>{{ major }}</span> </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
        <div class="line"></div>
        <section class="user-data">
            <div class="data-item" 
                v-for="(item, index) in userData" 
                :key="index"
            >
                <div class="value">{{ item.value }}</div>
                <div class="label">{{ item.label }}</div>
            </div>
        </section>
    </div>
</template>

<style scoped lang="less">
.user-info-card {
    width: 100%;
    min-height: 10rem;
    height: auto;
    padding: 20px 0;
    .user-info-base {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-around;
        .info {
            height: 3.5rem;
            width: calc(100% - 6rem);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: flex-start;
            .username {
                font-weight: bold;
                font-size: 1.1em;
                color: black
            }
            .list-container {
                width: 100%;
                overflow-x: auto;
                .tag-list {
                    display: flex;
                    width: max-content;
                    ul {
                        margin: 0;
                        list-style: none;
                        display: flex;
                        justify-content: flex-start;
                        li {
                            display: inline-block;
                            margin-right: 10px;
                        }
                        .info-tag {
                            .icon {
                                margin-right: 5px;
                            }
                            span {
                                font-weight: 800;
                                font-size: 0.7em;
                            }
                            display: flex;
                            align-items: flex-start;
                            flex-direction: row;
                            justify-content: space-around;
                            padding: 5px 10px;
                            border-radius: 10px;
                        }
                        .campus-tag {
                            background-color: rgb(228, 241, 255);
                            color: rgb(22,93,255);
                        }
                        .department-tag {
                            background-color: rgb(255,243,232);
                            color: rgb(247,114,52);
                        }
                        .major-tag {
                            background-color: rgb(245,232,255);
                            color: rgb(114,46,209);
                        }
                    }
                }
            }
        }
    }
    .line {
        margin-top: 20px;
        width: 90%;
        margin: 20px auto;
        height: 3px;
        background-color: rgb(245, 245, 245);

    }
    .user-data {
        height: 3.5rem;
        display: flex;
        align-items: center;
        justify-content: space-around;
        width: 100%;
        .data-item {
            font-weight: 800;
            font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
            .value {
                font-size: 1.2em;
                color: black;
            }
            .label {
                color: gray;
                font-size: 0.8em;
            }
        }
    }
}
</style>
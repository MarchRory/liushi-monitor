<template>
    <div class="code-reader-content">
        <div class="page">
            <video ref="video" autoplay id="video"></video>
            <p v-if="videoInputDevicesArray.length == 0">{{ textContent }}</p>
        </div>
        <div class="scan-box">
            <div class="frame upper-left"></div>
            <div class="frame upper-right"></div>
            <div class="frame lower-right"></div>
            <div class="frame lower-left"></div>
            <div class="pointer-box">
                <div class="pointer"></div>
            </div>
            <div v-show="tipShow" class="tip">{{ tipMsg }}</div>
            <div class="btn-switch" @click="toggle"></div>
        </div>
    </div>
</template>

<script>
// 引入插件
import { BrowserMultiFormatReader } from '@zxing/library';

export default {
    name: 'httpsCodeReader',
    data() {
        return {
            codeReader: null,
            tipMsg: '正在尝试识别....',
            tipShow: true,
            textContent: undefined,
            videoInputDevicesArray: [],
            deviceId: '',
            isEswitch: false,
            timer: null
        };
    },

    created() {
        this.openScan();

    },

    destroyed() {
        this.codeReader.stopContinuousDecode();
        this.codeReader.reset();
    },

    methods: {
        // 打开扫码
        async openScan() {
            this.codeReader = await new BrowserMultiFormatReader();
            this.codeReader
                .getVideoInputDevices()
                .then(async videoInputDevices => {
                    this.tipShow = true;
                    this.tipMsg = '正在尝试识别....';
                    this.videoInputDevicesArray = videoInputDevices;
                    //
                    console.log('获取到的摄像头', this.videoInputDevicesArray)
                    if (this.videoInputDevicesArray.length > 1) {
                        this.deviceId = this.videoInputDevicesArray[1].deviceId;
                    } else {
                        this.deviceId = this.videoInputDevicesArray[0].deviceId;
                    }
                    this.decodeFromInputVideoFunc();
                })
                .catch(() => {
                    this.tipShow = false;
                });
        },

        // 开始解码
        decodeFromInputVideoFunc() {
            if (this.videoInputDevicesArray.length == 0) {
                this.textContent = '初始化摄像头失败';
                document.getElementById('video').style.display = 'none';
                return;
            }
            this.codeReader.reset();
            this.codeReader.decodeFromInputVideoDeviceContinuously(this.deviceId, 'video', result => {
                this.tipMsg = '正在扫描';
                if (result) {
                    if (result.text) {
                        console.log('扫描成功', result)
                        this.tipMsg = '扫描成功';
                        this.tipShow = true;
                        window && window.getResultEvent(result)
                        window?.parent?.Gikam?.toast("扫码成功");
                        // 关闭扫码功能
                        this.codeReader.reset();
                        this.codeReader.stopContinuousDecode();

                    }
                }
            });
        },

        cutover() {
            if (this.videoInputDevicesArray && this.videoInputDevicesArray.length > 1) {
                if (this.deviceId === this.videoInputDevicesArray[0].deviceId) {
                    return (this.deviceId = this.videoInputDevicesArray[1].deviceId);
                } else {
                    return (this.deviceId = this.videoInputDevicesArray[0].deviceId);
                }
            }
            this.codeReader.stopStreams();
            return;
        },

        // 切换摄像头
        async toggle() {
            this.codeReader.stopStreams();
            this.timer = setTimeout(() => {
                this.timer = null;
            }, 2000);
            if (this.timer) {
                await this.codeReader.tryPlayVideo('video');
                this.cutover();
                this.decodeFromInputVideoFunc();
            }
        }
    }
};
</script>
 
 
<style lang="less" scoped>
.code-reader-content {
    .page {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        height: 100%;

        #video {
            height: 100%;
            width: 100%;
            object-fit: fill;
        }
    }

    .scan-box {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -90%);
        height: 20%;
        width: 70%;

        .frame {
            position: absolute;
            width: 15px;
            height: 15px;
            border: 3px solid transparent;
        }

        .upper-left {
            top: 0;
            left: 0;
            border-left-color: rgba(66, 133, 244, 1);
            border-top-color: rgba(66, 133, 244, 1);
        }

        .upper-right {
            top: 0;
            right: 0;
            border-right-color: rgba(66, 133, 244, 1);
            border-top-color: rgba(66, 133, 244, 1);
        }

        .lower-right {
            bottom: 0;
            right: 0;
            border-bottom-color: rgba(66, 133, 244, 1);
            border-right-color: rgba(66, 133, 244, 1);
        }

        .lower-left {
            bottom: 0;
            left: 0;
            border-left-color: rgba(66, 133, 244, 1);
            border-bottom-color: rgba(66, 133, 244, 1);
        }

        .pointer-box {
            position: absolute;
            top: 0;
            left: 0;
            width: 98%;
            height: 100%;
            overflow: hidden;

            .pointer {
                height: 3px;
                background-image: linear-gradient(to right,
                        transparent 0%,
                        rgba(66, 133, 244, 1) 50%,
                        transparent 100%);
                transform: translateY(-3px);
                animation: move 2s linear infinite;
            }

            @keyframes move {
                0% {
                    transform: translateY(-3px);
                }

                100% {
                    transform: translateY(calc(20vh - 3px));
                }
            }
        }

        .tip {
            position: absolute;
            left: 50%;
            top: 120%;
            transform: translate(-50%, 0);
            white-space: nowrap;
            color: rgb(85, 209, 28);
            font-size: 16px;
        }

        .btn-switch {
            position: absolute;
            left: 50%;
            top: 140%;
            width: 20px;
            height: 20px;
            transform: translate(-50%, 0);
            background-color: green;
        }
    }
}
</style>
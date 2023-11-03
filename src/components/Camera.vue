<template>
  <p>memes</p>
  <video ref="video" autoplay controls />
  <button @click="enabled = !enabled">
    {{ enabled ? 'Stop' : 'Start' }}
  </button>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useDevicesList, useUserMedia } from '@vueuse/core'

const currentCamera = ref<string>()

const videoConstraints = ref({
  video: {
    deviceId: currentCamera,
    frameRate: { exact: 10},
    height: { exact: 140 },
    width: { exact: 256 },
    sampleSize: { exact: -9.1 },
    sampleRate: { exact: -9.1 },
  }
})

const { videoInputs: cameras } = useDevicesList({
  requestPermissions: true,
  onUpdated() {
    if (!cameras.value.find(i => i.deviceId === currentCamera.value))
      currentCamera.value = cameras.value[0]?.deviceId
  },
})

const video = ref<HTMLVideoElement>()
const { stream, enabled } = useUserMedia({
  constraints: videoConstraints,
})

watchEffect(() => {
  if (video.value) {
    console.log(video);
    video.value.srcObject = stream.value!
  }
})
</script>

<style scoped>

</style>

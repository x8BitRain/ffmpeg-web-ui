<template>
  <div v-if="loading">Loading...</div>
  <div v-else class="main">
    <div>
      <Dropzone class="drop-box" @onSelect="onFileChange">
        <div class="drop-box__text">
          <p>{{ dropzoneText }}</p>
        </div>
      </Dropzone>
      <div class="inputs">
        <input :value="settingsInputPrefix" class="inputs__options-prefix" type="text" />
        <input v-model="settingsInput" class="inputs__options" type="text" />
        <input v-model="settingsInputSuffix" class="inputs__options-suffix" type="text" />
        <button v-if="!transcoding" @click="startTranscode">start</button>
        <button v-else @click="cancelTranscode">cancel</button>
      </div>
    </div>
    <div ref="logsRef" v-if="logStack.length" class="logs">
      <p v-for="(log, index) in logStack" :key="index">{{ log }}</p>
    </div>
    <div class="links">
      <a href="https://github.com/x8BitRain/ffmpeg-web-ui">Github</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ffmpeg } from './services'
import { download } from './utils/saveFile'
import { nextTick, onMounted, ref } from 'vue'
import Dropzone from 'vue3-simple-dropzone'

// Data

const loading = ref(true)
const transcoding = ref(false)
const file = ref(null)
const logsRef = ref()
const logStack = ref([])
const dropzoneText = ref('Drop file here')
const settingsInputPrefix = ref('ffmpeg -i input.mp4')
const settingsInput = ref('-c:v libx264 -preset veryfast -r 30 -vf "scale=1920:-1" -c:a copy')
const settingsInputSuffix = ref('output.mp4')

onMounted(async () => {
  await Ffmpeg.init(onLogChange)
  loading.value = false
})

const onLogChange = (logString: string) => {
  logStack.value.push(logString)
  nextTick().then(() => {
    logsRef.value.scrollTop = logsRef.value.scrollHeight + 10
  })
}

const onFileChange = async (video: File) => {
  file.value = video
  console.log(video)
  dropzoneText.value = video.name
  settingsInputSuffix.value = video.name
}

const startTranscode = async () => {
  if (!file.value) {
    alert('Please select a file')
    return
  }
  logStack.value = []
  transcoding.value = true
  const transcodedUrl = await Ffmpeg.transcode(
    file.value,
    settingsInput.value.split(' '),
    settingsInputSuffix.value
  )
  transcoding.value = false
  download(transcodedUrl, settingsInputSuffix.value)
}

const cancelTranscode = () => {
  Ffmpeg.cancelTranscode()
  transcoding.value = false
}
</script>

<style scoped lang="scss">
.main {
  padding: 4rem;
  text-align: left;

  .logs {
    height: 40vh;
    overflow: auto;
    background-color: #000;
    padding: 1rem;
    border-radius: 8px;
  }

  .inputs {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 1rem;
    margin-bottom: 1rem;
    &__options-prefix,
    &__options,
    &__options-suffix {
      border: none;
      border-radius: 8px;
      padding: 8px;
    }
    &__options-prefix {
      width: 8rem;
      pointer-events: none;
      user-select: none;
    }
    &__options {
      width: 100%;
    }
  }
}

.drop-box {
  background-color: #5f5f5f;
  height: 8rem;
  border-radius: 8px;
  box-sizing: border-box;
  cursor: pointer;
  margin-bottom: 1rem;

  :deep(.d-dropzone) {
    height: 100%;
    width: 100%;
    & > div {
      height: 100%;
    }
  }

  &__text {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    margin: 0;
  }
  &:hover {
    border: 4px solid #eaeaea;
  }
}
</style>

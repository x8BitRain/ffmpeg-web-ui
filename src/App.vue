<template>
  <!--  <Camera />-->
  <label for="upload">video</label>
  <input type="file" id="upload" @change="onFileChange" />
  <button @click="listDir">list dir</button>
</template>

<script setup lang="ts">
import Camera from './components/Camera.vue'
import { Ffmpeg } from './services'
import { download } from './utils/saveFile'
import { onMounted } from 'vue'

onMounted(async () => {
  await Ffmpeg.init()
})

const onFileChange = async (event: Event) => {
  const { files } = event.target as HTMLInputElement
  const transcodedUrl = await Ffmpeg.transcode(files![0])
  console.log(transcodedUrl)
  download(transcodedUrl, 'transcoded.mp4')
}

const listDir = async () => {
  console.log(await Ffmpeg.listDir())
}
</script>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

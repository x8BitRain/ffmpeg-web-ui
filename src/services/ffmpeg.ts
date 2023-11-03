import { FFmpeg } from '@ffmpeg/ffmpeg'
import type { LogEvent } from '@ffmpeg/ffmpeg/dist/esm/types'
import { downloadWithProgress, fetchFile } from '@ffmpeg/util'
import { get, set } from 'idb-keyval'
import { blobToUrl } from '@/utils/bufferToFile'

const settings = [
  '-c:v',
  'libx264',
  '-preset',
  'slow',
  '-crf',
  '51',
  // '-minrate',
  // '60',
  // '-maxrate',
  // '60',
  '-r',
  '15',
  '-c:a',
  'copy'
]

const BASE_URL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/esm'
const IDB_KEYS = {
  core: 'ffmpeg-core.js',
  wasm: 'ffmpeg-core.wasm'
} as const

export class Ffmpeg {
  ffmpeg: FFmpeg

  async init(loggerCb?: (msg: string) => void) {
    let coreURL: string, wasmURL: string

    this.ffmpeg = new FFmpeg()
    this.initLogging(loggerCb)

    console.info('Loading ffmpeg')
    const { wasm, core } = (await this.getWasmFromIdb()) || {}
    if (!wasm || !core) {
      const { wasm, core } = await this.getWasmFromUnpkg()
      coreURL = core
      wasmURL = wasm
    } else {
      coreURL = core
      wasmURL = wasm
    }
    await this.ffmpeg.load({
      coreURL,
      wasmURL
      // workerURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.worker.js`, 'text/javascript')
    })
    console.info('Loaded ffmpeg')
  }

  initLogging(cb?: (msg: string) => void) {
    this.ffmpeg.on('log', ({ message: msg }: LogEvent) => {
      console.info(msg)
      cb?.(msg)
    })
  }

  async transcode(file: File, outputName: string) {
    console.info('starting transcode')
    await this.ffmpeg.writeFile('input.mp4', await fetchFile(file))
    await this.ffmpeg.exec(['-i', 'input.mp4', ...settings, outputName])

    console.info('transcoding done')
    const data = await this.ffmpeg.readFile(outputName)
    return URL.createObjectURL(new Blob([(data as Uint8Array).buffer], { type: 'video/mp4' }))
  }

  async listDir() {
    return await this.ffmpeg.listDir('/')
  }

  cancelTranscode() {
    this.ffmpeg.terminate()
  }

  async getWasmFromIdb() {
    const wasmRes = await get(IDB_KEYS.wasm)
    const coreRes = await get(IDB_KEYS.core)
    if (wasmRes && coreRes) {
      const core = blobToUrl(coreRes, 'text/javascript')
      const wasm = blobToUrl(wasmRes, 'application/wasm')
      return { wasm, core }
    }
  }

  async getWasmFromUnpkg() {
    const coreArr = await downloadWithProgress(`${BASE_URL}/ffmpeg-core.js`, (progress) => {
      console.log(progress)
    })
    const wasmArr = await downloadWithProgress(`${BASE_URL}/ffmpeg-core.wasm`, (progress) => {
      console.log(progress)
    })
    const [coreRes, wasmRes] = await Promise.all([coreArr, wasmArr])

    const core = blobToUrl(coreRes, 'text/javascript')
    const wasm = blobToUrl(wasmRes, 'application/wasm')

    await set(IDB_KEYS.core, coreRes)
    await set(IDB_KEYS.wasm, wasmRes)
    return { wasm, core }
  }
}

export default new Ffmpeg()

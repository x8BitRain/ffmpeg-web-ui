class DownloadService {
  loading = false
  chunks: any[] = []
  controller: any = null
  received = 0
  response: any = null
  fileName = ''
  contentType = ''

  public async downloadFile(fileUrl: string, contentType: string, fileName: string): Promise<Blob> {
    if (this.loading) return
    this.resetLocals()
    this.fileName = fileName
    this.contentType = contentType
    console.log('wat')
    return await this.transferFile(fileUrl)
  }

  async transferFile(url: string): Promise<Blob> {
    const signal = this.controller.signal
    this.loading = true

    try {
      this.response = await fetch(url, { signal })
      if (this.response.status >= 200 && this.response.status < 300) {
        return await this.readStream(this.response)
      }
    } catch (error) {
      throw new Error(error as string | undefined)
    } finally {
      this.loading = false
    }
  }

  async readStream(response: Response): Promise<Blob> {
    if (!response) return
    const reader = response.body?.getReader()
    const length = response.headers.get('content-length')

    // Loop through the response stream and extract data chunks
    while (this.loading) {
      const { done, value } = (await reader?.read()) as any
      const payload = {
        received: this.received,
        length,
        loading: this.loading
      }

      if (done) {
        this.loading = false
      } else {
        // Push values to the chunk array
        if (!payload.length) return
        this.chunks.push(value)
        this.received += value.length
        // @ts-ignore
        const progress = ((payload.received / payload.length) * 100).toFixed(2)
        console.info(`Download progress: ${progress}%`)
      }
    }

    // Concat the chunks into a single array
    const body = new Uint8Array(this.received)
    let position = 0

    for (const chunk of this.chunks) {
      body.set(chunk, position)
      position += chunk.length
    }

    const blob = new Blob([body], { type: this.contentType })
    this.resetLocals()
    return blob
  }

  resetLocals(): void {
    this.loading = false
    this.chunks = []
    this.received = 0
    this.controller = new AbortController()
    this.fileName = ''
    this.contentType = ''
  }

  cancel(): void {
    this.resetLocals()
    this.controller.abort()
  }
}

export default DownloadService

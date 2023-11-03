export const bufferToFile = (
  buffer: Uint8Array | ArrayBuffer,
  fileName: string,
  fileType: string
) => {
  try {
    const blob = new Blob([buffer], { type: fileType })
    return new File([blob], fileName, { type: fileType })
  } catch (err) {
    console.error(err)
  }
}

export const blobToUrl = (buf: ArrayBuffer, mimeType: string) => {
  const blob = new Blob([buf], { type: mimeType })
  return URL.createObjectURL(blob)
}

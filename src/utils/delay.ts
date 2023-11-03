const delay = <T>(ms: number): Promise<T> =>
  new Promise((resolve) => setTimeout(resolve, ms))
export default delay

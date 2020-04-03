// 添加历史记录
export function pushHistory(obj, list, max) {
  const newList = [obj]
  const m = Math.min(max - 1, list.length)
  for (let i = 0; i < m; i++) {
    if (list[i].value !== obj.value) newList.push(list[i])
  }
  return newList
}

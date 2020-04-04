// 把从bgm趴下来的信息换成md数据
export function info2markdown(info) {
  const json = info.json
  const ext = info.info.ext
  const markdown = `## 作品信息\n共${json.chapters}话<br>${extText(ext)}[bgm介绍页面](http://bgm.tv/subject/${json.bgmID})\n## 作品简介\n${json.intro}`
  return markdown
}
function keyText(key, data) {
  switch (key) {
    case '监督':
    case '导演':
    case '原作':
    case '系列构成':
    case '人物原案':
    case '人物设定':
    case '动画制作':
      return `${key}：${data}<br>`
    case '官方网站':
      return `[${key}](${data})<br>`
    default:
      break
  }
  return ''
}
function extText(ext) {
  let text = ''
  for (const key in ext) {
    text += keyText(key, ext[key])
  }
  return text
}

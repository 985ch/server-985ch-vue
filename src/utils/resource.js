// 把从bgm趴下来的信息换成md数据
export function info2markdown(data) {
  const json = data.json
  const info = data.info
  const markdown = `## 作品信息\n共${json.chapters}话\n${extText(info)}[bgm介绍页面](http://bgm.tv/subject/${json.bgmID})\n## 作品简介\n${json.intro}`
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
      return `${key}：${data.join('，')}\n`
    case '官方网站':
      return `[${key}](${data.join('，')})\n`
    default:
      break
  }
  return ''
}
function extText(info) {
  let text = ''
  for (const key in info) {
    text += keyText(key, info[key])
  }
  return text
}

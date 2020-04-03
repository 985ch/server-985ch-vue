import pako from 'pako'

// 一个是解密
function unzipBase64(encodedData) {
  // base64解码
  const decodedData = window.atob(encodedData)
  // 字符串转数组 在循环返回一个 Unicode表所在位置的新数组
  const data = pako.inflate(decodedData)
  // 接受 Unicode 值，然后返回字符串。
  return Utf8ArrayToStr(data)
}

function Utf8ArrayToStr(array) {
  var out, i, len, c
  var char2, char3

  out = ''
  len = array.length
  i = 0
  while (i < len) {
    c = array[i++]
    switch (c >> 4) {
      case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
        // 0xxxxxxx
        out += String.fromCharCode(c)
        break
      case 12: case 13:
        // 110x xxxx 10xx xxxx
        char2 = array[i++]
        out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F))
        break
      case 14:
        // 1110 xxxx 10xx xxxx 10xx xxxx
        char2 = array[i++]
        char3 = array[i++]
        out += String.fromCharCode(((c & 0x0F) << 12) | ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0))
        break
    }
  }

  return out
}
export {
  unzipBase64
}
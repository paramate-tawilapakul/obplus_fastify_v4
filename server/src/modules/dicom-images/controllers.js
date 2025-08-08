const fs = require('graceful-fs')
// const base64Img = require('base64-img')

const imageService = require('./services')
const { responseData, handleErrorLog } = require('../../utils/utils')

const readFile = fs.promises.readFile

const fileModule = 'dicom-images > controllers >'

exports.getDicomImage = async (req, res) => {
  const data = await imageService.getDicomImage(req)

  return responseData(res, data)
}

exports.getAttachFile = async (req, res) => {
  try {
    const { fileName } = req.query
    const dir = process.env.IMAGES_PATH

    const fullpath = `${dir}/${fileName}`

    const map = {
      '.png': 'image/png',
      '.PNG': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.JPG': 'image/jpeg',
      '.JPEG': 'image/jpeg',
      '.gif': 'image/gif',
      '.GIF': 'image/gif',
      '.pdf': 'application/pdf',
      '.PDF': 'application/pdf',
      '.json': 'application/json',
      '.txt': 'text/plain',
      '.TXT': 'text/plain',
    }

    const ext = '.' + fullpath.split('.').pop()

    if (!map[ext]) return res.send(ext + ', file type not support')

    // read file from file system
    const data = await readFile(fullpath)

    if (!data) {
      return res.code(500).send(`Error`)
    }

    res.header(
      'Content-type',
      ext === '.txt' || ext === '.json'
        ? map[ext] + '; charset=utf-8'
        : map[ext]
    )
    res.send(data)
  } catch (error) {
    handleErrorLog(`${fileModule} getAttachFile(): ${error}`)
    res.code(500).send(error.message)
  }
}

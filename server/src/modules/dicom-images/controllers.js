const fs = require('graceful-fs')
// const base64Img = require('base64-img')

const imageService = require('./services')
const { Logger, logFormat } = require('../../logger')
const { responseData } = require('../../utils/utils')

const readFile = fs.promises.readFile

exports.getDicomImage = async (req, res) => {
  try {
    const data = await imageService.getDicomImage(req)

    responseData(res, data)
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
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
    console.error(error)
    Logger('error').error(logFormat(null, error))
    res.code(500).send(error.message)
  }
}

const fs = require('graceful-fs')
const sharp = require('sharp')
const dayjs = require('dayjs')
const { promisify } = require('node:util')
const { pipeline } = require('node:stream/promises')

const { responseData, mkEFWPath, handleErrorLog } = require('../../utils/utils')
const { mkImagePath, genImageArr } = require('../../utils/utils')
const db = require('../../db/setup')
const { getImages, deleteImage } = require('../dicom-images/services')

const exists = promisify(fs.exists)
const readFile = fs.promises.readFile
const unlink = fs.promises.unlink
const copyFile = fs.promises.copyFile

const fileModule = 'files > controllers >'

exports.sortImages = async req => {
  try {
    const trx = await db.transaction()

    // console.log(req.body)
    // console.log(req.query.accession)

    for (const item of req.body) {
      await trx('RIS_IMAGE_REPORT')
        .where('IMG_SYS_ID', item.id)
        .andWhere('IM_ACC', req.query.accession)
        .update({ SORT_ORDERING: item.sortOrdering })
    }

    await trx.commit()

    return true
  } catch (error) {
    handleErrorLog(`${fileModule} sortImages(): ${error}`, req)
  }
}

exports.updateColumn = async (req, res) => {
  try {
    const { accession, cols } = req.body

    await db('RIS_IMAGE_REPORT').where({ IM_ACC: accession }).update({
      NO_OF_COLUMN: cols,
    })

    // /api/files/view?name=&accession

    return responseData(res, {
      result: 'success',
    })
  } catch (error) {
    handleErrorLog(`${fileModule} updateColumn(): ${error}`)
  }
}

exports.getImages = async (req, res) => {
  const response = await getImages(req.query.accession)

  // /api/files/view?name=&accession

  return responseData(res, {
    imgs: genImageArr(
      response.map(r => ({ id: r.id, name: r.name, cols: r.cols })),
      req.query.accession
    ),
  })
}

exports.deleteImage = async (req, res) => {
  try {
    await deleteImage(req)
    const { accession, name } = req.query
    let path = `${process.env.IMAGES_PATH}/${accession}/${name}`
    let isExist = await exists(path)
    if (isExist) {
      await unlink(path)
    }

    const response = await getImages(accession)
    return responseData(res, {
      imgs: genImageArr(
        response.map(r => ({ id: r.id, name: r.name, cols: r.cols })),
        req.query.accession
      ),
    })
  } catch (error) {
    handleErrorLog(`${fileModule} deleteImage(): ${error}`)
    res.code(500).send(error.message)
  }
}

exports.view = async (req, res) => {
  try {
    const { name, accession } = req.query

    let dir = `${process.env.IMAGES_PATH}/${accession}`
    const oldOBdir = process.env.OLD_VERSION_IMAGES_PATH

    let isExist = await exists(oldOBdir + '/' + name)
    if (isExist) {
      dir = oldOBdir
    }

    // isExist = await exists(dir)
    // if (!isExist) {
    //   res
    //     .code(404)
    //     .send(`Directory: '${dir.replace(/\\\\/g, '/')}' not found!`)
    //   return
    // }

    const fullpath = `${dir}/${name}`
    // isExist = await exists(fullpath)
    // if (!isExist) {
    //   res
    //     .code(404)
    //     .send(`File: '${fullpath.replace(/\\\\/g, '/')}' not found!`)
    //   return
    // }

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
      '.svg': 'image/svg+xml',
    }

    const ext = '.' + fullpath.split('.').pop()

    if (!map[ext]) return res.send(ext + ', file type not support')

    // read file from file system
    const data = await readFile(fullpath)

    res.header(
      'Content-type',
      ext === '.txt' || ext === '.json'
        ? map[ext] + '; charset=utf-8'
        : map[ext]
    )
    res.send(data)
  } catch (error) {
    handleErrorLog(`${fileModule} view(): ${error}`)
    res.code(500).send(error.message)
  }
}

exports.uploadDicom = async (req, res) => {
  try {
    const { accession, hn, files, cols } = req.body
    const date = dayjs().format('YYYYMMDDHHmmss')

    let imgsReturn = []
    let previousImages = await getImages(accession)
    previousImages.forEach(image =>
      imgsReturn.push({ name: image.name, cols, id: image.id })
    )
    await mkImagePath(accession)
    const uploadPath = `${process.env.IMAGES_PATH}/${accession}/`
    const dicomPath = `${process.env.IMAGES_PATH}/${accession}/dicom/`

    let [maxOrdering] = await db('RIS_IMAGE_REPORT')
      .select()
      .column({
        sortOrdering: 'SORT_ORDERING',
      })
      .where('IM_ACC', accession)
      .orderBy('sort_ordering', 'desc')

    if (!maxOrdering) maxOrdering = 1
    else maxOrdering = maxOrdering.sortOrdering + 1

    let name
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      // console.log(file.name)
      name = `${date}_${file}`

      await copyFile(`${dicomPath}${file}`, `${uploadPath}${name}`)

      let [result] = await db('RIS_IMAGE_REPORT')
        .insert({
          IM_ACC: accession,
          IM_HN: hn,
          IM_URL_PATH: name,
          NO_OF_COLUMN: cols || '2',
          SORT_ORDERING: maxOrdering++,
        })
        .returning('IMG_SYS_ID')

      // console.log('result', result)

      imgsReturn.push({ name, cols, id: result.IMG_SYS_ID })
    }

    return responseData(res, { imgs: genImageArr(imgsReturn, accession) })
  } catch (error) {
    handleErrorLog(`${fileModule} uploadDicom(): ${error}`)
  }
}

exports.upload = async (req, res) => {
  try {
    const { accession, hn, cols } = req.query

    // return responseData(res, { imgs: [] })

    const date = dayjs().format('YYYYMMDDHHmmss')
    // console.log(date)
    // const year = date.substring(0, 4)
    // const month = date.substring(4, 6)
    // const day = date.substring(6, 8)

    let imgsReturn = []
    let previousImages = await getImages(accession)
    previousImages.forEach(image =>
      imgsReturn.push({ id: image.id, name: image.name, cols })
    )

    await mkImagePath(accession)
    // const uploadPath = `${process.env.IMAGES_PATH}/${year}/${month}/${day}/`

    const data = await req.file()
    let name = `${date}_0_${data.filename}`
    await pipeline(
      data.file,
      fs.createWriteStream(`${process.env.IMAGES_PATH}/${accession}/${name}`)
    )

    let [maxOrdering] = await db('RIS_IMAGE_REPORT')
      .select()
      .column({
        sortOrdering: 'SORT_ORDERING',
      })
      .where('IM_ACC', accession)
      .orderBy('sort_ordering', 'desc')

    if (!maxOrdering) maxOrdering = 1
    else maxOrdering = maxOrdering.sortOrdering + 1

    const [result] = await db('RIS_IMAGE_REPORT')
      .insert({
        IM_ACC: accession,
        IM_HN: hn,
        IM_URL_PATH: name,
        NO_OF_COLUMN: cols || '2',
        SORT_ORDERING: maxOrdering++,
      })
      .returning('IMG_SYS_ID')

    imgsReturn.push({ id: result.IMG_SYS_ID, name, cols })

    return responseData(res, { imgs: genImageArr(imgsReturn, accession) })
  } catch (error) {
    handleErrorLog(`${fileModule} upload(): ${error}`)
  }
}

exports.uploadEFW = async (req, res) => {
  try {
    const { accession, fetusNo, dataUrl } = req.body
    // const { file } = req.files

    await mkEFWPath(accession, fetusNo)
    const uploadPath = `${process.env.IMAGES_PATH}/efw/${accession}/${fetusNo}/`

    let name = `efw.jpg`
    const regex = /^data:.+\/(.+);base64,(.*)$/
    let matches = dataUrl.match(regex)
    // let ext = matches[1]
    let data = matches[2]

    sharp(Buffer.from(data, 'base64'))
      .resize(750)
      .toFile(uploadPath + name, async err => {
        if (err) return console.log(err)
      })

    return responseData(res, {
      src: `/api/v1/files/efw?accession=${accession}&fetusNo=${fetusNo}&r=${Math.random()}`,
    })
  } catch (error) {
    handleErrorLog(`${fileModule} uploadEfw(): ${error}`)
  }
}

exports.deleteEFW = async (req, res) => {
  try {
    const { accession, fetusNo } = req.query

    const removePath = `${process.env.IMAGES_PATH}/efw/${accession}/${fetusNo}/efw.jpg`

    // ERROR: EBUSY: resource busy or locked,unlink
    let isExist = await exists(removePath)
    if (isExist) {
      await unlink(removePath)
    }

    return responseData(res, { success: true })
  } catch (error) {
    handleErrorLog(`${fileModule} deleteEfw(): ${error}`)
    return responseData(res, { success: false, msg: error.message })
  }
}

exports.viewEfw = async (req, res) => {
  try {
    const { accession, fetusNo } = req.query

    let dir = `${process.env.IMAGES_PATH}/efw/${accession}/${fetusNo}`

    const fullpath = `${dir}/efw.jpg`

    const map = {
      '.png': 'image/png',
      '.PNG': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.JPG': 'image/jpeg',
      '.JPEG': 'image/jpeg',
    }

    const ext = '.' + fullpath.split('.').pop()

    if (!map[ext]) return res.send(ext + ', file type not support')

    // read file from file system
    const data = await readFile(fullpath)

    res.header(
      'Content-type',
      ext === '.txt' || ext === '.json'
        ? map[ext] + '; charset=utf-8'
        : map[ext]
    )
    res.send(data)
  } catch (error) {
    handleErrorLog(`${fileModule} viewEfw(): ${error}`)
    res.code(500).send(error.message)
  }
}

exports.viewBackupPdf = async (req, res) => {
  // console.log('view from backup')
  try {
    const { accession } = req.query

    const data = await db('OB_REPORT')
      .column({
        reportUpdateDate: 'REPORT_UPDATE_DATE',
      })
      .where('ACCESSION', accession)
      .limit(1)
      .orderBy('REPORT_ID')

    // console.log(data)

    if (data.length === 0) {
      return res.send({ hasBackup: false })
    }

    let reportUpdateDate = data[0].reportUpdateDate

    const year = reportUpdateDate.substring(0, 4)
    const month = reportUpdateDate.substring(4, 6)
    const day = reportUpdateDate.substring(6, 8)

    const filename = `${accession}.pdf`
    const fullpath = `${process.env.PDF_BACKUP_PATH}/${year}/${month}/${day}/${filename}`

    let isExist = await exists(fullpath)
    if (!isExist) {
      return res.send({ hasBackup: false })
    }

    res.send({
      url: `/api/v1/report/view?accession=${accession}&reportUpdateDate=${reportUpdateDate}`,
      hasBackup: true,
    })

    // fs.readFile(fullpath, (err, data) => {
    //   if (err) {
    //     res.code(500).send(`${err}`)
    //   } else {
    //     res.send({
    //       base64: Buffer.from(data).toString('base64'),
    //       url: `/api/v1/report/view?accession=${accession}&reportUpdateDate=${reportUpdateDate}`,
    //       hasBackup: true,
    //     })
    //   }
    // })
  } catch (error) {
    handleErrorLog(`${fileModule} viewBackupPdf(): ${error}`)
  }
}

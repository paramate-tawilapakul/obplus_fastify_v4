const fs = require('graceful-fs')
const { Readable } = require('node:stream')
const { pipeline } = require('node:stream/promises')
const { promisify } = require('node:util')

const { Logger, logFormat } = require('../../logger')
const { reformatPath, mkPdfBackupPath } = require('../../utils/utils')
const { getSyspropsValue } = require('../../cache/cache')

const exists = promisify(fs.exists)
// const writeFile = fs.promises.writeFile
const mkdir = fs.promises.mkdir

exports.createPdf = async req => {
  try {
    const { pdfBuffer, bodyData } = req.body
    // let message = ''
    const { hn, accession, timestamp, unofficial } = bodyData

    let year, month, day

    year = timestamp.substring(0, 4)
    month = timestamp.substring(4, 6)
    day = timestamp.substring(6, 8)

    await mkPdfBackupPath(year, month, day)

    const backupPdf = `${process.env.PDF_BACKUP_PATH}/${year}/${month}/${day}/${accession}.pdf`

    // await writeFile(backupPdf, Buffer.from(pdfBuffer, 'utf-8'))

    // memory optimization
    const writeStream = fs.createWriteStream(backupPdf, { encoding: 'utf-8' })
    // const nodeReadStream = Readable.from(Buffer.from(pdfBuffer, 'utf-8'))
    await pipeline(Readable.from(Buffer.from(pdfBuffer, 'utf-8')), writeStream)

    console.log('create PDF backup succesfully')

    if ((await getSyspropsValue('storePdfService')) === 'enable') {
      let pdfPath = ''
      if (unofficial === 'yes') {
        //prelim
        pdfPath = reformatPath(await getSyspropsValue('unofficialResultPath'))
      } else {
        //verify
        if (process.env.NODE_ENV === 'production') {
          pdfPath = reformatPath(await getSyspropsValue('uniwebResultPath'))
        }
      }

      if (pdfPath) {
        let isExist = await exists(pdfPath)
        if (!isExist) await mkdir(pdfPath, { recursive: true })

        const pacsPdf = `${pdfPath}/${timestamp}$${hn}$${accession}.pdf`
        const writeStream = fs.createWriteStream(pacsPdf, { encoding: 'utf-8' })
        await pipeline(
          Readable.from(Buffer.from(pdfBuffer, 'utf-8')),
          writeStream
        )

        console.log('pdfPath', pdfPath)
        console.log('create PDF succesfully')
      }
    }

    // Logger().info(logFormat(req, message))
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

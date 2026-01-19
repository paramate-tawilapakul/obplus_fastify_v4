const fs = require('graceful-fs')
const axios = require('axios')

const dbDicom = require('../../db/setup-dicom')
const dbRis = require('../../db/setup')
const {
  mkImageDicomPath,
  removeDir,
  handleErrorLog,
} = require('../../utils/utils')
const { getSyspropsValue } = require('../../cache/cache')

const { promisify } = require('node:util')
const exists = promisify(fs.exists)
const readdir = fs.promises.readdir

const fileModule = 'dicom-images > services >'

exports.getImages = async accession => {
  try {
    return await dbRis('RIS_IMAGE_REPORT')
      .columns({
        id: 'IMG_SYS_ID',
        name: 'IM_URL_PATH',
        cols: 'NO_OF_COLUMN',
        // sortOrdering: 'SORT_ORDERING',
      })
      .where('IM_ACC', accession)
      .orderBy('SORT_ORDERING')
      .orderBy('IMG_SYS_ID')
  } catch (error) {
    handleErrorLog(`${fileModule} getImages(): ${error}`)
    return false
  }
}

exports.deleteImage = async req => {
  try {
    const { accession, name } = req.query
    // console.log(accession)
    await dbRis('RIS_IMAGE_REPORT')
      .where('IM_ACC', accession)
      .andWhere('IM_URL_PATH', name)
      .del()

    return true
  } catch (error) {
    handleErrorLog(`${fileModule} deleteImage(): ${error}`)
    return false
  }
}

exports.getDicomImage = async req => {
  try {
    //uniweb_address  http://192.168.151.111/DicomWeb/
    const uniwebAddress = await getSyspropsValue('uniwebAddress')
    const dicomWeb =
      'DicomWeb.dll/WADO?requestType=WADO&user=1&password=1&objectUID='

    const { accession } = req.query
    const isReload = req.query.isReload === 'true'
    const dicomPath = `${process.env.IMAGES_PATH}/${accession}/dicom`

    let newData = []
    let no = 0
    let isExist
    if (process.env.SAMPLE_IMAGE === 'YES') {
      await addTempAccession(accession)

      isExist = await exists(dicomPath)
      if (isExist && !isReload) {
        console.log('GET IMAGES FROM EXISTING DIR')
        let name, url
        let dicomDir = await readdir(dicomPath)
        dicomDir.forEach(() => {
          ++no
          // console.log(`${dicomPath}/${f}`)
          name = `${no}_dicom.jpg`
          url = `/api/v1/dicom-image/view?fileName=${no}.jpg`
          newData.push({
            no,
            url,
            name,
            selected: false,
          })
        })
      } else {
        console.log('GET NEW IMAGES')

        if (isReload) await removeDir(dicomPath)

        await mkImageDicomPath(accession)
        let name, url
        for (let i = 0; i < 4; i++) {
          ++no
          name = `${no}_dicom.jpg`
          // let url = `http://localhost:${process.env.SERVER_PORT}/api/v1/dicom-image/view?fileName=${no}.jpg`
          url = `/api/v1/dicom-image/view?fileName=${no}.jpg`
          newData.push({
            no,
            url,
            name,
            selected: false,
          })
          // console.log(newData)
          await downloadFiles(
            `http://localhost:${process.env.SERVER_PORT}${url}`,
            `${process.env.IMAGES_PATH}/${accession}/dicom/${name}`
          )
        }
      }
    } else {
      let sql = `
      SELECT instance_uid FROM study1
      INNER JOIN series1 ON series1.study_uid_id = study1.study_uid_id
      INNER JOIN image1  ON series1.series_uid_id = image1.series_uid_id
      INNER JOIN patient1 ON study1.ptn_id_id = patient1.ptn_id_id
      WHERE n_rows <> '' AND accession_number = '${accession}'  
      ORDER BY image1.pr_time asc
      `
      const data = await dbDicom.raw(sql)
      const imgSize = process.env.IMAGE_SIZE?.split('x') || [400, 300]

      isExist = await exists(dicomPath)
      if (isExist && !isReload) {
        console.log('GET IMAGES FROM EXISTING DIR')
        if (data.length > 0) {
          let name, url
          let dicomDir = await readdir(dicomPath)
          dicomDir.forEach((f, i) => {
            ++no
            // console.log(`${dicomPath}/${f}`)
            name = `${no}_dicom.jpg`
            url = `${uniwebAddress}${dicomWeb}${data[i].instance_uid}&contentType=image/jpeg&columns=${imgSize[0]}&rows=${imgSize[1]}&imageQuality=75&objectSessionKey=`

            newData.push({
              no,
              url,
              name,
              selected: false,
            })
          })
        }
      } else {
        console.log('GET NEW IMAGES')

        if (isReload) await removeDir(dicomPath)

        await mkImageDicomPath(accession)

        // console.log(sql)
        // console.log('instance_uid:', data)

        if (data.length > 0) {
          await addTempAccession(accession)
          let name, url
          for (let i = 0; i < data.length; i++) {
            ++no
            name = `${no}_dicom.jpg`
            // const url = `${uniwebAddress}${dicomWeb}${d.instance_uid}&contentType=image/jpeg&columns=400&rows=300&imageQuality=75&objectSessionKey=`
            url = `${uniwebAddress}${dicomWeb}${data[i].instance_uid}&contentType=image/jpeg&columns=${imgSize[0]}&rows=${imgSize[1]}&imageQuality=75&objectSessionKey=`

            newData.push({
              no,
              url,
              name,
              selected: false,
            })

            await downloadFiles(
              url,
              `${process.env.IMAGES_PATH}/${accession}/dicom/${name}`
            )
          }
        }
      }
    }
    // console.log('Images:', newData)
    return newData
  } catch (error) {
    handleErrorLog(`${fileModule} getDicomImage(): ${error}`)
  }
}

async function downloadFiles(url, path) {
  try {
    const response = await axios({
      method: 'get',
      url,
      responseType: 'stream',
    })

    response.data.pipe(fs.createWriteStream(path))
    // response.data.on('error', err => {
    //   console.error(err)
    //   handleErrorLog(`${fileModule} downloadFiles(): ${error}`)
    // })
  } catch (error) {
    handleErrorLog(`${fileModule} downloadFiles(): ${error}`)
  }
}

async function addTempAccession(accession) {
  try {
    await dbRis.raw(`
    BEGIN
      IF NOT EXISTS (SELECT accession FROM OB_TEMPORARY_ACCESSION 
                      WHERE accession = '${accession}')
      BEGIN
          INSERT INTO OB_TEMPORARY_ACCESSION (accession)
          VALUES ('${accession}')
      END
    END
    `)
  } catch (error) {
    handleErrorLog(`${fileModule} addTempAccession(): ${error}`)
  }
}

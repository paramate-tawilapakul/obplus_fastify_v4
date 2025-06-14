const db = require('../../db/config')
const { Logger, logFormat } = require('../../logger')

exports.getTeachingFolder = async req => {
  try {
    const userId = req.user.code

    let { folderName } = req.query

    const data = await db
      .select()
      // .column({ name: 'SYS_PROPERTY' }, { value: 'SYS_VALUE' })
      .from('RIS_TEACHING_FOLDERS')
      .where('FOLDER_USER_ID', folderName === 'Public' ? folderName : userId)
      .andWhere('FOLDER_STATUS', '<>', 'H')

    return [data, data.length]
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.createTeachingFolder = async req => {
  try {
    const userId = req.user.code
    const { folderName, parentId, parent } = req.body

    const data = await db('RIS_TEACHING_FOLDERS').insert(
      {
        PARENT_ID: parentId,
        FOLDER_NAME: folderName,
        FOLDER_STATUS: 'S',
        FOLDER_USER_ID: parent === 'Public' ? parent : userId,
      },
      '*',
      { includeTriggerModifications: true }
    )

    return data
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.updateTeachingFolder = async req => {
  try {
    const { folderName, id } = req.body

    await db('RIS_TEACHING_FOLDERS').where({ FOLDER_ID: id }).update({
      FOLDER_NAME: folderName,
    })

    return true
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.deleteTeachingFolder = async req => {
  try {
    const { id } = req.query

    await Promise.all([
      db('RIS_TEACHING_FOLDERS')
        .where({ FOLDER_ID: id || '' })
        .orWhere({ PARENT_ID: id || '' })
        .del(),

      db('RIS_TEACHING_FILES').where({ FOLDER_ID: id }).del(),
    ])

    return true
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.createTeachingFiles = async req => {
  try {
    const { accessions, note, folderId } = req.body

    const accToAdd = []

    for (let i = 0; i < accessions.length; i++) {
      const [, length] = await getTeachingFilesByAccession(
        folderId,
        accessions[i]
      )
      if (length === 0) {
        accToAdd.push(accessions[i])
      }
    }

    for (let i = 0; i < accToAdd.length; i++) {
      await db('RIS_TEACHING_FILES').insert({
        FOLDER_ID: folderId,
        FILE_ORDER_ID: accToAdd[i],
        NOTE: note,
      })
    }

    return true
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.getTeachingFiles = async req => {
  try {
    let { folderId } = req.query

    const data = await db
      .select()
      .column(
        { id: 'FILE_ID' },
        { folderId: 'FOLDER_ID' },
        { accession: 'FILE_ORDER_ID' },
        { note: 'NOTE' }
      )
      .from('RIS_TEACHING_FILES')
      .where('FOLDER_ID', folderId || '')
      .orderBy('FILE_ID', 'asc')

    return [data, data.length]
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

async function getTeachingFilesByAccession(folderId, accession) {
  try {
    const data = await db
      .select()
      .column(
        { id: 'FILE_ID' },
        { folderId: 'FOLDER_ID' },
        { accession: 'FILE_ORDER_ID' },
        { note: 'NOTE' }
      )
      .from('RIS_TEACHING_FILES')
      .where('FOLDER_ID', folderId)
      .andWhere('FILE_ORDER_ID', accession)

    return [data, data.length]
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.updateTeachingNote = async req => {
  try {
    const { note, id } = req.body

    await db('RIS_TEACHING_FILES').where({ FILE_ID: id }).update({
      NOTE: note,
    })

    return true
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.updateTeachingNoteById = async req => {
  try {
    const { note, fileId } = req.body

    await db('RIS_TEACHING_FILES').where({ FILE_ID: fileId }).update({
      NOTE: note,
    })

    return true
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.moveTeachingfiles = async req => {
  try {
    const { fileId, folderId } = req.body

    await db('RIS_TEACHING_FILES').where({ FILE_ID: fileId }).update({
      FOLDER_ID: folderId,
    })

    return true
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

exports.deleteTeachingFiles = async req => {
  try {
    const { fileId } = req.query

    await db('RIS_TEACHING_FILES').where({ FILE_ID: fileId }).del()

    return true
  } catch (error) {
    console.error(error)
    Logger('error').error(logFormat(null, error))
  }
}

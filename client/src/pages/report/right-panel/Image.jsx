import { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { FileUploader } from 'react-drag-drop-files'
import Lightbox from 'yet-another-react-lightbox'
import { Zoom, Thumbnails, Counter } from 'yet-another-react-lightbox/plugins'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Fade from '@mui/material/Fade'
import IconButton from '@mui/material/IconButton'
import RefreshIcon from '@mui/icons-material/Refresh'
import Checkbox from '@mui/material/Checkbox'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import Divider from '@mui/material/Divider'
import CloseIcon from '@mui/icons-material/Close'
import Button from '@mui/material/Button'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'
import ButtonGroup from '@mui/material/ButtonGroup'
import LoadingButton from '@mui/lab/LoadingButton'
import ChecklistIcon from '@mui/icons-material/Checklist'
import CheckIcon from '@mui/icons-material/Check'

import { API } from '../../../config'
import {
  dialogTitleStyle,
  btStyle,
} from '../../../components/page-tools/form-style'
import { getHost } from '../../../utils'
import DataContext from '../../../context/data/dataContext'
import { red, cyan } from '@mui/material/colors'
import SkeletonLoading from '../../../components/page-tools/SkeletonLoading'

const imageBorderColor = theme => {
  if (theme === 'dark') return { default: cyan[400], selected: cyan[800] }

  // return { default: blue[200], selected: blue[300] }
  return { default: cyan[400], selected: cyan[400] }
}

// const colorStyle = theme =>
//   theme.palette.mode === 'dark' ? '#90CAF9' : '#1976D2'

const width = 1010

const fileTypes = ['jpg', 'jpeg', 'png']

const Image = ({ patient }) => {
  const { systemProperties } = useContext(DataContext)
  const [dicomImages, setDicomImages] = useState([])
  const [images, setImages] = useState([])
  const [dicomNo, setDicomNo] = useState([])
  const [photoIndex, setPhotoIndex] = useState(0)
  const [isOpenLightBox, setIsOpenLightBox] = useState(false)
  const [loading, setLoading] = useState(false)
  const [openDicomImage, setOpenDicomImage] = useState(false)
  const [dicomImageSelected, setDicomImageSelected] = useState([])
  // const [files, setFiles] = useState(null)
  const [imageColumn, setImageColumn] = useState('2')

  const host = getHost(systemProperties)

  function tranformDicomNo(imgs) {
    return imgs.map(n => {
      let dicom_no = n.name?.split('_')[1] || ''
      if (dicom_no) {
        return parseInt(dicom_no)
      }
      return 0
    })
  }

  useEffect(() => {
    getDicomImage()
    getImage()

    return () => {}
    // eslint-disable-next-line
  }, [])

  function handleClose() {
    setOpenDicomImage(false)
    setDicomImageSelected([])
    setDicomImages(prev => {
      return prev.map(t => ({ ...t, selected: false }))
    })
  }

  async function getImage() {
    try {
      let res = await axios.get(API.IMAGES, {
        params: {
          accession: patient.accession,
        },
      })
      let imgs = res.data.data.imgs

      if (imgs.length > 0) {
        setImageColumn(imgs[0]?.cols || '2')
      }

      setImages(imgs)
      setDicomNo(tranformDicomNo(imgs))
    } catch (error) {
      console.log(error)
    }
  }

  async function getDicomImage(isReload = false) {
    setLoading(true)

    try {
      let res = await axios.get(API.DICOM_IMAGE, {
        params: {
          accession: patient.accession,
          isReload,
        },
      })

      setDicomImages(res.data.data)
      setLoading(false)
    } catch (error) {
      console.log(error)
    }
  }

  async function handleRemoveImage(name) {
    try {
      let res = await axios.delete(API.IMAGES, {
        params: { name, accession: patient.accession },
      })

      setImages(res.data.data.imgs)
      setDicomNo(tranformDicomNo(res.data.data.imgs))
    } catch (error) {
      console.log(error)
    }
  }

  async function handleUpload(files) {
    const form = new FormData()
    // console.log(files)
    // for (let i = 0; i < files.length; i++) {
    //   form.append('file', files[i], files[i].name)
    // }
    // console.log(files)

    form.append('file', files, files.name)

    // form.append('accession', patient.accession)
    // form.append('hn', patient.hn)
    // form.append('cols', imageColumn)

    const res = await axios.post(API.UPLOAD, form, {
      params: {
        accession: patient.accession,
        hn: patient.hn,
        cols: imageColumn,
      },
      headers: {
        'content-type': `multipart/form-data; boundary=${form._boundary}`,
      },
    })

    return res
  }

  async function handleChangeFormFiles(files) {
    try {
      const res = await handleUpload(files)

      setImages(res.data.data.imgs)
      setDicomNo(tranformDicomNo(res.data.data.imgs))
    } catch (error) {
      console.log(error)
    }
  }

  async function handleSelectDicomImage() {
    try {
      setOpenDicomImage(false)
      // console.log(dicomImageSelected)
      const files = dicomImageSelected.map(file => file.name)
      // console.log(files)
      // return
      if (files.length > 0) {
        let res = await axios.post(API.UPLOAD_DICOM, {
          files,
          hn: patient.hn,
          accession: patient.accession,
          cols: imageColumn,
        })
        setImages(res.data.data.imgs)
        setDicomNo(tranformDicomNo(res.data.data.imgs))
      }

      setDicomImages(prev => {
        return prev.map(t => ({ ...t, selected: false }))
      })

      setDicomImageSelected([])
    } catch (error) {
      console.log(error)
    }
  }

  async function handleSelectAllDicomImage() {
    try {
      setOpenDicomImage(false)

      let files = []
      if (dicomNo.length > 0) {
        files = dicomImages
          .filter(file => !dicomNo.includes(file.no))
          .map(file => file.name)
      } else {
        files = dicomImages.map(file => file.name)
      }

      if (files.length > 0) {
        let res = await axios.post(API.UPLOAD_DICOM, {
          files,
          hn: patient.hn,
          accession: patient.accession,
          cols: imageColumn,
        })
        setImages(res.data.data.imgs)
        setDicomNo(tranformDicomNo(res.data.data.imgs))
      }

      setDicomImageSelected([])
    } catch (error) {
      console.log(error)
    }
  }

  function genDicomImageText() {
    let text = ''
    text += dicomImages?.length > 0 ? '(' + dicomImages.length + ') ' : ''
    text += 'Dicom Image'
    text += dicomImages?.length > 1 ? 's' : ''

    return text
  }

  // function handleReOrder(arr, direction, index) {
  //   let newArray = []
  //   if (direction === '+') {
  //     newArray = swapElements([...arr], index, index + 1)
  //   } else {
  //     newArray = swapElements([...arr], index, index - 1)
  //   }

  //   // saveToLocalStorage(newArray)
  //   setDicomImages(newArray)
  // }

  // function saveToLocalStorage(arr) {
  //   let onlySelectedArr = arr.filter(n => n.selected)

  // const swapElements = (arr, pos1, pos2) => {
  //   const temp = arr[pos1]
  //   arr[pos1] = arr[pos2]
  //   arr[pos2] = temp

  //   return arr
  // }

  function handleImageColumnChange(value) {
    setImageColumn(value)
    axios.post(API.UPDATE_COLUMN, {
      accession: patient.accession,
      cols: value,
    })
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ marginTop: 2, display: 'flex' }}>
          {/* <h3>Drag & Drop Files</h3> */}
          <FileUploader
            // multiple={true}
            handleChange={handleChangeFormFiles}
            name='files'
            types={fileTypes}
            // children={<div><p>this is inside drop area</p></div>}
          />
          {/* <p>{files?.length > 0 ? files.length + `${files.length === 1 ? ' File' : ' Files'} uploaded` : 'No file upload'}</p> */}
          <LoadingButton
            loading={loading}
            variant='contained'
            sx={{ ...btStyle, ml: 1, height: 47 }}
            onClick={async () => {
              // await getDicomImage()
              setOpenDicomImage(true)
            }}
          >
            {genDicomImageText()}
          </LoadingButton>
        </div>
        {dicomImages.length > 0 && (
          <Box
            sx={{ display: 'flex', alignItems: 'center', columnGap: 1, mr: 1 }}
          >
            <ButtonGroup disableRipple>
              <Button
                onClick={() => handleImageColumnChange('1')}
                variant={imageColumn === '1' ? 'contained' : 'outlined'}
              >
                1
              </Button>
              <Button
                onClick={() => handleImageColumnChange('2')}
                variant={imageColumn === '2' ? 'contained' : 'outlined'}
              >
                2
              </Button>
            </ButtonGroup>
            <div>Column{imageColumn === '2' && 's'}</div>
          </Box>
        )}
        {/* <FormControl>
          <RadioGroup row>
            <FormControlLabel
              value='1'
              control={
                <Radio
                  checked={imageColumn === '1'}
                  onChange={handleImageColumnChange}
                />
              }
              label='1 Column'
            />
            <FormControlLabel
              value='2'
              control={
                <Radio
                  checked={imageColumn === '2'}
                  onChange={handleImageColumnChange}
                />
              }
              label='2 Columns'
            />
          </RadioGroup>
        </FormControl> */}
      </div>

      <Lightbox
        open={isOpenLightBox}
        close={() => setIsOpenLightBox(false)}
        slides={images}
        index={photoIndex}
        plugins={[Zoom, Thumbnails, Counter]}
      />

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          width: imageColumn === '1' ? 500 : 810,
          gap: 6,
          marginTop: 8,
        }}
      >
        {images.map((img, i) => {
          return (
            <Box
              key={i}
              sx={{
                border: `2px solid`,
                borderColor: theme =>
                  img.selected
                    ? imageBorderColor(theme.palette.mode).selected
                    : imageBorderColor(theme.palette.mode).default,

                borderRadius: 1.5,
                p: 0.5,
                display: 'flex',
                flexDirection: 'column',
                // alignItems: 'flex-end',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ marginTop: '-3px' }}>{i + 1}</div>
                <RemoveCircleIcon
                  onClick={() => handleRemoveImage(img.name)}
                  titleAccess='Remove'
                  sx={{
                    cursor: 'pointer',
                    mt: -0.4,
                    color: theme =>
                      theme.palette.mode === 'dark' ? red[200] : red[700],
                  }}
                />
              </div>
              <img
                src={`${host}${img.src}`}
                width={imageColumn === '2' ? 390 : 600}
                style={{ borderRadius: 4, cursor: 'pointer' }}
                title='Click to view'
                onClick={() => {
                  setPhotoIndex(i)
                  setIsOpenLightBox(true)
                }}
              />
            </Box>
          )
        })}
      </div>
      <Dialog
        open={openDicomImage}
        onClose={handleClose}
        maxWidth={'lg'}
        // fullWidth
      >
        <DialogTitle sx={dialogTitleStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div>{genDicomImageText()}</div>
              <IconButton
                title='Reload'
                onClick={() => getDicomImage(true)}
                // sx={{
                //   color: theme => MODE[theme.palette.mode].buttonReload,
                // }}
                aria-label='reload'
                component='span'
              >
                <RefreshIcon />
              </IconButton>
            </div>

            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </div>
        </DialogTitle>
        <Divider />
        {/* {loading && (
          <div style={{ position: 'absolute', width: '96%' }}>
            <LinearProgress sx={{ mt: 8, mx: 1, width: '100%' }} />
          </div>
        )} */}
        <div style={{ position: 'absolute', width: '96%' }}>
          <SkeletonLoading
            loading={loading}
            style={{ mt: 8, mx: 1, width: '100%' }}
          />
        </div>
        <DialogContent
          sx={{
            p: 0,
            pb: 0.5,
            pl: 1,
            // width: '94%',
            width: 970,
            display: 'flex',
            alignSelf: 'center',
            // border: '1px solid yellow',
          }}
        >
          <Fade in={!loading ? true : false} timeout={!loading ? 200 : 0}>
            <div
              style={{
                display: 'flex',
                marginLeft: 5,
                marginTop: 5,
                gap: 8,
                flexWrap: 'wrap',
                width,
                // justifyContent: 'center',
              }}
            >
              {dicomImages.length > 0 &&
                dicomImages.map((img, i) => {
                  return (
                    <Box
                      key={img.no}
                      sx={{
                        border: `2px solid`,
                        borderColor: theme =>
                          dicomNo.includes(img.no)
                            ? 'transparent'
                            : img.selected
                            ? imageBorderColor(theme.palette.mode).selected
                            : imageBorderColor(theme.palette.mode).default,
                        bgcolor: theme =>
                          img.selected || dicomNo.includes(img.no)
                            ? imageBorderColor(theme.palette.mode).selected
                            : 'transparent',
                        borderRadius: 1.5,
                        p: 0.5,
                        pb: 0.5,
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <div
                        style={{
                          marginTop: '-2px',
                        }}
                      >
                        {!dicomNo.includes(img.no) ? (
                          <Checkbox
                            checked={img.selected}
                            onChange={() => {
                              // console.log(dicomImages)
                              setDicomImages(prev => {
                                let temp = [...prev]
                                temp[i].selected = !temp[i].selected

                                let onlySelected = temp.filter(t => t.selected)

                                setDicomImageSelected(onlySelected)
                                return temp
                              })
                            }}
                            sx={{ p: 0 }}
                          />
                        ) : (
                          <div
                            style={{
                              height: 25,
                              width: 35,
                            }}
                          >
                            <CheckIcon />
                          </div>
                        )}
                        {/* <div style={{ marginTop: 5 }}>
                          {i !== 0 && (
                            <ArrowBackIosNewIcon
                              sx={{ cursor: 'pointer' }}
                              onClick={() => {
                                handleReOrder(dicomImages, '-', i)
                              }}
                            />
                          )}
                          {i !== dicomImages.length - 1 && (
                            <ArrowForwardIosIcon
                              sx={{ cursor: 'pointer' }}
                              onClick={() => {
                                handleReOrder(dicomImages, '+', i)
                              }}
                            />
                          )}
                        </div> */}
                      </div>
                      <img
                        src={img.url}
                        width='450'
                        style={{
                          borderRadius: 4,
                          cursor: !dicomNo.includes(img.no)
                            ? 'pointer'
                            : 'default',
                        }}
                        onClick={
                          dicomNo.includes(img.no)
                            ? undefined
                            : () => {
                                // console.log(dicomImages)
                                setDicomImages(prev => {
                                  let temp = [...prev]
                                  temp[i].selected = !temp[i].selected

                                  let onlySelected = temp.filter(
                                    t => t.selected
                                  )
                                  // console.log(onlySelected)

                                  setDicomImageSelected(onlySelected)
                                  return temp
                                })
                              }
                        }
                      />
                    </Box>
                  )
                })}
            </div>
          </Fade>
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<ChecklistIcon />}
            variant='outlined'
            color='primary'
            onClick={handleSelectAllDicomImage}
          >
            Select All
          </Button>
          {openDicomImage && (
            <Button onClick={handleSelectDicomImage} variant='contained'>
              {dicomImageSelected.length === 0
                ? 'No selected'
                : `Attach ${dicomImageSelected.length} selected`}{' '}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Image

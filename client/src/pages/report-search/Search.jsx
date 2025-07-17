import { useContext, useRef, useState, useEffect } from 'react'
import axios from 'axios'
import { Paper, Stack, Typography } from '@mui/material'
import parse from 'html-react-parser'
import SearchIcon from '@mui/icons-material/Search'
import PrintIcon from '@mui/icons-material/Print'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import ImageIcon from '@mui/icons-material/Image'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import Alert from '@mui/material/Alert'
import { blue, orange, red } from '@mui/material/colors'
import Autocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'

import SnackBarWarning from '../../components/page-tools/SnackBarWarning'
import {
  API,
  DEFAULT_DATE_STATE,
  FILTER_DATE_TYPE,
  MODE,
  QUERY_TYPE,
  reportBgColor,
  // reportBgColor,
  reportFontColor,
  STUDY_TYPE,
} from '../../config'
import DataContext from '../../context/data/dataContext'
import Layout from '../../components/layout/Layout'
import { qsa } from '../../utils/domUtils'
import Paginations from '../../components/page-tools/Pagination'
import {
  formDataToObject,
  isValidInput,
  reFormatDateToDbFormat,
  reFormatFullDate,
  capitalizeFirstLetter,
  reFormatDate,
  getDoctorName,
  checkLogin,
} from '../../utils'
import { openImage, printPdf, viewPdf } from '../report/report-utils'
import { addTeachingFiles, teachingFolders } from '../worklist/tabs/helper'
import TreeFolder from '../../components/page-tools/TreeFolder'
import { inputStyle2, btStyle } from '../../components/page-tools/form-style'
import StatusChip from '../../components/page-tools/StatusChip'
import BackDrop from '../../components/page-tools/BackDrop'
import SkeletonLoading from '../../components/page-tools/SkeletonLoading'

const mr = { mr: 1.5 }
const lh = { lineHeight: '1.5' }
const defaultOption = {
  radiologist: null,
  dateType: '1',
  queryType: 'Match Phrase',
  studyType: 'All',
}

// const allowTags = ['p', 'span', 'strong', 'br', 'em']

// let matchTagName = markup => {
//   const pattern = /<([^\s>]+)(\s|>)+/
//   return markup.match(pattern)
// }

export default function Search() {
  const ref = useRef()
  const [pos, setPos] = useState(false)
  const [openBackDrop, setOpenBackDrop] = useState(false)

  const formRef = useRef(null)
  const [dataList, setDataList] = useState([])
  const [showLoading, setShowLoading] = useState(false)
  const [teaching, setTeaching] = useState({
    show: false,
    data: [],
  })
  const [notFoundMsg, setNotfoundMsg] = useState({
    show: false,
    msg: null,
  })
  const [selectedFolder, setSelectedFolder] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [date, setDate] = useState(DEFAULT_DATE_STATE)
  const [optionSelected, setOptionSelected] = useState(defaultOption)
  const { doctor, systemProperties, user } = useContext(DataContext)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [pageNum, setPageNum] = useState(1)
  const [total, setTotal] = useState(0)

  const reduceHeight = 290
  const [elHeight, setElHeight] = useState(window.innerHeight - reduceHeight)

  window.addEventListener('resize', setElementHeight)
  function setElementHeight(e) {
    setElHeight(e.currentTarget.innerHeight - reduceHeight)
  }

  const [snackWarning, setSnackWarning] = useState({
    show: false,
    message: null,
    autoHideDuration: 3000,
    severity: 'warning',
  })

  useEffect(() => {
    checkLogin()
    const temp = ref?.current
    temp?.addEventListener('scroll', handleScroll)
    return () => temp?.removeEventListener('scroll', handleScroll)

    // eslint-disable-next-line
  }, [])

  const handleTop = () => {
    ref.current.scrollTop = 0
    setPos(false)
  }

  const handleScroll = () => {
    if (ref.current.scrollTop > 50) {
      if (!pos) setPos(true)
    } else {
      if (pos) setPos(false)
    }
  }

  async function submit(e, isSubmit, page = 1, rows = rowsPerPage) {
    resetBeforeSubmit(isSubmit)
    e?.preventDefault()
    setDataList([])

    const formData = formRef.current
    const data = qsa('input', formData)
    let formFilters = formDataToObject(data)

    let content = formFilters.content.trim().toLowerCase()
    let hn = formFilters.hn.trim()
    let signerCode = optionSelected.radiologist?.id || ''
    if (!content && !hn && !signerCode) {
      return setSnackWarning({
        ...snackWarning,
        show: true,
        message: '[Content, HN, Reported By] minimum 1 input',
      })
    }

    if (content && content.length <= 4) {
      formData.querySelector('input[name="content"]').focus()
      return setSnackWarning({
        ...snackWarning,
        show: true,
        message: '5 characters of content is required.',
      })
    }

    content = content.replace(/\s+/g, ' ')

    let desc = formFilters.description.trim().toLowerCase()
    if (desc && desc.length <= 4) {
      formData.querySelector('input[name="description"]').focus()
      return setSnackWarning({
        ...snackWarning,
        show: true,
        message: '5 characters of description is required.',
      })
    }

    desc = desc.replace(/\s+/g, ' ')

    const check = isValidInput(data, [])
    if (!check.isValid) {
      return setSnackWarning({
        ...snackWarning,
        show: true,
        message: check.message,
      })
    }

    if (
      (formFilters.dateFrom && !formFilters.dateTo) ||
      (!formFilters.dateFrom && formFilters.dateTo)
    ) {
      return setSnackWarning({
        ...snackWarning,
        show: true,
        message: 'Must have Date from and Date to',
      })
    }

    setShowLoading(true)

    formFilters = {
      ...formFilters,
      // pageNum: page,
      // rowsPerPage: rows,
      description: desc,
      content,
      dateFrom: formFilters.dateFrom
        ? reFormatDateToDbFormat(formFilters.dateFrom)
        : '',
      dateTo: formFilters.dateTo
        ? reFormatDateToDbFormat(formFilters.dateTo)
        : '',
      signerCode: optionSelected.radiologist?.id || '',
    }

    // console.log('submit', formFilters)

    try {
      // Result found for:
      const response = await axios.get(
        systemProperties.reportSearchServer + API.SEARCH_REPORT_SEARCH,
        {
          params: {
            ...formFilters,
            pageNum: page,
            rowsPerPage: rows,
          },
        }
      )

      setShowLoading(false)
      if (response.status === 200) {
        if (response.data.data.length === 0) {
          return setNotfoundMsg({ show: true, msg: formFilters })
        }

        setTotal(response.data.total)
        setDataList(response.data.data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  function resetBeforeSubmit(isSubmit = false) {
    if (isSubmit) {
      // setDataList([])
      // setRowsPerPage(10)
      setPageNum(1)
      setNotfoundMsg({ show: false, msg: null })
    }
  }

  function renderContent(content) {
    let newContent = content
    // let regex = /<(?!\/?(p|span|strong|br|em)\b)[^>]+[^</p>]+[^<br />]/gi
    // let regex = /<\s*\/?\s*(p|span|strong|br|em)\b.*?>/gi
    let hasInvalidRegex = /<(?!\/?(p|span|strong|br|em)\b)[^>]/gi
    if (newContent.match(hasInvalidRegex)) {
      // console.log('found invalid tag')
      let regex = /<\s*\/?\s*(p|span|strong|br|em)\b.*?>/gi
      let validTags = newContent.match(regex)
      let testcontent = newContent

      let v = []
      for (let i = 0; i < validTags.length; i++) {
        v[i] = validTags[i].replace(/</g, '&lt;')
        testcontent = testcontent.replace(validTags[i], v[i])
      }

      testcontent = testcontent.replace(/</g, '&lt;')

      for (let i = 0; i < v.length; i++) {
        testcontent = testcontent.replace(v[i], validTags[i])
      }
      newContent = testcontent
    }

    return parse(newContent)
  }

  function renderIcons(data) {
    return (
      <>
        <ImageIcon
          fontSize='large'
          titleAccess='View PACS image'
          sx={{
            cursor: 'pointer',
            mr: 0.5,
            color: theme =>
              theme.palette.mode === 'dark' ? '#F5F5F5' : '#333',
          }}
          onClick={() =>
            openImage(systemProperties.uniwebAddress, data.accession)
          }
        />
        <PrintIcon
          fontSize='large'
          titleAccess='Print report'
          sx={{
            cursor: 'pointer',
            mr: 0.5,
            color: theme =>
              theme.palette.mode === 'dark' ? blue[200] : blue[400],
          }}
          onClick={() =>
            printPdf(
              'worklist',
              data,
              systemProperties,
              doctor,
              user,
              true,
              setOpenBackDrop
            )
          }
        />
        <PictureAsPdfIcon
          fontSize='large'
          titleAccess='View report'
          sx={{
            cursor: 'pointer',
            mr: 0.5,
            color: theme =>
              theme.palette.mode === 'dark' ? red[200] : red[400],
          }}
          onClick={() =>
            viewPdf(data, systemProperties, doctor, user, true, setOpenBackDrop)
          }
        />
        <LibraryAddIcon
          fontSize='large'
          titleAccess='Add to teaching files'
          sx={{
            cursor: 'pointer',
            color: theme =>
              theme.palette.mode === 'dark' ? orange[100] : orange[600],
          }}
          onClick={() => {
            setSelectedPatient({ accession: data.accession })
            handleClickTeaching(data)
          }}
        />
      </>
    )
  }

  function handleClickTeaching(data) {
    teachingFolders(
      [{ accession: data.accession }],
      setSnackWarning,
      systemProperties,
      setTeaching
    )
  }

  async function handleAddTeachingFiles(inputValue) {
    addTeachingFiles(
      [selectedPatient],
      selectedFolder,
      inputValue,
      setSnackWarning,
      setTeaching
    )
  }

  function handleChangePage(e, page) {
    handleTop()
    setPageNum(page)
    submit(null, false, page, rowsPerPage)
  }

  function handleChangeRows(e) {
    handleTop()
    const rows = e.target.value
    setPageNum(1)
    setRowsPerPage(rows)
    submit(null, false, 1, rows)
  }

  return (
    <Layout>
      {doctor && systemProperties && (
        <>
          <Stack direction='row' justifyContent='center'>
            <Paper
              elevation={0}
              sx={{
                p: 1,
                // px: 10,
                width: 1000,
                minWidth: 1000,
                display: 'flex',
                justifyContent: 'center',
                border: theme =>
                  theme.palette.mode === 'light' && '1px solid #b3b3b3',
                backgroundColor: theme => MODE[theme.palette.mode].tab.active,
              }}
            >
              <form
                ref={formRef}
                autoComplete='off'
                onSubmit={e => submit(e, true)}
                style={{ width: '100%', marginTop: -6 }}
              >
                <div style={{}}>
                  <TextField
                    label='Content'
                    variant='outlined'
                    size='small'
                    margin='dense'
                    name='content'
                    autoFocus
                    sx={{ ...mr, ...inputStyle2, width: 320 }}
                  />

                  <FormControl
                    size='small'
                    margin='dense'
                    sx={{ ...mr, ...inputStyle2, width: 150 }}
                  >
                    <InputLabel>Query Type</InputLabel>
                    <Select
                      name='queryType'
                      margin='dense'
                      value={optionSelected.queryType}
                      onChange={e =>
                        setOptionSelected(prev => ({
                          ...prev,
                          [e.target.name]: e.target.value,
                        }))
                      }
                      label='Query Type'
                    >
                      {QUERY_TYPE.map(f => (
                        <MenuItem value={f.value} key={f.value}>
                          {f.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl
                    size='small'
                    margin='dense'
                    sx={{ ...mr, ...inputStyle2, width: 160 }}
                  >
                    <InputLabel>Date Type</InputLabel>
                    <Select
                      name='dateType'
                      margin='dense'
                      value={optionSelected.dateType}
                      onChange={e =>
                        setOptionSelected(prev => ({
                          ...prev,
                          [e.target.name]: e.target.value,
                        }))
                      }
                      label='Date Type'
                    >
                      {FILTER_DATE_TYPE.map(f => (
                        <MenuItem value={f.value} key={f.value}>
                          {f.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      slotProps={{
                        actionBar: { actions: ['clear', 'today'] },
                        textField: {
                          size: 'small',
                          name: 'dateFrom',
                          sx: { ...mr, ...inputStyle2, mt: 1, width: 150 },
                        },
                      }}
                      allowSameDateSelection
                      clearable
                      label='From'
                      format='dd/MM/yyyy'
                      value={date.from}
                      onChange={newValue =>
                        setDate(prev => {
                          if (!prev.to) {
                            return {
                              ...prev,
                              from: newValue,
                              to: newValue,
                            }
                          } else {
                            if (newValue > prev.to) {
                              return {
                                ...prev,
                                from: newValue,
                                to: newValue,
                              }
                            }
                            return {
                              ...prev,
                              from: newValue,
                            }
                          }
                        })
                      }
                    />
                  </LocalizationProvider>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      slotProps={{
                        actionBar: { actions: ['clear', 'today'] },
                        textField: {
                          size: 'small',
                          name: 'dateTo',
                          sx: { ...inputStyle2, mt: 1, width: 150 },
                        },
                      }}
                      allowSameDateSelection
                      clearable
                      label='To'
                      format='dd/MM/yyyy'
                      value={date.to}
                      onChange={newValue =>
                        setDate(prev =>
                          !prev.from
                            ? {
                                ...prev,
                                from: newValue,
                                to: newValue,
                              }
                            : {
                                ...prev,
                                to: newValue,
                              }
                        )
                      }
                    />
                  </LocalizationProvider>
                  <TextField
                    label='HN'
                    variant='outlined'
                    size='small'
                    margin='dense'
                    name='hn'
                    sx={{ ...mr, ...inputStyle2, width: 156 }}
                  />
                  <FormControl
                    size='small'
                    margin='dense'
                    sx={{ ...mr, ...inputStyle2, width: 100 }}
                  >
                    <InputLabel>Study Type</InputLabel>
                    <Select
                      name='studyType'
                      margin='dense'
                      value={optionSelected.studyType}
                      onChange={e =>
                        setOptionSelected(prev => ({
                          ...prev,
                          [e.target.name]: e.target.value,
                        }))
                      }
                      label='Study Type'
                    >
                      {STUDY_TYPE.map(f => (
                        <MenuItem value={f.value} key={f.value}>
                          {f.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label='Description'
                    variant='outlined'
                    size='small'
                    margin='dense'
                    sx={{ ...inputStyle2, width: 190, mr: 1.5 }}
                    name='description'
                  />
                  <FormControl size='small' sx={{ ...mr, mt: 1 }}>
                    <Autocomplete
                      size='small'
                      disablePortal
                      value={optionSelected.radiologist}
                      options={doctor
                        .filter(d => d.radType === '2' || d.radType === '4')
                        .map(d => ({
                          label: d.radDesc,
                          id: d.radName,
                        }))}
                      sx={{ minWidth: 303 }}
                      isOptionEqualToValue={(option, value) =>
                        option.value === value.value
                      }
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          {option.label}
                        </li>
                      )}
                      onChange={(event, values) => {
                        setOptionSelected(prev => ({
                          ...prev,
                          radiologist: values,
                        }))
                      }}
                      renderInput={params => (
                        <TextField
                          {...params}
                          size='small'
                          variant='outlined'
                          placeholder='Reported By'
                          name='signerCode'
                          label='Reported By'
                          sx={inputStyle2}
                        />
                      )}
                    />
                  </FormControl>

                  <Button
                    type='submit'
                    sx={{
                      ...mr,
                      ...btStyle,
                      height: 40,
                      mt: 1,
                    }}
                    variant='contained'
                    startIcon={<SearchIcon />}
                  >
                    Search
                  </Button>
                  <Button
                    sx={{ mt: 1, height: 40 }}
                    variant='outlined'
                    onClick={() => {
                      formRef.current.reset()
                      setDate(DEFAULT_DATE_STATE)
                      setOptionSelected(defaultOption)
                      setNotfoundMsg({ show: false, msg: null })
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </form>
            </Paper>

            <SnackBarWarning
              snackWarning={snackWarning}
              setSnackWarning={setSnackWarning}
              vertical='top'
              horizontal='center'
            />
          </Stack>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: 10,
              // width: 1000,
            }}
          >
            <Stack justifyContent='center' direction='column'>
              <div
                ref={ref}
                style={{
                  maxHeight: elHeight,
                  overflow: 'auto',
                  // border: '1px solid black',
                  marginLeft: '-70px',
                  width: 1070,
                  // border: '1px solid black',
                }}
              >
                <SkeletonLoading loading={showLoading} style={{ ml: 9 }} />
                {dataList.length > 0 && (
                  <>
                    {dataList.map((d, i) => {
                      let orderDate = reFormatFullDate(d.studyDate)
                      let reportedDate = reFormatFullDate(d.reportedDate)
                      return (
                        <div
                          key={i}
                          style={{ display: 'flex', justifyContent: 'end' }}
                        >
                          <Typography
                            component='div'
                            style={{
                              // maxWidth: 50,
                              width: 80,
                              marginTop: 8,
                              textAlign: 'right',
                              paddingRight: 5,
                            }}
                          >
                            {d.no}
                          </Typography>
                          <div
                            style={{
                              display: 'flex',
                              marginBottom: 10,
                            }}
                          >
                            <Paper
                              sx={{
                                width: 323,
                                p: 1,
                                borderRadius: 0,
                                minHeight: 100,

                                color: theme =>
                                  reportFontColor[theme.palette.mode],
                                backgroundColor: theme =>
                                  reportBgColor[theme.palette.mode],
                                borderRight: theme =>
                                  theme.palette.mode === 'dark'
                                    ? '1px solid #999'
                                    : '1px solid #ccc',
                              }}
                            >
                              <Typography sx={lh} component='div'>
                                Name: <strong>{d.name}</strong>
                              </Typography>

                              <Typography sx={lh} component='div'>
                                HN: <strong>{d.hn}</strong>
                              </Typography>
                              <div style={lh}>
                                Study Type:{' '}
                                {StatusChip({ studyType: d.studyType })}
                              </div>
                              <Typography sx={lh} component='div'>
                                Desc: <strong>{d.description}</strong>
                              </Typography>
                              <Typography sx={lh} component='div'>
                                Indication:{' '}
                                <strong>
                                  {d.indication.replace(/&lt;/g, '<')}
                                </strong>
                              </Typography>
                              <Typography sx={lh} component='div'>
                                Order Date: <strong>{orderDate[0]}</strong>
                              </Typography>
                              <Typography sx={lh} component='div'>
                                Reported Date:{' '}
                                <strong>{reportedDate[0]}</strong>
                              </Typography>
                              {d.consultantCode && (
                                <Typography sx={lh} component='div'>
                                  Consultant By:{' '}
                                  <strong>
                                    {d.consultantName
                                      .split(', ')
                                      .map((c, i) => {
                                        if (i == 0)
                                          return <span key={i}>{c}</span>

                                        return <div key={i}>{c}</div>
                                      })}
                                  </strong>
                                </Typography>
                              )}
                              {d.reportedByCode && (
                                <Typography sx={lh} component='div'>
                                  Reported By:{' '}
                                  <strong>{d.reportedByName}</strong>
                                </Typography>
                              )}
                              {d.verifiedByCode && (
                                <Typography sx={lh} component='div'>
                                  Verified By:{' '}
                                  <strong>{d.verifiedByName}</strong>
                                </Typography>
                              )}
                              {renderIcons(d)}
                            </Paper>
                            <Paper
                              sx={{
                                borderRadius: 0,
                                padding: 1,
                                width: 660,
                                minHeight: 100,
                                color: theme =>
                                  reportFontColor[theme.palette.mode],
                                backgroundColor: theme =>
                                  reportBgColor[theme.palette.mode],
                              }}
                            >
                              <Typography sx={{ mt: -0.5 }} component='div'>
                                {renderContent(d.content)}
                              </Typography>
                            </Paper>
                          </div>
                        </div>
                      )
                    })}
                  </>
                )}
              </div>
              {dataList.length > 0 && (
                <div style={{ marginTop: '0px' }}>
                  <Paginations
                    total={total}
                    pageNum={pageNum}
                    rowsPerPage={rowsPerPage}
                    handleChangePage={handleChangePage}
                    handleChangeRows={handleChangeRows}
                  />
                </div>
              )}
            </Stack>
          </div>
          {teaching.show && (
            <TreeFolder
              teaching={teaching}
              setTeaching={setTeaching}
              handleAddTeachingFiles={handleAddTeachingFiles}
              setSnackWarning={setSnackWarning}
              setSelectedFolder={setSelectedFolder}
              selectedFolder={selectedFolder}
              //   position={{ top: 187 }}
            />
          )}
          {notFoundMsg.show && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Stack sx={{ width: 1000 }} spacing={0.5} justifyContent='center'>
                {notFoundMsg.msg['content'] && (
                  <Alert severity='warning'>
                    Not found! with key word " {notFoundMsg.msg['content']} "
                  </Alert>
                )}
                {notFoundMsg.msg['content'] &&
                  notFoundMsg.msg['queryType'] &&
                  notFoundMsg.msg['content']?.split(' ').length > 1 && (
                    <Alert severity='warning'>
                      Not found! with Query Type "{' '}
                      {notFoundMsg.msg['queryType']} "
                    </Alert>
                  )}
                {Object.keys(notFoundMsg.msg).map(m => {
                  if (
                    notFoundMsg.msg[m] &&
                    m !== 'content' &&
                    m !== 'queryType'
                  ) {
                    let h = capitalizeFirstLetter(m)
                    let v = notFoundMsg.msg[m]
                    if (m === 'dateFrom' || m === 'dateTo') {
                      h = m === 'dateFrom' ? 'From' : 'To'
                      v = reFormatDate(notFoundMsg.msg[m])
                    }

                    if (m === 'signerCode') {
                      h = 'Doctor'
                      v = getDoctorName(doctor, notFoundMsg.msg[m])[0].desc
                    }

                    if (m === 'hn') h = m.toUpperCase()
                    if (m === 'studyType')
                      v = v === '1' ? 'OB' : v === '2' ? 'GYN' : 'All'

                    if (m === 'dateType') {
                      if (notFoundMsg.msg['dateFrom'] === '') return null
                      h = 'Date Type'
                      v =
                        FILTER_DATE_TYPE.find(
                          f => f.value === parseInt(notFoundMsg.msg[m])
                        ).name || ''
                    }

                    return (
                      <Alert key={m} severity='warning'>
                        Not found! with {h}: {v}
                      </Alert>
                    )
                  }
                  return null
                })}
              </Stack>
            </div>
          )}
        </>
      )}
      <BackDrop openBackDrop={openBackDrop} />
    </Layout>
  )
}

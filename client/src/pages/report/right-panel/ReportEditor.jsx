import { useState, useEffect, useContext, useRef } from 'react'
import axios from 'axios'
import parse from 'html-react-parser'
// import { useHistory } from 'react-router-dom'
import { useMediaQuery } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import Fade from '@mui/material/Fade'
import SaveIcon from '@mui/icons-material/Save'
import NewspaperIcon from '@mui/icons-material/Newspaper'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import Input from '@mui/material/Input'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import CloseIcon from '@mui/icons-material/Close'
import Stack from '@mui/material/Stack'
import SaveAsIcon from '@mui/icons-material/SaveAs'
import Typography from '@mui/material/Typography'
import NextPlanIcon from '@mui/icons-material/NextPlan'
import StarIcon from '@mui/icons-material/Star'
import EditIcon from '@mui/icons-material/Edit'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import IconButton from '@mui/material/IconButton'
import RedoIcon from '@mui/icons-material/Redo'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import CheckIcon from '@mui/icons-material/Check'
import { useConfirm } from 'material-ui-confirm'
import { Editor } from '@tinymce/tinymce-react'

import DataContext from '../../../context/data/dataContext'
import {
  formDataToObject,
  getDoctorName,
  getShowPublic,
  isMobileOrTablet,
} from '../../../utils'
import {
  API,
  MODE,
  STORAGE_NAME,
  TAB_SPACE,
  defaultContentStyle,
  reportBgColor,
  reportFontColor,
} from '../../../config'
import { reFormatSpace, cleanUpContent } from '../report-utils'

import '../style.css'
import SnackBarWarning from '../../../components/page-tools/SnackBarWarning'
import { appendTemplate, autoSave, updateDataChange } from '../helper'
import {
  btStyle,
  dialogTitleStyle,
  inputStyle2,
} from '../../../components/page-tools/form-style'
import { yellow } from '@mui/material/colors'
import { qsa } from '../../../utils/domUtils'

let backupData = null

const style = {
  ml: 0,
  mt: 0.3,
  width: '100%',
  // border: 'solid 1px black',
  // '&:hover': {
  //   textDecoration: 'underline'
  // }
}
const btr = {
  mr: 0.5,
}

const defaultTemplateForm = {
  show: false,
  data: {
    templateName: '',
    templateDesc: '',
    type: 'Private',
    owner: '',
    content: '',
  },
}

const ReportEditor = ({ patient, editorRef }) => {
  const { doctor, user, theme, systemProperties } = useContext(DataContext)
  const confirm = useConfirm()
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [openTemplate, setOpenTemplate] = useState(false)
  const [openTemplateForm, setOpenTemplateForm] = useState(false)
  const [templates, setTemplates] = useState([])
  // const [loadingAllTemplates, setLoadingAllTemplates] = useState(false)
  const [masterTemplates, setMasterTemplates] = useState(null)
  const [templateDetial, setTemplateDetail] = useState(null)
  const [filterInput, setFilterInput] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [saveTemplateDialog, setSaveTemplateDialog] =
    useState(defaultTemplateForm)
  const [originalName, setOriginalName] = useState('')

  const editorTemplateRef = useRef(null)
  const backupContentRef = useRef(null)
  const templateFormRef = useRef(null)

  const [snackWarning, setSnackWarning] = useState({
    show: false,
    message: null,
    autoHideDuration: 3000,
    severity: null,
  })

  const matches1024px = useMediaQuery('(max-height:1024px)')
  let minHeight = matches1024px ? 140 : 175

  const elHeight = window.innerHeight - 305

  const editorSkin =
    theme === 'dark' ? { skin: 'dark', skin_url: '/js/skins/dark' } : {}

  const tbOptions =
    'undo redo | ' +
    'bold italic underline  | ' + //strikethrough
    // 'alignleft aligncenter alignright alignjustify | ' +
    // 'bullist numlist superscript subscript ' +
    ' | ' +
    ' pastetext | ' +
    'removeformat'

  const tbPlugins = [
    'spellchecker advlist autolink lists charmap print anchor',
    'searchreplace',
    'paste nonbreaking ',
  ]

  async function initContent() {
    // console.log('initContent')
    setLoading(true)
    let content = await getReportData()
    content = reFormatSpace(cleanUpContent(content))
    saveToLocalStorage(content)

    setBackupContent(content)
    setContent(content)
    setLoading(false)
    updateDataChange('0')
  }

  async function getReportData() {
    // const res = await axios.get(API.REPORT_DATA, {
    //   params: {
    //     accession: patient.accession,
    //     studyType: patient.obStudyType,
    //   },
    // })
    const res = await axios.get(API.DIAG_REPORT, {
      params: {
        accession: patient.accession,
      },
    })

    return res.data?.data[0]?.content || ''
  }

  useEffect(() => {
    initContent()

    return () => {
      autoSave(null, { accession: patient.accession, content: backupData })
      backupData = null
    }
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    const backupContent = backupContentRef.current
    if (backupContent?.value) {
      // setPatient({ ...patient, content: backupContent.value })
      setContent(backupContent.value)
      backupData = backupContent.value
    }

    return () => {}
  }, [theme])

  function setBackupContent(content) {
    const backupContent = backupContentRef.current
    backupContent.value = content
    saveToLocalStorage(content)
    backupData = content
    updateDataChange('1')
  }

  async function draftReport() {
    // if (!editorRef.current.getContent({ format: 'text' }).trim()) {
    //   return setSnackWarning(prev => ({
    //     ...prev,
    //     show: true,
    //     message: 'Empty content',
    //     severity: 'warning',
    //   }))
    // }

    let content = editorRef.current.getContent()
    content = reFormatSpace(cleanUpContent(content))
    setBackupContent(content)
    saveToLocalStorage(content)

    const res = await axios.post(API.DIAG_REPORT, {
      accession: patient.accession,
      content,
    })

    if (!res.data.data) {
      return setSnackWarning(prev => ({
        ...prev,
        show: true,
        message: 'Save Fail',
        severity: 'error',
      }))
    }

    updateDataChange('0')
    setSnackWarning(prev => ({
      ...prev,
      show: true,
      message: 'Save Completed',
      severity: 'success',
    }))
  }

  function saveToLocalStorage(content) {
    window.localStorage.setItem(STORAGE_NAME.diagReport, content)
  }

  async function getTemplateList() {
    // console.log('all modality', allmodality)
    // console.log('getTemplateList', patient.modality)
    try {
      const response = await axios.get(API.REPORT_TEMPLATE, {
        params: {
          showPublic: getShowPublic(),
          sex: 'B',
        },
      })

      const newObj = response.data.data.map(d => {
        if (d.desc || d.desc === '') return d
        return {
          ...d,
          desc: '',
        }
      })

      setTemplates(response.data.data)
      setMasterTemplates(newObj)
      // sleep(50).then(() => setLoadingAllTemplates(false))
    } catch (error) {
      console.log(error)
    }
  }

  async function showTemplate() {
    await getTemplateList()
    setOpenTemplate(true)
  }

  function handleClose() {
    setOpenTemplate(false)
    setMasterTemplates(null)
    setTemplateDetail(null)
    setSelectedTemplate(null)
    setSaveTemplateDialog(defaultTemplateForm)
    setFilterInput('')
  }

  function renderActionBt(t) {
    return (
      <div style={{ width: 30 }}>
        <NextPlanIcon
          titleAccess='Use'
          onClick={() => {
            appendTemplate(editorRef, t.content, 'template')
            handleClose()
          }}
          sx={{
            cursor: 'pointer',
            color: theme => MODE[theme.palette.mode].useIcon,
          }}
        />
      </div>
    )
  }

  function handleClickSaveAsTemplate() {
    if (editorRef.current.getContent({ format: 'text' }).trim() === '') {
      return setSnackWarning({
        ...snackWarning,
        show: true,
        message: 'Empty report content is not allowed to Save as Template!',
        severity: 'warning',
      })
    }
    setOpenTemplateForm(true)
  }

  async function handleSaveTemplate() {
    const formData = templateFormRef.current
    const data = qsa(['input', 'select'], formData)
    const formObj = formDataToObject(data)

    if (formObj.templateName === '') {
      return setSnackWarning({
        ...snackWarning,
        show: true,
        message: 'Template name is required!',
        severity: 'warning',
      })
    }

    let bodyData = {
      ...formObj,
      gender: 'F',
      content: reFormatSpace(cleanUpContent(editorRef.current.getContent())),
    }

    // console.log(bodyData)

    const response = await axios.get(API.REPORT_TEMPLATE)
    const templateList = response.data.data

    let check = templateList.find(
      t => t.name === bodyData.templateName && t.owner === user.code
    )

    if (check) {
      confirm({
        title: `"${bodyData.templateName}" name already exist, confirm to replace?`,
        confirmationButtonProps: { autoFocus: true },
        dialogProps: {
          maxWidth: 'sm',
        },
      })
        .then(() => {
          saveAsTemplate({ ...bodyData, id: check.id })
        })
        .catch(() => {})
    } else {
      saveAsTemplate(bodyData)
    }
  }

  async function saveAsTemplate(bodyData) {
    try {
      const res = await axios.post(API.REPORT_TEMPLATE, bodyData)
      if (res.data.data?.length > 0) {
        setSnackWarning(prev => ({
          ...prev,
          show: true,
          message: 'Save template completed',
          severity: 'success',
        }))
        setOpenTemplateForm(false)
      } else {
        setSnackWarning(prev => ({
          ...prev,
          show: true,
          message: 'Save fail',
          severity: 'error',
        }))
      }
    } catch (error) {
      console.log(error)
    }
  }

  async function handleUpdateTemplate(option) {
    if (saveTemplateDialog.data.templateName.trim() === '') {
      return alert('Template name is required!')
    }

    let content = editorTemplateRef.current.getContent()
    if (content.trim() === '') {
      return alert('Report content is required!')
    }

    const response = await axios.get(API.REPORT_TEMPLATE)
    const templateList = response.data.data

    let check = templateList
      .filter(t => t.name !== originalName)
      .find(
        t =>
          t.name === saveTemplateDialog.data.templateName.trim() &&
          saveTemplateDialog.data.owner === user.code
      )

    if (check) {
      confirm({
        title: `"${saveTemplateDialog.data.templateName}" name already exist, confirm to replace?`,
        confirmationButtonProps: { autoFocus: true },
        dialogProps: {
          maxWidth: 'sm',
        },
      })
        .then(() => saveTemplateContent(saveTemplateDialog.data, check, option))
        .catch(() => {})
    } else {
      saveTemplateContent(saveTemplateDialog.data, null, option)
    }
  }

  async function saveTemplateContent(data, replaceData, option) {
    /// save to db

    let content = editorTemplateRef.current.getContent().trim()
    content = reFormatSpace(cleanUpContent(content, 'template'))

    const body = {
      ...data,
      id: replaceData?.id || data?.id || null,
      content,
    }
    // console.log(body)

    await axios.post(API.REPORT_TEMPLATE, body)

    if (option === 'use') {
      appendTemplate(editorRef, content, 'template')
      handleClose()
    } else {
      renderTemplateDetails(data)
      setSaveTemplateDialog(defaultTemplateForm)
      getTemplateList()
    }

    setFilterInput('')
  }

  function handleFormChange(e) {
    setSaveTemplateDialog(prev => ({
      ...prev,
      data: { ...prev.data, [e.target.name]: e.target.value },
    }))
  }

  function renderTemplateDetails(data) {
    // console.log(data)
    let c = editorTemplateRef?.current?.getContent()
    if (c) c = cleanUpContent(c)

    let d = {
      ...data,
      content: c || data.content,
      desc: data.desc || data.templateDesc || '',
      name: data.name || data.templateName || '',
    }
    let description = ''
    if (d.desc) {
      description = `, <span style="font-size:18px;">${d.desc}</span>`
    }

    let ownerName = ''
    if (user.code !== d.owner) {
      let n = getDoctorName(doctor, d.owner)[0]?.desc || ''
      if (n && n !== 'Current Que Normal')
        ownerName = ` <span style="font-size:15px;">(${n})</span>`
    }

    setSelectedTemplate(d)
    setTemplateDetail(
      parse(`<h2>${d.name}${description}${ownerName}</h2><hr style="marginTop:-20px;" />
      <div style="marginTop:-10px;">${d.content}</div>`)
    )
  }

  return (
    <div>
      <Fade in={!loading ? true : false} timeout={200}>
        <div style={{}}>
          {!loading && (
            <Editor
              key={theme}
              onInit={(evt, editor) => (editorRef.current = editor)}
              // initialValue={patient?.content}
              // initialValue={patient?.content}
              initialValue={content}
              // disabled={isEditorDisable}
              init={{
                selector: 'textarea',
                // contextmenu: 'paste',
                browser_spellcheck: true,
                auto_focus: !isMobileOrTablet(),
                resize: false,
                force_br_newlines: true,
                forced_root_block: false,

                // height: editorHeight + 'px',
                height: elHeight + 'px',
                menubar: false,
                plugins: tbPlugins,
                deprecation_warnings: false,
                nonbreaking_force_tab: true,
                paste_data_images: false,
                // font_formats: fonts,
                paste_postprocess: async function () {},
                paste_preprocess: async function (args) {
                  args.content = args.content.replace(
                    /\t/g,
                    '&nbsp; &nbsp; &nbsp;&nbsp;'
                  )
                  args.content = args.content.replaceAll('  ', '&nbsp; &nbsp; ')

                  // args.content = cleanUpContent(
                  //   args.content,
                  //   'template'
                  // )

                  // const doc = new DOMParser().parseFromString(
                  //   args.content,
                  //   'text/html'
                  // )

                  // if (!doc.querySelector('img')) return

                  // const id = getRandomId()
                  // const temp = args.content.replace(
                  //   '/>',
                  //   `id="${id}" />`
                  // )

                  // setDataUrlToLocalStorage(
                  //   doc.querySelector('img').getAttribute('src'),
                  //   id,
                  //   editorRef
                  // )

                  // args.content = temp
                },

                toolbar: tbOptions,

                content_style: defaultContentStyle.replace(
                  '}',
                  `min-height: ${elHeight - minHeight}px;color: ${
                    reportFontColor[theme]
                  };background-color: ${reportBgColor[theme]};}`
                ),
                ...editorSkin,
                // style_formats: [
                //   // { title: 'Styles' },
                //   // { title: 'Bold text', inline: 'b' },
                //   // {
                //   //   title: 'Red text',
                //   //   inline: 'span',
                //   //   styles: { color: '#ff0000' },
                //   // },
                //   // {
                //   //   title: 'Red header',
                //   //   block: 'h1',
                //   //   styles: { color: '#ff0000' },
                //   // },
                // ],
                setup: function (editor) {
                  editor.on(
                    'keydown',
                    function (e) {
                      // console.log(e)
                      if (e.shiftKey && e.key === '<') {
                        editor.execCommand('mceInsertContent', false, '&lt; ')
                        e.preventDefault()
                      }

                      if (e.code === 'F2') {
                        // console.log('Press F2')
                        e.preventDefault()
                      }
                      // if (e.code === 'Backspace') {
                      //   console.log('Press Backspace')
                      //   e.preventDefault()
                      // }

                      if (e.code === 'Tab') {
                        editor.execCommand(
                          'mceInsertContent',
                          false,
                          '&nbsp; &nbsp; &nbsp;&nbsp;'
                        )
                        e.preventDefault()
                      }
                    },
                    editor.on('init', function () {
                      // setShowPreviewBt(true)
                    })
                  )
                },
              }}
              onEditorChange={content => {
                setBackupContent(content)

                // e.undoManager.add()
              }}
            />
          )}
        </div>
      </Fade>
      <Fade in={!loading ? true : false} timeout={200}>
        <div>
          <Button
            startIcon={<SaveIcon />}
            onClick={draftReport}
            variant='contained'
            size='small'
            sx={{
              ...btStyle,
              my: 0.5,
              mr: 0.5,
            }}
          >
            Save
          </Button>
          <Button
            startIcon={<NewspaperIcon />}
            onClick={showTemplate}
            variant='contained'
            color='info'
            size='small'
            sx={{
              my: 0.5,
              mr: 0.5,
            }}
          >
            Template
          </Button>
          <Button
            startIcon={<AddIcon />}
            onClick={handleClickSaveAsTemplate}
            color='info'
            variant='contained'
            size='small'
            sx={{
              my: 0.5,
              mr: 0.5,
            }}
          >
            Save as Template
          </Button>
        </div>
      </Fade>

      <input type='hidden' ref={backupContentRef} name='backupContent' />
      <SnackBarWarning
        snackWarning={snackWarning}
        setSnackWarning={setSnackWarning}
        vertical='top'
        horizontal='center'
      />

      <Dialog
        open={openTemplateForm}
        onClose={() => setOpenTemplateForm(false)}
        maxWidth={'md'}
      >
        <DialogTitle sx={dialogTitleStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ marginTop: '4px' }}> Save as Template</div>
            <IconButton onClick={() => setOpenTemplateForm(false)}>
              <CloseIcon />
            </IconButton>
          </div>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
          <form ref={templateFormRef} autoComplete='off'>
            <TextField
              label='Name'
              variant='outlined'
              size='small'
              margin='dense'
              required
              name='templateName'
              autoFocus
              sx={{ ...btr, ...inputStyle2, width: 250 }}
            />
            <TextField
              label='Description'
              variant='outlined'
              size='small'
              margin='dense'
              name='templateDesc'
              sx={{ ...btr, ...inputStyle2, width: 250 }}
              InputLabelProps={{ shrink: true }}
            />
            <FormControl
              size='small'
              margin='dense'
              sx={{ ...btr, ...inputStyle2, minWidth: 120 }}
            >
              <InputLabel>Type</InputLabel>
              <Select name='type' defaultValue='Private' autoWidth label='Type'>
                <MenuItem value='Private'>Private</MenuItem>
                <MenuItem value='Public'>Public</MenuItem>
                <MenuItem value='Favorite'>Favorite</MenuItem>
              </Select>
            </FormControl>
            <Button
              sx={{ ...btStyle, mt: 1 }}
              variant='contained'
              startIcon={<CheckIcon />}
              onClick={() => handleSaveTemplate()}
            >
              Save
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openTemplate}
        onClose={handleClose}
        maxWidth={'xl'}
        fullWidth
      >
        <DialogTitle sx={dialogTitleStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ marginTop: '4px' }}>Template List</div>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </div>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 0 }}>
          <div style={{ margin: 10, overflowY: 'auto', overflowX: 'hidden' }}>
            <div
              style={{
                display: 'flex',
                overflow: 'auto',
                height: elHeight,
              }}
            >
              <div
                style={{
                  width: '32%',
                  overflow: 'auto',
                  // height: elHeight,
                }}
              >
                {masterTemplates && (
                  <div>
                    <FormControl
                      sx={{
                        ml: 0,
                        mt: 0,
                        width: '28.6%',
                        minWidth: 360,
                        maxWidth: 465,
                        position: 'fixed',
                      }}
                      variant='standard'
                    >
                      <Input
                        autoFocus
                        value={filterInput}
                        sx={{
                          pl: 0.5,
                          backgroundColor: theme =>
                            theme.palette.mode === 'dark'
                              ? '#415C5C'
                              : '#f2f2f2',
                          borderRadius: 1,
                        }}
                        onChange={e => {
                          let temp = masterTemplates
                          if (e.target.value !== '') {
                            temp = masterTemplates.filter(t => {
                              return (
                                t.name
                                  .toLowerCase()
                                  .indexOf(e.target.value.toLowerCase()) > -1
                              )

                              // return (
                              //   (t.name
                              //     .toLowerCase()
                              //     .indexOf(e.target.value.toLowerCase()) > -1 ||
                              //     t.desc
                              //       .toLowerCase()
                              //       .indexOf(e.target.value.toLowerCase()) >
                              //       -1) &&
                              //   t.type !== 'Favorite'
                              // )
                            })
                          }

                          setFilterInput(e.target.value)
                          setTemplates(temp)
                        }}
                        placeholder=' Search . . .'
                        endAdornment={
                          <InputAdornment
                            sx={{ cursor: 'pointer', mr: 1 }}
                            position='end'
                            onClick={() => {
                              setFilterInput('')
                              setTemplates(masterTemplates)
                            }}
                          >
                            {filterInput && <CloseIcon fontSize='small' />}
                          </InputAdornment>
                        }
                      />
                    </FormControl>
                  </div>
                )}
                <div style={{ marginTop: 35 }}>
                  {templates.map((t, i) => (
                    <Stack
                      direction='row'
                      justifyContent={
                        systemProperties.useTemplateIconRightSide === 'enable'
                          ? 'space-between'
                          : 'flex-start'
                      }
                      sx={{
                        pl: 0.5,
                        pt: 0.5,
                        '&:hover': {
                          bgcolor: theme =>
                            MODE[theme.palette.mode].dataGrid.headerBackground,
                        },
                      }}
                      key={i}
                    >
                      {systemProperties.useTemplateIconRightSide !==
                        'enable' && (
                        <div style={{ paddingTop: 3 }}>{renderActionBt(t)}</div>
                      )}
                      <div style={{ display: 'flex' }}>
                        <Typography
                          sx={{
                            ...style,
                            cursor: 'pointer',
                            fontSize: 16,
                            color: theme =>
                              MODE[theme.palette.mode].dataGrid.font,
                          }}
                          title={t.desc}
                          variant='body1'
                          component='div'
                          onClick={() => {
                            renderTemplateDetails(t)
                          }}
                        >
                          {t.name}
                        </Typography>

                        {t.type === 'Favorite' && (
                          <StarIcon
                            titleAccess='Favorite'
                            // sx={style}
                            sx={{
                              ml: 0.5,
                              mt: 0.1,
                              color: theme =>
                                theme.palette.mode === 'dark'
                                  ? yellow[300]
                                  : yellow[700],
                            }}
                          />
                        )}
                      </div>
                      {systemProperties.useTemplateIconRightSide ===
                        'enable' && (
                        <div style={{ marginRight: 0 }}>
                          {renderActionBt(t)}
                        </div>
                      )}
                    </Stack>
                  ))}
                </div>
              </div>
              <div
                style={{
                  width: '67%',
                  paddingLeft: 10,
                  // marginTop: '-27px',
                  overflow: 'auto',
                  fontSize: 16,
                }}
              >
                {templateDetial && (
                  <div style={{ float: 'right' }}>
                    {user.code === selectedTemplate.owner && (
                      <Button
                        onClick={() => {
                          setOriginalName(selectedTemplate.name)
                          setSaveTemplateDialog(prev => ({
                            ...prev,
                            show: true,
                            data: {
                              id: selectedTemplate.id,
                              templateName: selectedTemplate.name,
                              templateDesc: selectedTemplate.desc || '',
                              type: selectedTemplate.type || 'Private',
                              owner: selectedTemplate.owner,
                              content: selectedTemplate.content,
                            },
                          }))
                        }}
                        variant='contained'
                        size='small'
                        startIcon={<EditIcon />}
                        color='secondary'
                        sx={{
                          mr: 1,
                        }}
                      >
                        Edit Template
                      </Button>
                    )}

                    <Button
                      onClick={() => {
                        appendTemplate(
                          editorRef,
                          selectedTemplate.content,
                          'template'
                        )
                        handleClose()
                      }}
                      variant='contained'
                      size='small'
                      startIcon={<RedoIcon />}
                    >
                      Use Template
                    </Button>
                  </div>
                )}
                <div style={{ marginTop: '-22px' }}>{templateDetial}</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={saveTemplateDialog.show}
        onClose={() => setSaveTemplateDialog(defaultTemplateForm)}
        maxWidth='lg'
      >
        <DialogTitle
          sx={{
            ...dialogTitleStyle,
            display: 'flex',
            justifyContent: 'space-between',
            height: 50,
          }}
        >
          <div style={{ marginTop: 0 }}>Edit Template</div>
          {/* <div style={{ marginRight: 10, marginBottom: 0, marginTop: 0 }}>
            {renderActionBt(saveTemplateDialog.data, 'large')}
          </div> */}
        </DialogTitle>
        <Divider />
        <DialogContent
          sx={{
            bgcolor: theme => MODE[theme.palette.mode].dialog.body,
            pl: 1,
            pr: 1,
          }}
        >
          <div style={{ display: 'flex', marginTop: '-10px' }}>
            <TextField
              label='Name'
              variant='outlined'
              size='small'
              margin='dense'
              required
              name='templateName'
              value={saveTemplateDialog.data.templateName}
              onChange={handleFormChange}
              autoFocus
              sx={{ ...btr, ...inputStyle2, mt: 0.5, flexGrow: 1 }}
            />
            <TextField
              label='Description'
              variant='outlined'
              size='small'
              margin='dense'
              name='templateDesc'
              value={saveTemplateDialog.data.templateDesc}
              onChange={handleFormChange}
              sx={{ ...btr, ...inputStyle2, mt: 0.5, flexGrow: 1 }}
              InputLabelProps={{ shrink: true }}
            />
            <FormControl
              size='small'
              sx={{ ...btr, ...inputStyle2, mt: 0.5, minWidth: 115 }}
            >
              <InputLabel>Type</InputLabel>
              <Select
                name='type'
                value={saveTemplateDialog.data.type}
                onChange={handleFormChange}
                autoWidth
                label='Type'
              >
                <MenuItem value='Private'>Private</MenuItem>
                <MenuItem value='Public'>Public</MenuItem>
                <MenuItem value='Favorite'>Favorite</MenuItem>
              </Select>
            </FormControl>
          </div>
          <Stack direction='row' justifyContent='center' sx={{ mt: 1 }}>
            <Editor
              key={theme}
              onInit={(evt, editor) => (editorTemplateRef.current = editor)}
              // value={content}
              initialValue={saveTemplateDialog.data.content}
              // disabled={!statusBtn && form.type !== 'Public'}
              init={{
                selector: 'textarea',
                browser_spellcheck: true,
                resize: false,
                force_br_newlines: true,
                // force_p_newlines: false,
                forced_root_block: false,
                height: elHeight + 'px',
                width: '960px',
                menubar: false,
                plugins: tbPlugins,
                nonbreaking_force_tab: true,
                toolbar: tbOptions,
                content_style: defaultContentStyle.replace(
                  '}',
                  `min-height: ${elHeight - 135}px;color: ${
                    reportFontColor[theme]
                  };background-color: ${reportBgColor[theme]};}`
                ),
                ...editorSkin,
                // style_formats: [
                //   { title: 'Bold text', inline: 'b' },
                //   {
                //     title: 'Red text',
                //     inline: 'span',
                //     styles: { color: '#ff0000' },
                //   },
                // ],
                paste_preprocess: async function (plugin, args) {
                  args.content = args.content.replace(/\t/g, TAB_SPACE)
                  args.content = args.content.replaceAll('  ', '&nbsp; &nbsp; ')
                  args.content = cleanUpContent(args.content, 'template')
                },
                setup: function (editor) {
                  editor.on('keydown', function (e) {
                    if (e.shiftKey && e.key === '<') {
                      console.log('capture <')
                      editor.execCommand('mceInsertContent', false, '&lt; ')
                      e.preventDefault()
                    }

                    if (e.code === 'Tab') {
                      editor.execCommand('mceInsertContent', false, TAB_SPACE)
                      e.preventDefault()
                    }
                  })
                  editor.on('focus', function () {
                    // editor.execCommand('mceInsertContent', false, '1')
                  })
                },
              }}
              onEditorChange={() => {
                // backupContentRef.current.value = content
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{
            pt: 0,
            pl: 1,
            pr: 1,
            bgcolor: theme => MODE[theme.palette.mode].dialog.body,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Button
            variant='contained'
            startIcon={<DeleteForeverIcon />}
            onClick={() => {
              confirm({
                title: `Confirm to delete template "${saveTemplateDialog.data.templateName}" ?`,
                confirmationButtonProps: { autoFocus: true },
                dialogProps: {
                  maxWidth: 'sm',
                  // PaperProps: { sx: dialogStyle },
                },
              })
                .then(async () => {
                  await axios.delete(API.REPORT_TEMPLATE, {
                    params: {
                      id: saveTemplateDialog.data.id,
                      name: saveTemplateDialog.data.templateName,
                    },
                  })
                  setTemplateDetail(null)
                  setSaveTemplateDialog(defaultTemplateForm)
                  getTemplateList()
                })
                .catch(() => {})
            }}
            color='error'
          >
            Delete
          </Button>
          <div>
            <Button
              sx={btr}
              variant='outlined'
              onClick={() => setSaveTemplateDialog(defaultTemplateForm)}
            >
              Cancel
            </Button>
            <Button
              variant='contained'
              sx={{ ...btr, ...btStyle }}
              startIcon={<SaveIcon />}
              onClick={handleUpdateTemplate}
            >
              Update
            </Button>
            <Button
              variant='contained'
              sx={btStyle}
              startIcon={<SaveAsIcon />}
              onClick={() => handleUpdateTemplate('use')}
            >
              Update & Use
            </Button>
          </div>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default ReportEditor

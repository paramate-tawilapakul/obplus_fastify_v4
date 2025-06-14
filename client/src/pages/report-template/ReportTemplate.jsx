import { useEffect, useState, useContext, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import { Editor } from '@tinymce/tinymce-react'
import axios from 'axios'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import LoadingButton from '@mui/lab/LoadingButton'
// import Typography from '@mui/material/Typography'
import { useConfirm } from 'material-ui-confirm'
import DeleteIcon from '@mui/icons-material/Delete'
import Autocomplete from '@mui/material/Autocomplete'
import AddIcon from '@mui/icons-material/Add'
import SaveIcon from '@mui/icons-material/Save'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import AutoModeIcon from '@mui/icons-material/AutoMode'

import DataContext from '../../context/data/dataContext'
import Layout from '../../components/layout/Layout'
import {
  API,
  APP_CONFIG,
  APP_ROUTES,
  defaultContentStyle,
  dialogStyle,
  reportBgColor,
  reportFontColor,
  STORAGE_NAME,
  TAB_SPACE,
} from '../../config'
import { hasPermission, checkLogin, getShowPublic } from '../../utils'
import SnackBarWarning from '../../components/page-tools/SnackBarWarning'
import { qs } from '../../utils/domUtils'
import {
  cleanUpContent,
  replacePwithBR,
  reFormatSpace,
} from '../report/report-utils'
import { inputStyle2, btStyle } from '../../components/page-tools/form-style'

const defaultForm = {
  templateName: '',
  templateDesc: '',
  type: 'Private',
  modality: '',
  bodypart: '',
  gender: 'B',
  owner: '',
}

const btr = {
  mr: 0.5,
}

export default function ReportTemplate() {
  const { user, theme } = useContext(DataContext)
  const confirm = useConfirm()
  const history = useHistory()

  const [templateList, setTemplateList] = useState([])
  const [statusBtn, setStatusBtn] = useState(false)
  const [loadingBtn, setLoadingBtn] = useState(false)
  const [isCreate, setIsCreate] = useState(false)
  const [templateSelected, setTemplateSelected] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [content, setContent] = useState('')
  // const [prevType, setPrevType] = useState('')
  const [checkFocus, setCheckFocus] = useState(false)
  const [random, setRandom] = useState(Math.random())
  const [snackWarning, setSnackWarning] = useState({
    show: false,
    message: null,
    autoHideDuration: 3000,
  })

  const elHeight = window.innerHeight - 300

  const [showPublic, setShowPublic] = useState(getShowPublic())

  const editorRef = useRef(null)
  const backupContentRef = useRef(null)

  const editorSkin =
    theme === 'dark' ? { skin: 'dark', skin_url: '/js/skins/dark' } : {}

  const tbOptions =
    'undo redo | ' +
    'bold italic underline  | ' + //strikethrough
    // 'alignleft aligncenter alignright alignjustify | styleselect | ' +
    // 'alignleft aligncenter alignright alignjustify  | ' +
    // 'bullist numlist superscript subscript ' +
    ' | ' +
    ' pastetext | ' +
    'removeformat '

  const tbPlugins = [
    'spellchecker advlist autolink lists charmap print anchor',
    'searchreplace',
    'paste nonbreaking ',
  ]

  const focusInputField = parent => {
    if (!checkFocus) {
      if (parent) {
        const name = qs('input[name="templateName"]', parent)
        setTimeout(() => {
          name.focus()
          setCheckFocus(true)
        }, 10)
      }
    }
  }

  async function getReportTemplate(show = true) {
    const response = await axios.get(API.REPORT_TEMPLATE, {
      params: { showPublic: show },
    })

    setTemplateList(response.data.data)
  }

  useEffect(() => {
    checkLogin()
    if (user) {
      hasPermission('allowReportTemplate', history, user)
    }
    if (user && user.allowWorklist === '1') {
      getReportTemplate(showPublic)
      setForm(defaultForm)
    } else if (user && user.allowWorklist !== '1') {
      window.location.href = `/${APP_CONFIG.APP_NAME}/${APP_ROUTES.signIn}`
    }

    return () => {}

    // eslint-disable-next-line
  }, [user])

  useEffect(() => {
    const backupContent = backupContentRef.current
    if (backupContent?.value) {
      // console.log('theme setPatient')
      setContent(backupContent.value)
    }

    return () => {}
  }, [theme])

  function handleChange(v) {
    if (v) {
      // setPrevType(v.type)
      setRandom(Math.random())
      // console.log('before', v.content.length)
      // console.log('before', v.content)
      let newContent = cleanUpContent(
        replacePwithBR(
          v.content.replace(
            /&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;/g,
            TAB_SPACE
          )
        ),
        'template'
      )
      // console.log('after', newContent.length)
      // console.log(newContent)
      setContent(newContent)
      editorRef.current.setContent(newContent)
      // setContent(
      //   v.content.replace(
      //     /&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;/g,
      //     TAB_SPACE
      //   )
      // )
      // editorRef.current.setContent(v.content)
      if (user.code === v.owner) {
        setStatusBtn(true)
      } else {
        setStatusBtn(false)
      }
      setForm(prev => {
        return {
          ...prev,
          templateName: v.name.trim(),
          templateDesc: v.desc ? v.desc.trim() : '',
          type: v.type,
          owner: v.owner,
        }
      })
      setTemplateSelected(v)
    } else {
      reset()
    }
  }

  function handleDelete() {
    confirm({
      title: `Delete template "${templateSelected.name}" ?`,
      confirmationButtonProps: { autoFocus: true },
      dialogProps: {
        maxWidth: 'sm',
        PaperProps: { sx: dialogStyle },
      },
    })
      .then(async () => {
        await axios.delete(API.REPORT_TEMPLATE, {
          params: {
            id: templateSelected.id,
            name: templateSelected.name,
          },
        })

        setSnackWarning(prev => ({
          ...prev,
          show: true,
          message: `Delete template "${templateSelected.name}" completed`,
          severity: 'success',
        }))

        reset()
        getReportTemplate(showPublic)
      })
      .catch(() => {})
  }

  async function handleSave() {
    if (form.templateName.trim() === '') {
      return setSnackWarning({
        ...snackWarning,
        show: true,
        message: 'Template name is required!',
        severity: 'warning',
      })
    }

    if (templateSelected) {
      // Edit template
      // const originalName = templateSelected.name
      // check = templateList
      //   .filter(t => t.name !== originalName)
      //   .find(t => t.name === form.templateName.trim())
      // if (check) {
      //   return setSnackWarning(prev => ({
      //     ...prev,
      //     show: true,
      //     message: 'This template name already exist!',
      //     severity: 'warning',
      //   }))
      // }
    } else {
      // Create template
      // check = templateList.find(t => t.name === form.templateName.trim())
      // if (check) {
      //   return setSnackWarning(prev => ({
      //     ...prev,
      //     show: true,
      //     message: 'This template name already exist!',
      //     severity: 'warning',
      //   }))
      // }
    }

    if (editorRef.current.getContent({ format: 'text' }).trim() === '') {
      return setSnackWarning(prev => ({
        ...prev,
        show: true,
        message: 'Template content is required!',
        severity: 'warning',
      }))
    }

    let content = editorRef.current.getContent()
    content = reFormatSpace(cleanUpContent(content, 'template'))

    const body = {
      content,
      id: templateSelected?.id || null,
      ...form,
    }
    // console.log(body)

    await axios.post(API.REPORT_TEMPLATE, body)

    setSnackWarning(prev => ({
      ...prev,
      show: true,
      message: 'Save template completed',
      severity: 'success',
    }))

    reset()
    getReportTemplate(showPublic)
  }

  function handleFormChange(e) {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  function reset() {
    backupContentRef.current.value = ''
    editorRef.current.setContent('')
    setStatusBtn(false)
    setIsCreate(false)
    setTemplateSelected(null)
    setForm(defaultForm)
    setContent('')
    // setPrevType('')
    setCheckFocus(false)
  }

  async function cleanUpTemplate() {
    setLoadingBtn(true)
    const res = await axios.put(API.REPORT_TEMPLATE)
    if (res.data.data.success) {
      setSnackWarning(prev => ({
        ...prev,
        show: true,
        message: 'Clean up all Templates completed',
        severity: 'success',
      }))
      await getReportTemplate(showPublic)
      setForm(defaultForm)
    } else {
      setSnackWarning(prev => ({
        ...prev,
        show: true,
        message: 'Clean up fail',
        severity: 'error',
      }))
    }
    setLoadingBtn(false)
  }

  return (
    <Layout>
      <div style={{ position: 'absolute', right: 0 }}>
        {user?.code === 'admin' && (
          <LoadingButton
            startIcon={<AutoModeIcon />}
            loading={loadingBtn}
            variant='contained'
            color='success'
            size='small'
            sx={{
              mr: 1,
            }}
            onClick={cleanUpTemplate}
          >
            Clean Up
          </LoadingButton>
        )}
      </div>
      <Stack direction='row' justifyContent='center'>
        <Paper
          elevation={2}
          sx={{
            p: 1,
            width: 960,
            display: 'flex',
            justifyContent: 'space-between',
            border: theme =>
              theme.palette.mode === 'light' && '1px solid #cccccc',
            backgroundColor: theme =>
              theme.palette.mode === 'light' && '#fffafa',
          }}
        >
          <div
            style={{
              display: 'flex',
              direction: 'column',
              alignItems: 'center',
            }}
          >
            {/* <Typography variant='body1' component='span' sx={{ mr: 1 }}>
              My Templates:
            </Typography> */}
            <FormControl size='small' sx={{ ...inputStyle2, mr: 1 }}>
              <Autocomplete
                size='small'
                disablePortal
                options={templateList}
                value={templateSelected}
                disabled={isCreate}
                sx={{ width: 530 }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(event, values) => {
                  handleChange(values)
                }}
                renderInput={params => (
                  <TextField
                    {...params}
                    size='small'
                    variant='outlined'
                    placeholder='Select template...'
                  />
                )}
              />
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  // value={showPublic}
                  checked={showPublic}
                  onChange={e => {
                    window.localStorage.setItem(
                      STORAGE_NAME.showPublicTemplate,
                      e.target.checked ? '1' : '0'
                    )

                    reset()
                    getReportTemplate(e.target.checked)
                    setShowPublic(e.target.checked)
                  }}
                />
              }
              label='Show Public'
              labelPlacement='end'
            />
          </div>
          <div
            style={{
              display: 'flex',
              direction: 'column',
              alignItems: 'center',
            }}
          >
            {!statusBtn && (
              <Button
                variant='contained'
                color='primary'
                size='small'
                startIcon={<AddIcon />}
                sx={{
                  ...btStyle,
                  mr: 1,
                }}
                onClick={() => {
                  // reset()
                  editorRef.current.setContent('')
                  backupContentRef.current.value = ''
                  setTemplateSelected(null)
                  setStatusBtn(true)
                  setIsCreate(true)
                  setContent('')
                  // setPrevType('')
                  setForm(defaultForm)
                }}
              >
                New
              </Button>
            )}
            {statusBtn && (
              <Button
                variant='contained'
                color='success'
                size='small'
                startIcon={<SaveIcon />}
                sx={{ mr: 1 }}
                onClick={handleSave}
              >
                Save
              </Button>
            )}

            {statusBtn && templateSelected && (
              <Button
                variant='contained'
                color='error'
                size='small'
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
                sx={{ mr: 1 }}
              >
                Delete
              </Button>
            )}

            {statusBtn && (
              <Button
                variant='outlined'
                size='small'
                // startIcon={<DeleteIcon />}
                onClick={reset}
              >
                Cancel
              </Button>
            )}
          </div>
        </Paper>
      </Stack>

      {statusBtn && (
        <Stack direction='row' justifyContent='center'>
          <Paper
            elevation={2}
            sx={{
              p: 1,
              mt: 1,
              width: 960,
              display: 'flex',
              border: theme =>
                theme.palette.mode === 'light' && '1px solid #cccccc',
              backgroundColor: theme =>
                theme.palette.mode === 'light' && '#fffafa',
            }}
          >
            <TextField
              label='Name'
              variant='outlined'
              size='small'
              margin='dense'
              required
              name='templateName'
              value={form.templateName}
              onChange={handleFormChange}
              ref={focusInputField}
              // autoFocus
              sx={{ ...btr, ...inputStyle2, mt: 0.5, flexGrow: 1 }}
            />
            <TextField
              label='Description'
              variant='outlined'
              size='small'
              margin='dense'
              name='templateDesc'
              value={form.templateDesc}
              onChange={handleFormChange}
              sx={{ ...btr, ...inputStyle2, mt: 0.5, flexGrow: 1 }}
              InputLabelProps={{ shrink: true }}
            />
            <FormControl
              size='small'
              margin='dense'
              sx={{ ...btr, ...inputStyle2, mt: 0.5, minWidth: 180 }}
            >
              <InputLabel>Type</InputLabel>
              <Select
                name='type'
                value={form.type}
                onChange={handleFormChange}
                autoWidth
                label='Type'
              >
                <MenuItem value='Private'>Private</MenuItem>
                <MenuItem value='Public'>Public</MenuItem>
                <MenuItem value='Favorite'>Favorite</MenuItem>
              </Select>
            </FormControl>
          </Paper>
        </Stack>
      )}

      <Stack direction='row' justifyContent='center' sx={{ mt: 1 }}>
        <Editor
          key={theme + random}
          onInit={(evt, editor) => (editorRef.current = editor)}
          // value={content}
          initialValue={content}
          disabled={!statusBtn && form.type !== 'Public'}
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
              `min-height: 350px;color: ${reportFontColor[theme]};background-color: ${reportBgColor[theme]};}`
            ),
            ...editorSkin,
            // external_plugins:
            //   systemProperties?.appMode === 'production'
            //     ? {
            //         nanospell:
            //           systemProperties?.dictionaryServer +
            //           '/nanospell/plugin.js',
            //       }
            //     : undefined,
            // nanospell_server: 'php',
            // nanospell_dictionary: 'en,en_med',
            // nanospell_autostart: false,
            // style_formats: [
            // { title: 'Styles' },
            // { title: 'Bold text', inline: 'b' },
            // {
            //   title: 'Red text',
            //   inline: 'span',
            //   styles: { color: '#ff0000' },
            // },
            // {
            //   title: 'Red header',
            //   block: 'h1',
            //   styles: { color: '#ff0000' },
            // },
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
          onEditorChange={content => {
            backupContentRef.current.value = content
          }}
        />
      </Stack>

      <SnackBarWarning
        snackWarning={snackWarning}
        setSnackWarning={setSnackWarning}
        vertical='top'
        horizontal='center'
      />
      <input type='hidden' ref={backupContentRef} name='backupContent' />
    </Layout>
  )
}

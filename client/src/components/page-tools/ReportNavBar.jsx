import { useContext, useState } from 'react'
import { useHistory } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import ImageIcon from '@mui/icons-material/Image'
import NoteAltIcon from '@mui/icons-material/NoteAlt'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
// import CheckIcon from '@mui/icons-material/Check'
import ButtonGroup from '@mui/material/ButtonGroup'
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight'
import Box from '@mui/material/Box'
import PrintIcon from '@mui/icons-material/Print'
// import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import TaskAltIcon from '@mui/icons-material/TaskAlt'

import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from '../../pages/report/vfs_fonts'
pdfMake.vfs = pdfFonts

import { API, APP_ROUTES, MODE, reqHeader } from '../../config'
import {
  calculateAge,
  reFormatDate,
  reFormatTime,
  convertStatus,
} from '../../utils'
import DataContext from '../../context/data/dataContext'
import { green, orange } from '@mui/material/colors'
import axios from 'axios'
import { getDocDef, openImage, printPdf } from '../../pages/report/report-utils'
import '../../pages/report/style.css'
import { sendToReportSearch } from '../../pages/report/helper'
import BackDrop from '../../components/page-tools/BackDrop'

import SnackBarWarning from './SnackBarWarning'
import ViewPDF from './ViewPDF'

const mr = {
  display: 'flex',
  flexDirection: 'column',
  mr: 2.1,
  color: theme => MODE[theme.palette.mode].dataGrid.font,
  whiteSpace: 'nowrap',
}
const btr = {
  my: 0.8,
  mr: 0.5,
}
const navBt = {
  fontSize: 16,
  color: theme => MODE[theme.palette.mode].dataGrid.font,
}
const btStyle0 = {
  color: '#ffffff',
  backgroundColor: MODE.light.buttonPrint,
  ':hover': {
    bgcolor: MODE.light.buttonPrintHover,
  },
}
const btStyle1 = {
  color: '#ffffff',
  backgroundColor: MODE.light.buttonPreview,
  ':hover': {
    bgcolor: MODE.light.buttonPreviewHover,
  },
}
const btStyle2 = {
  color: '#ffffff',
  backgroundColor: MODE.light.buttonImage,
  ':hover': {
    bgcolor: MODE.light.buttonImageHover,
  },
}
const btStyle3 = {
  color: '#ffffff',
  backgroundColor: MODE.light.buttonPrelim,
  ':hover': {
    bgcolor: MODE.light.buttonPrelimHover,
  },
}
const btStyle4 = {
  color: '#ffffff',
  backgroundColor: MODE.light.buttonVerify,
  ':hover': {
    bgcolor: MODE.light.buttonVerifyHover,
  },
}

const message = {
  prelim: 'Preliminary was successfully',
  verify: 'Verified successfully',
}

const ReportNavBar = () => {
  const {
    patient,
    // setPatient,
    setTemplateNotification,
    doctor,
    user,
    systemProperties,
  } = useContext(DataContext)

  const history = useHistory()
  let link = history.location.pathname.split('/')
  link = link[2]
  let status = patient?.status

  const [patientStatus, setPatientStatus] = useState(patient?.status)
  const [openBackDrop, setOpenBackDrop] = useState(false)

  const [pdfDataUrl, setPdfDataUrl] = useState(null)
  const [snackWarning, setSnackWarning] = useState({
    show: false,
    message: null,
    autoHideDuration: 2000,
    severity: 'success',
    bgcolor: null,
  })

  const bg = {
    bgcolor: theme => (theme.palette.mode === 'dark' ? '#2F3438' : '#dde1e3'),
  }

  let patientInfoAcitve = {}
  let obInfoAcitve = {}

  if (APP_ROUTES.patientInfo === link) {
    patientInfoAcitve = bg
  }
  if (APP_ROUTES.report === link) {
    obInfoAcitve = bg
  }

  async function previewReport() {
    const [docDef] = await getDocDef(
      'preview',
      patient,
      systemProperties,
      doctor,
      user,
      setTemplateNotification
    )

    const pdfDocGenerator = pdfMake.createPdf(docDef)
    pdfDocGenerator.getDataUrl(dataUrl => {
      setPdfDataUrl(dataUrl)
    })
  }

  async function signReport(type) {
    const api = type === 'verify' ? API.VERIFY : API.PRELIM

    const [docDef, diagContent] = await getDocDef(
      type,
      patient,
      systemProperties,
      doctor,
      user,
      setTemplateNotification
    )
    const pdfDocGenerator = pdfMake.createPdf(docDef)

    let signer = {}
    signer['consultant'] = docDef.consultList?.map(c => ({
      code: c.radName,
      name: c.radDesc,
    }))
    let prelim = docDef.prelimBy?.slice(0, -1)?.split('(') || null
    let verify = docDef.verifyBy?.slice(0, -1)?.split('(') || null
    signer['reportedBy'] = { code: prelim[1], name: prelim[0].trim() }
    signer['verifiedBy'] =
      type === 'verify' ? { code: verify[1], name: verify[0].trim() } : null

    const bodyData = {
      hn: patient.hn,
      accession: patient.accession,
    }

    pdfDocGenerator.getBuffer(async buffer => {
      // pdfDocGenerator.getDataUrl(async dataUrl => {
      // console.log(buffer)
      try {
        const response = await axios.post(
          api,
          { pdfBuffer: buffer, bodyData },
          // { bodyData },

          reqHeader
        )

        if (response.data.data.timestamp) {
          // SEND DATA TO REPORT SEARCH API
          sendToReportSearch(
            patient,
            diagContent,
            user,
            systemProperties,
            response.data.data.timestamp,
            docDef.indication,
            signer
          )

          setSnackWarning(prev => ({
            ...prev,
            show: true,
            icon:
              type === 'prelim' ? (
                <NoteAltIcon fontSize='large' />
              ) : (
                <TaskAltIcon fontSize='large' />
              ),
            bgcolor:
              type === 'prelim'
                ? btStyle3[':hover'].bgcolor
                : btStyle4[':hover'].bgcolor,
            component: (
              <div>
                <div>{message[type]}</div>
                <div>By {user.desc}</div>
              </div>
            ),
          }))

          // setPatient({ ...patient, status: type === 'verify' ? 'R' : 'D' })
          setPatientStatus(type === 'verify' ? 'R' : 'D')

          if (
            systemProperties.previewAfterVerified === 'YES'
            // && systemProperties.appMode === 'production'
          ) {
            setTimeout(() => {
              previewReport()
            }, 500)
          }
        } else {
          setSnackWarning(prev => ({
            ...prev,
            show: true,
            severity: 'error',
            icon: <ErrorOutlineIcon fontSize='large' />,
            component: (
              <div
                style={{
                  textTransform: 'capitalize',
                  marginTop: 5,
                }}
              >
                {type} fail!, please try again.
              </div>
            ),
          }))
        }
      } catch (error) {
        console.log(error)
      }
    })
  }

  return (
    patient &&
    user && (
      <Paper
        elevation={3}
        sx={{
          // position: 'sticky',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 0,
          bgcolor: theme => MODE[theme.palette.mode].tab.active,
          minHeight: 47,
          minWidth: 1050,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
        >
          <ButtonGroup disableRipple variant='text' sx={{ height: 47 }}>
            {patient && (
              <>
                <Button
                  disableRipple
                  sx={navBt}
                  onClick={() => history.push(`${APP_ROUTES.worklist}`)}
                >
                  Worklist
                </Button>
                <Button
                  disableRipple
                  sx={{
                    ...navBt,
                    ...patientInfoAcitve,
                  }}
                  onClick={() =>
                    history.push(
                      `${APP_ROUTES.patientInfo}?accession=${patient.accession}`
                    )
                  }
                >
                  {APP_ROUTES.patientInfo === link && '>'} Patient Info
                </Button>
              </>
            )}
            {patient && APP_ROUTES.patientInfo === link && (
              <div
                style={{
                  display: 'flex',
                  paddingLeft: 10,
                  paddingTop: 3,
                }}
              >
                <Typography variant='body1' sx={{ ...mr }}>
                  <strong style={{ fontSize: 15 }}>Name </strong>
                  <span style={{ marginTop: '-4px' }}>{patient.name}</span>
                </Typography>
                <Typography variant='body1' sx={{ ...mr }}>
                  <strong style={{ fontSize: 15 }}>HN </strong>
                  <span style={{ marginTop: '-4px' }}>{patient.hn}</span>
                </Typography>
                <Typography variant='body1' sx={{ ...mr }}>
                  <strong style={{ fontSize: 15 }}>ACC.No </strong>
                  <span style={{ marginTop: '-4px' }}>{patient.accession}</span>
                </Typography>
                <Typography variant='body1' sx={{ ...mr }}>
                  <strong style={{ fontSize: 15 }}>Age </strong>
                  <span style={{ marginTop: '-4px' }}>
                    {calculateAge(patient.birthDate)}
                  </span>
                </Typography>
                <Typography variant='body1' sx={{ ...mr }}>
                  <strong style={{ fontSize: 15 }}>Exam Date </strong>
                  <span style={{ marginTop: '-4px' }}>
                    {reFormatDate(patient.studyDate)}{' '}
                    {reFormatTime(patient.studyTime)}
                  </span>
                </Typography>
                <Typography variant='body1' sx={{ ...mr }}>
                  <strong style={{ fontSize: 15 }}>Status </strong>
                  <span style={{ marginTop: '-4px' }}>
                    {convertStatus(status)}
                  </span>
                </Typography>
              </div>
            )}
            {patient && APP_ROUTES.report === link && (
              <Button sx={{ ...navBt, ...obInfoAcitve }}>
                {APP_ROUTES.report === link && '>'}{' '}
                {patient.obStudyType === '1' ? 'Obstetric' : 'Gynaecology'}
              </Button>
            )}
          </ButtonGroup>
          {patient && APP_ROUTES.report === link && (
            <div style={{ display: 'flex', marginTop: 7, marginLeft: 10 }}>
              <Box
                sx={{
                  color: theme =>
                    ['N', 'D'].includes(patientStatus) &&
                    theme.palette.mode === 'dark'
                      ? orange[400]
                      : ['N', 'D'].includes(patientStatus) &&
                        theme.palette.mode === 'light'
                      ? orange[800]
                      : patientStatus === 'R' && theme.palette.mode === 'dark'
                      ? green[300]
                      : green[600],
                }}
              >
                <strong>{convertStatus(patientStatus)}</strong>
              </Box>
              <div>
                <KeyboardDoubleArrowRightIcon />
              </div>
              <Box
                sx={{
                  color: theme => MODE[theme.palette.mode].dataGrid.font,
                  fontWeight: 'bold',
                }}
              >
                {patient.name}, HN: {patient.hn}
              </Box>
            </div>
          )}
        </div>
        {APP_ROUTES.report === link && (
          <div>
            {['D', 'R'].includes(patientStatus) && (
              <Button
                sx={{ ...btr, ...btStyle0 }}
                size='small'
                variant='contained'
                startIcon={<PrintIcon />}
                onClick={() => {
                  printPdf(
                    // patientStatus === 'R' ? 'verify' : 'prelim',
                    'worklist',
                    patient,
                    systemProperties,
                    doctor,
                    user,
                    true,
                    setOpenBackDrop
                  )

                  if (systemProperties.appMode === 'production')
                    history.push(`${APP_ROUTES.worklist}`)
                }}
              >
                Print
              </Button>
            )}
            <Button
              sx={{ ...btr, ...btStyle1 }}
              size='small'
              variant='contained'
              startIcon={<PictureAsPdfIcon />}
              onClick={previewReport}
            >
              Preview
            </Button>
            <Button
              sx={{ ...btr, ...btStyle2 }}
              size='small'
              variant='contained'
              startIcon={<ImageIcon />}
              onClick={() =>
                openImage(systemProperties.uniwebAddress, patient.accession)
              }
            >
              Image
            </Button>
            <Button
              sx={{ ...btr, ...btStyle3 }}
              size='small'
              variant='contained'
              startIcon={<NoteAltIcon />}
              onClick={() => signReport('prelim')}
            >
              Prelim
            </Button>
            {[1, 2].includes(user.typeId) && (
              <Button
                sx={{ ...btr, ...btStyle4 }}
                size='small'
                variant='contained'
                startIcon={<TaskAltIcon />}
                onClick={() => signReport('verify')}
              >
                Verify
              </Button>
            )}
          </div>
        )}

        <ViewPDF
          status={patientStatus}
          pdfDataUrl={pdfDataUrl}
          setPdfDataUrl={setPdfDataUrl}
          systemProperties={systemProperties}
          page='report'
        />

        <SnackBarWarning
          snackWarning={snackWarning}
          setSnackWarning={setSnackWarning}
          vertical='top'
          horizontal='right'
        />

        <BackDrop openBackDrop={openBackDrop} />
      </Paper>
    )
  )
}

export default ReportNavBar

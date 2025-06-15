import { useEffect, useState } from 'react'

import axios from 'axios'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
// import LoadingButton from '@mui/lab/LoadingButton'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import IconButton from '@mui/material/IconButton'
import RefreshIcon from '@mui/icons-material/Refresh'
import Divider from '@mui/material/Divider'

import {
  API,
  MODE,
  STORAGE_NAME,
  TEMPLATES,
  REPORT_ID,
} from '../../../../config'
import {
  btStyle,
  inputStyle,
} from '../../../../components/page-tools/form-style'
import { sleep } from '../../../../utils'
import { cleanUpForm, getReportId, getRiD, randomMs } from '../../helper'
import SnackBarWarning from '../../../../components/page-tools/SnackBarWarning'
import { initFormSend } from '../../report-utils'

const boxStyle = {
  ml: 0.5,
  // pl: 0.5,
  color: theme => MODE[theme.palette.mode].dataGrid.font,
}

const mrUterus = {
  mr: 1,
  // fontSize: 14,
}

const templateId = TEMPLATES.gynMeasurement.id

const TwoDMesurements = ({ patient }) => {
  const [showEditForm, setShowEditForm] = useState(false)
  const [measurement, setMeasurement] = useState([])
  const [uterus, setUterus] = useState(null)
  const [ovaries, setOvaries] = useState(null)
  const [abnormalities, setAbnormalities] = useState(null)
  const [kidneys, setKidneys] = useState(null)
  const [showUnit, setShowUnit] = useState(false)

  const [loading, setLoading] = useState(false)
  const [dataForm, setDataForm] = useState([])
  const [dataFormSend, setDataFormSend] = useState(null)
  const [defaultDataFormSend, setDefaultDataFormSend] = useState(null)
  const [snackWarning, setSnackWarning] = useState({
    show: false,
    message: null,
    autoHideDuration: 1500,
    severity: null,
  })

  useEffect(() => {
    resetData()
    initData()

    return () => {}
    // eslint-disable-next-line
  }, [patient])

  function resetData() {
    setShowEditForm(false)
    setMeasurement([])
    setDataForm([])
    setUterus(null)
    setOvaries(null)
    setAbnormalities(null)
    setKidneys(null)
  }

  function initData() {
    try {
      setLoading(true)
      const rand = randomMs()
      sleep(rand).then(async () => {
        if (!REPORT_ID[TEMPLATES.gynMeasurement.name][patient.currentFetus]) {
          // console.log('******getReportId()', rand)
          const id = await getReportId(
            patient.accession,
            patient.currentFetus,
            templateId
          )

          REPORT_ID[TEMPLATES.gynMeasurement.name][patient.currentFetus] = id
        }

        fetchMesurement()
      })
    } catch (error) {
      console.log(error)
    }
  }

  async function fetchMesurement() {
    try {
      const res = await axios.get(API.REPORT_CONTENT, {
        params: {
          reportId: getRiD(TEMPLATES.gynMeasurement.name, patient.currentFetus),
        },
      })

      // console.log('DATA:', res.data.data)

      setMeasurement(res.data.data)
      getReportForm(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  async function getReportForm(data) {
    const [formSend, form] = await initFormSend(
      data,
      getRiD(TEMPLATES.gynMeasurement.name, patient.currentFetus),
      templateId
    )

    setDataFormSend(formSend)
    setDefaultDataFormSend(formSend)
    // console.log('DATA SEND:', formSend)
    // console.log('FORM:', form)
    setDataForm(form)
    fillMeasurements(data)
    setLoading(false)
  }

  function handleEditClick() {
    setShowEditForm(true)
  }

  async function handleSaveClick() {
    try {
      setShowEditForm(false)
      let newForm = cleanUpForm(dataFormSend)
      // console.log(newForm)

      const res = await axios.post(API.REPORT_CONTENT, { reportData: newForm })
      if (res.data.data) {
        setSnackWarning(prev => ({
          ...prev,
          show: true,
          message: 'Save Completed',
          severity: 'success',
        }))
        setLoading(true)
        await fetchMesurement()
      }
    } catch (error) {
      console.log(error)
    }
  }

  function resetForm() {
    setDataFormSend(defaultDataFormSend)
    setShowEditForm(false)
  }

  function fillMeasurements(measurement) {
    let tempShowUnit = false

    const Uterus = measurement.filter(
      mes => mes.refValueId >= 555 && mes.refValueId <= 558
    )
    const Cervix = measurement.filter(
      mes => mes.refValueId >= 559 && mes.refValueId <= 562
    )
    setUterus({
      Uterus,
      Cervix,
    })
    if (Uterus.length > 0 || Cervix.length > 0) tempShowUnit = true

    const LtOvary = measurement.filter(
      mes => mes.refValueId >= 564 && mes.refValueId <= 567
    )
    const RtOvary = measurement.filter(
      mes => mes.refValueId >= 568 && mes.refValueId <= 571
    )
    setOvaries({
      'Lt.Ovary': LtOvary,
      'Rt.Ovary': RtOvary,
    })
    if (LtOvary.length > 0 || RtOvary.length > 0) tempShowUnit = true

    const AbnSize = measurement.filter(
      mes => mes.refValueId >= 572 && mes.refValueId <= 575
    )

    setAbnormalities({
      'Abn.Size': AbnSize,
    })
    if (AbnSize.length > 0) tempShowUnit = true

    const PreSize = measurement.filter(
      mes => mes.refValueId >= 576 && mes.refValueId <= 579
    )
    const PostSize = measurement.filter(
      mes => mes.refValueId >= 580 && mes.refValueId <= 583
    )
    const LtKidney = measurement.filter(
      mes => mes.refValueId >= 584 && mes.refValueId <= 587
    )
    const RtKidney = measurement.filter(
      mes => mes.refValueId >= 588 && mes.refValueId <= 591
    )
    setKidneys({
      'Pre.Size': PreSize,
      'Post.Size': PostSize,
      'Lt.Kidney': LtKidney,
      'Rt.Kidney': RtKidney,
    })
    if (
      PreSize.length > 0 ||
      PostSize.length > 0 ||
      LtKidney.length > 0 ||
      RtKidney.length > 0
    )
      tempShowUnit = true

    setShowUnit(tempShowUnit)
  }

  return (
    <>
      {patient && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          {!showEditForm && (
            <div
              style={{
                display: 'flex',
                width: '100%',
                justifyContent: 'flex-start',
                alignItems: 'center',
                alignContent: 'center',
                paddingLeft: 5,
              }}
            >
              <IconButton
                title='Reload'
                onClick={initData}
                sx={{
                  color: theme => MODE[theme.palette.mode].buttonReload,
                  mr: 0.5,
                }}
                aria-label='reload'
                component='span'
              >
                <RefreshIcon />
              </IconButton>
              <Button
                variant='contained'
                startIcon={<EditIcon />}
                size='small'
                sx={{ ...btStyle }}
                onClick={handleEditClick}
              >
                Edit
              </Button>
            </div>
          )}
          {showEditForm && (
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                paddingLeft: 5,
                paddingTop: 5,
              }}
            >
              <Button
                variant='outlined'
                size='small'
                sx={{ mr: 1 }}
                onClick={resetForm}
              >
                Cancel
              </Button>
              <Button
                variant='contained'
                startIcon={<CheckIcon />}
                size='small'
                sx={{ ...btStyle }}
                onClick={handleSaveClick}
              >
                Save
              </Button>
            </div>
          )}
          {!showEditForm && (
            <Box
              sx={{
                ...boxStyle,
                mt: 0.5,
                width: '100%',
                minWidth: 348,
                pr: 1,
              }}
            >
              {loading && <LinearProgress sx={{ mt: 0.5 }} />}
              <div style={{ display: loading && 'none', marginTop: 5 }}>
                <Fade in={!loading ? true : false} timeout={400}>
                  <div>
                    {showUnit && (
                      <>
                        <Box>
                          <table style={{ width: '100%' }}>
                            <tbody>
                              <tr>
                                <td
                                  style={{
                                    width: '30%',
                                  }}
                                ></td>
                                <td
                                  style={{
                                    width: '17.5%',
                                    textAlign: 'right',
                                  }}
                                >
                                  <Typography
                                    component='div'
                                    sx={{
                                      ...mrUterus,
                                    }}
                                    variant='body1'
                                  >
                                    Length
                                    <Box
                                      sx={{
                                        fontSize: 12,
                                        mt: -0.5,
                                        color: theme =>
                                          theme.palette.mode === 'dark'
                                            ? '#89CFF0'
                                            : 'blue',
                                      }}
                                    >
                                      (cm)
                                    </Box>
                                  </Typography>
                                </td>
                                <td
                                  style={{
                                    width: '17.5%',
                                    textAlign: 'right',
                                  }}
                                >
                                  <Typography
                                    component='div'
                                    sx={{
                                      ...mrUterus,
                                    }}
                                    variant='body1'
                                  >
                                    AP
                                    <Box
                                      sx={{
                                        fontSize: 12,
                                        mt: -0.5,
                                        color: theme =>
                                          theme.palette.mode === 'dark'
                                            ? '#89CFF0'
                                            : 'blue',
                                      }}
                                    >
                                      (cm)
                                    </Box>
                                  </Typography>
                                </td>
                                <td
                                  style={{
                                    width: '17.5%',
                                    textAlign: 'right',
                                  }}
                                >
                                  <Typography
                                    component='div'
                                    sx={{
                                      ...mrUterus,
                                    }}
                                    variant='body1'
                                  >
                                    Width
                                    <Box
                                      sx={{
                                        fontSize: 12,
                                        mt: -0.5,
                                        color: theme =>
                                          theme.palette.mode === 'dark'
                                            ? '#89CFF0'
                                            : 'blue',
                                      }}
                                    >
                                      (cm)
                                    </Box>
                                  </Typography>
                                </td>
                                <td
                                  style={{
                                    width: '17.5%',
                                    textAlign: 'right',
                                  }}
                                >
                                  <Typography
                                    component='div'
                                    sx={{
                                      ...mrUterus,
                                    }}
                                    variant='body1'
                                  >
                                    Volumn
                                    <Box
                                      sx={{
                                        fontSize: 12,
                                        mt: -0.5,
                                        color: theme =>
                                          theme.palette.mode === 'dark'
                                            ? '#89CFF0'
                                            : 'blue',
                                      }}
                                    >
                                      (cc)
                                    </Box>
                                  </Typography>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </Box>
                        <Divider />
                      </>
                    )}
                    <>
                      {uterus &&
                        (uterus['Cervix']?.length > 0 ||
                          uterus['Uterus']?.length > 0) && (
                          <>
                            <Box style={{ width: '100%' }}>
                              {Object.keys(uterus).map((key, i) => {
                                if (uterus[key].length > 0) {
                                  return (
                                    <Box
                                      key={key}
                                      sx={{
                                        '& :hover': {
                                          bgcolor: theme =>
                                            MODE[theme.palette.mode].dataGrid
                                              .rowHover,
                                        },
                                      }}
                                    >
                                      <Box
                                        key={i}
                                        sx={{
                                          display: 'flex',
                                          px: 0.5,
                                          py: 0.4,
                                        }}
                                      >
                                        <Box sx={{ width: '30%' }}>{key}</Box>

                                        <Box
                                          sx={{ display: 'flex', width: '70%' }}
                                        >
                                          {dataForm
                                            .filter(d => d.name === key)
                                            .map(f => {
                                              let t = uterus[key].find(
                                                a => a.refValueId === f.valueId
                                              )

                                              return (
                                                <Box
                                                  key={f.valueId}
                                                  sx={{
                                                    width: '25%',
                                                    textAlign: 'center',
                                                  }}
                                                >
                                                  {t?.content || ''}
                                                </Box>
                                              )
                                            })}
                                        </Box>
                                      </Box>
                                      <Divider />
                                    </Box>
                                  )
                                }
                              })}
                            </Box>
                          </>
                        )}

                      {ovaries &&
                        (ovaries['Lt.Ovary']?.length > 0 ||
                          ovaries['Rt.Ovary']?.length > 0) && (
                          <>
                            <Typography variant='h5' sx={{ mt: 3 }}>
                              Ovaries
                            </Typography>
                            <Divider />
                            {ovaries && (
                              <>
                                <Box style={{ width: '100%' }}>
                                  {Object.keys(ovaries).map((key, i) => {
                                    if (ovaries[key].length > 0) {
                                      return (
                                        <Box
                                          key={key}
                                          sx={{
                                            '& :hover': {
                                              bgcolor: theme =>
                                                MODE[theme.palette.mode]
                                                  .dataGrid.rowHover,
                                            },
                                          }}
                                        >
                                          <Box
                                            key={i}
                                            sx={{
                                              display: 'flex',
                                              px: 0.5,
                                              py: 0.4,
                                            }}
                                          >
                                            <Box sx={{ width: '30%' }}>
                                              {key}
                                            </Box>

                                            <Box
                                              sx={{
                                                display: 'flex',
                                                width: '70%',
                                              }}
                                            >
                                              {dataForm
                                                .filter(d => d.name === key)
                                                .map(f => {
                                                  let t = ovaries[key].find(
                                                    a =>
                                                      a.refValueId === f.valueId
                                                  )

                                                  return (
                                                    <Box
                                                      key={f.valueId}
                                                      sx={{
                                                        width: '25%',
                                                        textAlign: 'center',
                                                      }}
                                                    >
                                                      {t?.content || ''}
                                                    </Box>
                                                  )
                                                })}
                                            </Box>
                                          </Box>
                                          <Divider />
                                        </Box>
                                      )
                                    }
                                  })}
                                </Box>
                              </>
                            )}
                          </>
                        )}
                      {abnormalities &&
                        abnormalities['Abn.Size']?.length > 0 && (
                          <>
                            <Typography variant='h5' sx={{ mt: 3 }}>
                              Abnormalities
                            </Typography>
                            <Divider />
                            {abnormalities && (
                              <>
                                <Box style={{ width: '100%' }}>
                                  {Object.keys(abnormalities).map((key, i) => {
                                    if (abnormalities[key].length > 0) {
                                      return (
                                        <Box
                                          key={key}
                                          sx={{
                                            '& :hover': {
                                              bgcolor: theme =>
                                                MODE[theme.palette.mode]
                                                  .dataGrid.rowHover,
                                            },
                                          }}
                                        >
                                          <Box
                                            key={i}
                                            sx={{
                                              display: 'flex',
                                              px: 0.5,
                                              py: 0.4,
                                            }}
                                          >
                                            <Box sx={{ width: '30%' }}>
                                              {key}
                                            </Box>

                                            <Box
                                              sx={{
                                                display: 'flex',
                                                width: '70%',
                                              }}
                                            >
                                              {dataForm
                                                .filter(d => d.name === key)
                                                .map(f => {
                                                  let t = abnormalities[
                                                    key
                                                  ].find(
                                                    a =>
                                                      a.refValueId === f.valueId
                                                  )

                                                  return (
                                                    <Box
                                                      key={f.valueId}
                                                      sx={{
                                                        width: '25%',
                                                        textAlign: 'center',
                                                      }}
                                                    >
                                                      {t?.content || ''}
                                                    </Box>
                                                  )
                                                })}
                                            </Box>
                                          </Box>
                                          <Divider />
                                        </Box>
                                      )
                                    }
                                  })}
                                </Box>
                              </>
                            )}
                          </>
                        )}

                      {kidneys &&
                        (kidneys['Pre.Size']?.length > 0 ||
                          kidneys['Post.Size']?.length > 0 ||
                          kidneys['Lt.Kidney']?.length > 0 ||
                          kidneys['Rt.Kidney']?.length > 0) && (
                          <>
                            <Typography variant='h5' sx={{ mt: 3 }}>
                              Kidneys/Bladder
                            </Typography>
                            <Divider />
                            {kidneys && (
                              <>
                                <Box style={{ width: '100%' }}>
                                  {Object.keys(kidneys).map((key, i) => {
                                    if (kidneys[key].length > 0) {
                                      return (
                                        <Box
                                          key={key}
                                          sx={{
                                            '& :hover': {
                                              bgcolor: theme =>
                                                MODE[theme.palette.mode]
                                                  .dataGrid.rowHover,
                                            },
                                          }}
                                        >
                                          <Box
                                            key={i}
                                            sx={{
                                              display: 'flex',
                                              px: 0.5,
                                              py: 0.4,
                                            }}
                                          >
                                            <Box sx={{ width: '30%' }}>
                                              {key}
                                            </Box>

                                            <Box
                                              sx={{
                                                display: 'flex',
                                                width: '70%',
                                              }}
                                            >
                                              {dataForm
                                                .filter(d => d.name === key)
                                                .map(f => {
                                                  let t = kidneys[key].find(
                                                    a =>
                                                      a.refValueId === f.valueId
                                                  )

                                                  return (
                                                    <Box
                                                      key={f.valueId}
                                                      sx={{
                                                        width: '25%',
                                                        textAlign: 'center',
                                                      }}
                                                    >
                                                      {t?.content || ''}
                                                    </Box>
                                                  )
                                                })}
                                            </Box>
                                          </Box>
                                          <Divider />
                                        </Box>
                                      )
                                    }
                                  })}
                                </Box>
                              </>
                            )}
                          </>
                        )}
                    </>

                    <Box
                      sx={{
                        '& :hover': {
                          bgcolor: theme =>
                            MODE[theme.palette.mode].dataGrid.rowHover,
                        },
                      }}
                    >
                      {measurement
                        .filter(d => d.refValueId >= 60 && d.refValueId <= 64)
                        .map(d => {
                          return (
                            <div key={d.refValueId}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  width: '100%',
                                  px: 0.5,
                                  py: 0.5,
                                }}
                              >
                                <Box sx={{ width: '30%' }}>
                                  {d.contentValueName}
                                </Box>
                                <Box
                                  sx={{
                                    width: '10%',
                                    textAlign: 'right',
                                    mr: 1,
                                  }}
                                >
                                  {d.content}
                                </Box>
                                <Box sx={{ width: '50%' }}>{d.contentUnit}</Box>
                              </Box>
                              <Divider />
                            </div>
                          )
                        })}
                    </Box>

                    <Box
                      sx={{
                        '& :hover': {
                          bgcolor: theme =>
                            MODE[theme.palette.mode].dataGrid.rowHover,
                        },
                      }}
                    >
                      {measurement
                        .filter(d => d.refValueId >= 592 && d.refValueId <= 593)
                        .map(d => {
                          return (
                            <div key={d.refValueId}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  width: '100%',
                                  px: 0.5,
                                  py: 0.5,
                                }}
                              >
                                <Box sx={{ minWidth: 105 }}>
                                  {d.contentValueName}
                                </Box>
                                <Box
                                  sx={{
                                    // width: '18%',
                                    textAlign: 'right',
                                    ml: 2,
                                  }}
                                >
                                  {d.content}
                                </Box>
                                <Box
                                  component='span'
                                  sx={{
                                    ml: 1,
                                    color: theme =>
                                      theme.palette.mode === 'dark'
                                        ? '#89CFF0'
                                        : 'blue',
                                  }}
                                >
                                  {d.contentUnit}
                                </Box>
                              </Box>
                              <Divider />
                            </div>
                          )
                        })}
                    </Box>
                  </div>
                </Fade>
              </div>
            </Box>
          )}
          {showEditForm && (
            <Box
              sx={{
                ...boxStyle,
                mt: 0.5,
                width: '100%',
                minWidth: 348,
                pr: 1,
              }}
            >
              {loading && <LinearProgress sx={{ mt: 0.5 }} />}
              <div style={{ display: loading && 'none', marginTop: 10 }}>
                <Fade in={!loading ? true : false} timeout={400}>
                  <div>
                    <Box>
                      <table style={{ width: '100%' }}>
                        <tbody>
                          <tr>
                            <td
                              style={{
                                width: '30%',
                                textAlign: 'right',
                              }}
                            ></td>
                            <td
                              style={{
                                width: '19%',
                                textAlign: 'right',
                              }}
                            >
                              <Typography
                                component='div'
                                sx={{
                                  ...mrUterus,
                                }}
                                variant='body1'
                              >
                                Length
                                <Box
                                  sx={{
                                    fontSize: 12,
                                    mt: -0.5,
                                    color: theme =>
                                      theme.palette.mode === 'dark'
                                        ? '#89CFF0'
                                        : 'blue',
                                  }}
                                >
                                  (cm)
                                </Box>
                              </Typography>
                            </td>
                            <td
                              style={{
                                width: '19%',
                                textAlign: 'right',
                              }}
                            >
                              <Typography
                                component='div'
                                sx={{
                                  ...mrUterus,
                                }}
                                variant='body1'
                              >
                                AP
                                <Box
                                  sx={{
                                    fontSize: 12,
                                    mt: -0.5,
                                    color: theme =>
                                      theme.palette.mode === 'dark'
                                        ? '#89CFF0'
                                        : 'blue',
                                  }}
                                >
                                  (cm)
                                </Box>
                              </Typography>
                            </td>
                            <td
                              style={{
                                width: '19%',
                                textAlign: 'right',
                              }}
                            >
                              <Typography
                                component='div'
                                sx={{
                                  ...mrUterus,
                                }}
                                variant='body1'
                              >
                                Width
                                <Box
                                  sx={{
                                    fontSize: 12,
                                    mt: -0.5,
                                    color: theme =>
                                      theme.palette.mode === 'dark'
                                        ? '#89CFF0'
                                        : 'blue',
                                  }}
                                >
                                  (cm)
                                </Box>
                              </Typography>
                            </td>
                            <td
                              style={{
                                width: '19%',
                                textAlign: 'right',
                              }}
                            >
                              <Typography
                                component='div'
                                sx={{
                                  ...mrUterus,
                                }}
                                variant='body1'
                              >
                                Volumn
                                <Box
                                  sx={{
                                    fontSize: 12,
                                    mt: -0.5,
                                    color: theme =>
                                      theme.palette.mode === 'dark'
                                        ? '#89CFF0'
                                        : 'blue',
                                  }}
                                >
                                  (cc)
                                </Box>
                              </Typography>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </Box>
                    <Divider />
                    <>
                      <Box style={{ width: '100%' }}>
                        {Object.keys(uterus).map((key, i) => {
                          return (
                            <Box key={key}>
                              <Box
                                key={i}
                                sx={{
                                  display: 'flex',
                                  px: 0.5,
                                  py: 0.3,
                                }}
                              >
                                <Box sx={{ width: '30%' }}>{key}</Box>

                                <Box sx={{ display: 'flex', width: '70%' }}>
                                  {dataForm
                                    .filter(d => d.name === key)
                                    .map(form => {
                                      let dataValue =
                                        dataFormSend[form.valueId].value
                                      return (
                                        <Box
                                          key={form.valueId}
                                          sx={{
                                            width: '25%',
                                          }}
                                        >
                                          <TextField
                                            autoComplete='off'
                                            size='small'
                                            sx={{ ...inputStyle }}
                                            value={dataValue}
                                            onChange={e => {
                                              setDataFormSend(prev => ({
                                                ...prev,
                                                [form.valueId]: {
                                                  ...prev[form.valueId],
                                                  value: e.target.value,
                                                },
                                              }))
                                            }}
                                            inputProps={{
                                              style: {
                                                // height: 30,
                                                padding: '1px 2px 1px 0',
                                                textAlign: 'right',
                                              },
                                            }}
                                          />
                                        </Box>
                                      )
                                    })}
                                </Box>
                              </Box>
                              <Divider />
                            </Box>
                          )
                        })}
                      </Box>
                      <Typography variant='h5' sx={{ mt: 2 }}>
                        Ovaries
                      </Typography>
                      <Divider />
                      <Box style={{ width: '100%' }}>
                        {Object.keys(ovaries).map((key, i) => {
                          return (
                            <Box key={key}>
                              <Box
                                key={i}
                                sx={{
                                  display: 'flex',
                                  px: 0.5,
                                  py: 0.3,
                                }}
                              >
                                <Box sx={{ width: '30%' }}>{key}</Box>

                                <Box sx={{ display: 'flex', width: '70%' }}>
                                  {dataForm
                                    .filter(d => d.name === key)
                                    .map(form => {
                                      let dataValue =
                                        dataFormSend[form.valueId].value
                                      return (
                                        <Box
                                          key={form.valueId}
                                          sx={{
                                            width: '25%',
                                          }}
                                        >
                                          <TextField
                                            autoComplete='off'
                                            size='small'
                                            sx={{ ...inputStyle }}
                                            value={dataValue}
                                            onChange={e => {
                                              setDataFormSend(prev => ({
                                                ...prev,
                                                [form.valueId]: {
                                                  ...prev[form.valueId],
                                                  value: e.target.value,
                                                },
                                              }))
                                            }}
                                            inputProps={{
                                              style: {
                                                // height: 30,
                                                padding: '1px 2px 1px 0',
                                                textAlign: 'right',
                                              },
                                            }}
                                          />
                                        </Box>
                                      )
                                    })}
                                </Box>
                              </Box>
                              <Divider />
                            </Box>
                          )
                        })}
                      </Box>
                      <Typography variant='h5' sx={{ mt: 2 }}>
                        Abnormalities
                      </Typography>
                      <Divider />
                      <Box style={{ width: '100%' }}>
                        {Object.keys(abnormalities).map((key, i) => {
                          return (
                            <Box key={key}>
                              <Box
                                key={i}
                                sx={{
                                  display: 'flex',
                                  px: 0.5,
                                  py: 0.3,
                                }}
                              >
                                <Box sx={{ width: '30%' }}>{key}</Box>

                                <Box sx={{ display: 'flex', width: '70%' }}>
                                  {dataForm
                                    .filter(d => d.name === key)
                                    .map(form => {
                                      let dataValue =
                                        dataFormSend[form.valueId].value
                                      return (
                                        <Box
                                          key={form.valueId}
                                          sx={{
                                            width: '25%',
                                          }}
                                        >
                                          <TextField
                                            autoComplete='off'
                                            size='small'
                                            sx={{ ...inputStyle }}
                                            value={dataValue}
                                            onChange={e => {
                                              setDataFormSend(prev => ({
                                                ...prev,
                                                [form.valueId]: {
                                                  ...prev[form.valueId],
                                                  value: e.target.value,
                                                },
                                              }))
                                            }}
                                            inputProps={{
                                              style: {
                                                // height: 30,
                                                padding: '1px 2px 1px 0',
                                                textAlign: 'right',
                                              },
                                            }}
                                          />
                                        </Box>
                                      )
                                    })}
                                </Box>
                              </Box>
                              <Divider />
                            </Box>
                          )
                        })}
                      </Box>
                      <Typography variant='h5' sx={{ mt: 2 }}>
                        Kidneys/Bladder
                      </Typography>
                      <Divider />
                      <Box style={{ width: '100%' }}>
                        {Object.keys(kidneys).map((key, i) => {
                          return (
                            <Box key={key}>
                              <Box
                                key={i}
                                sx={{
                                  display: 'flex',
                                  px: 0.5,
                                  py: 0.3,
                                }}
                              >
                                <Box sx={{ width: '30%' }}>{key}</Box>

                                <Box sx={{ display: 'flex', width: '70%' }}>
                                  {dataForm
                                    .filter(d => d.name === key)
                                    .map(form => {
                                      let dataValue =
                                        dataFormSend[form.valueId].value
                                      return (
                                        <Box
                                          key={form.valueId}
                                          sx={{
                                            width: '25%',
                                          }}
                                        >
                                          <TextField
                                            autoComplete='off'
                                            size='small'
                                            sx={{ ...inputStyle }}
                                            value={dataValue}
                                            onChange={e => {
                                              setDataFormSend(prev => ({
                                                ...prev,
                                                [form.valueId]: {
                                                  ...prev[form.valueId],
                                                  value: e.target.value,
                                                },
                                              }))
                                            }}
                                            inputProps={{
                                              style: {
                                                // height: 30,
                                                padding: '1px 2px 1px 0',
                                                textAlign: 'right',
                                              },
                                            }}
                                          />
                                        </Box>
                                      )
                                    })}
                                </Box>
                              </Box>
                              <Divider />
                            </Box>
                          )
                        })}
                      </Box>
                    </>

                    <Box>
                      {dataForm
                        .filter(d => d.valueId >= 592 && d.valueId <= 593)
                        .map(form => {
                          let dataValue = dataFormSend[form.valueId].value
                          return (
                            <div key={form.valueId}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  width: '100%',
                                  px: 0.5,
                                  py: 0.5,
                                  alignItems: 'center',
                                }}
                              >
                                <Box sx={{ minWidth: 112 }}>{form.name}</Box>
                                <Box
                                  sx={{
                                    width: '18%',
                                    textAlign: 'right',
                                    mr: 1,
                                    ml: 1,
                                  }}
                                >
                                  <TextField
                                    autoComplete='off'
                                    size='small'
                                    sx={{ ...inputStyle }}
                                    // margin='dense'
                                    value={dataValue}
                                    onChange={e => {
                                      setDataFormSend(prev => ({
                                        ...prev,
                                        [form.valueId]: {
                                          ...prev[form.valueId],
                                          value: e.target.value,
                                        },
                                      }))
                                    }}
                                    inputProps={{
                                      style: {
                                        // height: 30,
                                        padding: '1px 2px 1px 0',
                                        textAlign: 'right',
                                      },
                                    }}
                                  />
                                </Box>
                                <Box
                                  component='span'
                                  sx={{
                                    color: theme =>
                                      theme.palette.mode === 'dark'
                                        ? '#89CFF0'
                                        : 'blue',
                                  }}
                                >
                                  {form.unit}
                                </Box>
                              </Box>
                              <Divider />
                            </div>
                          )
                        })}
                    </Box>
                  </div>
                </Fade>
              </div>
            </Box>
          )}
          <SnackBarWarning
            snackWarning={snackWarning}
            setSnackWarning={setSnackWarning}
            vertical='top'
            horizontal='center'
          />
        </Box>
      )}
    </>
  )
}

export default TwoDMesurements

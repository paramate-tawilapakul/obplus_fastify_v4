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
import SkeletonLoading from '../../../../components/page-tools/SkeletonLoading'

const boxStyle = {
  ml: 0.5,
  // pl: 0.5,
  color: theme => MODE[theme.palette.mode].dataGrid.font,
}

const mrUterus = {
  mr: 1,
  // fontSize: 14,
}

const templateId = TEMPLATES.gynDoppler.id

const Doppler = ({ patient }) => {
  const [showEditForm, setShowEditForm] = useState(false)
  const [measurement, setMeasurement] = useState([])
  const [uterine, setUterine] = useState(null)
  const [abnormalities, setAbnormalities] = useState(null)
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
    setUterine(null)
    setAbnormalities(null)
  }

  function initData() {
    try {
      setLoading(true)
      const rand = randomMs()
      sleep(rand).then(async () => {
        if (!REPORT_ID[TEMPLATES.gynDoppler.name][patient.currentFetus]) {
          // console.log('******getReportId()', rand)
          const id = await getReportId(
            patient.accession,
            patient.currentFetus,
            templateId
          )

          REPORT_ID[TEMPLATES.gynDoppler.name][patient.currentFetus] = id
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
          reportId: getRiD(TEMPLATES.gynDoppler.name, patient.currentFetus),
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
      getRiD(TEMPLATES.gynDoppler.name, patient.currentFetus),
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

    const RtUterineA = measurement.filter(
      mes => mes.refValueId >= 594 && mes.refValueId <= 599
    )
    const LtUterineA = measurement.filter(
      mes => mes.refValueId >= 600 && mes.refValueId <= 605
    )
    const RtOvaryA = measurement.filter(
      mes => mes.refValueId >= 606 && mes.refValueId <= 611
    )
    const LtOvaryA = measurement.filter(
      mes => mes.refValueId >= 612 && mes.refValueId <= 617
    )
    const MassDop = measurement.filter(
      mes => mes.refValueId >= 618 && mes.refValueId <= 623
    )

    setUterine({
      'Rt.Uterine.A': RtUterineA,
      'Lt.Uterine.A': LtUterineA,
      'Rt.Ovary.A': RtOvaryA,
      'Lt.Ovary.A': LtOvaryA,
      'Mass Dop': MassDop,
    })
    if (
      RtUterineA.length > 0 ||
      LtUterineA.length > 0 ||
      RtOvaryA.length > 0 ||
      LtOvaryA.length > 0 ||
      MassDop.length > 0
    )
      tempShowUnit = true

    const Doppler = measurement.filter(
      mes => mes.refValueId >= 624 && mes.refValueId <= 629
    )
    setAbnormalities({
      Doppler,
    })
    if (Doppler.length > 0) tempShowUnit = true

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
              {/* {loading && <LinearProgress sx={{ mt: 0.5 }} />} */}
              <SkeletonLoading loading={loading} style={{ mt: 0.5 }} />
              <div style={{ display: loading && 'none', marginTop: 5 }}>
                <Fade in={!loading ? true : false} timeout={200}>
                  <div>
                    {showUnit && (
                      <>
                        <Box>
                          <table style={{ width: '100%' }}>
                            <tbody>
                              <tr>
                                <td
                                  style={{
                                    width: '26%',
                                    textAlign: 'right',
                                  }}
                                ></td>
                                <td
                                  style={{
                                    width: '12.33%',
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
                                    PSV
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
                                      (cm/s)
                                    </Box>
                                  </Typography>
                                </td>
                                <td
                                  style={{
                                    width: '12.33%',
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
                                    EDV
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
                                      (cm/s)
                                    </Box>
                                  </Typography>
                                </td>
                                <td
                                  style={{
                                    width: '12.33%',
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
                                    MnV
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
                                      (cm/s)
                                    </Box>
                                  </Typography>
                                </td>
                                <td
                                  style={{
                                    width: '12.33%',
                                    textAlign: 'center',
                                  }}
                                >
                                  <Typography
                                    component='div'
                                    sx={{
                                      ...mrUterus,
                                    }}
                                    variant='body1'
                                  >
                                    PI
                                  </Typography>
                                </td>
                                <td
                                  style={{
                                    width: '12.33%',
                                    textAlign: 'center',
                                  }}
                                >
                                  <Typography
                                    component='div'
                                    sx={{
                                      ...mrUterus,
                                    }}
                                    variant='body1'
                                  >
                                    RI
                                  </Typography>
                                </td>
                                <td
                                  style={{
                                    width: '12.33%',
                                    textAlign: 'center',
                                  }}
                                >
                                  <Typography
                                    component='div'
                                    sx={{
                                      ...mrUterus,
                                    }}
                                    variant='body1'
                                  >
                                    S/D
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
                      {uterine &&
                        (uterine['Lt.Uterine.A']?.length > 0 ||
                          uterine['Rt.Uterine.A']?.length > 0 ||
                          uterine['Lt.Ovary.A']?.length > 0 ||
                          uterine['Rt.Ovary.A']?.length > 0 ||
                          uterine['Mass Dop']?.length > 0) && (
                          <>
                            <Box style={{ width: '100%' }}>
                              {Object.keys(uterine).map((key, i) => {
                                if (uterine[key].length > 0) {
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
                                        <Box sx={{ width: '26%' }}>{key}</Box>

                                        <Box
                                          sx={{ display: 'flex', width: '74%' }}
                                        >
                                          {dataForm
                                            .filter(d => d.name === key)
                                            .map(f => {
                                              let t = uterine[key].find(
                                                a => a.refValueId === f.valueId
                                              )

                                              return (
                                                <Box
                                                  key={f.valueId}
                                                  sx={{
                                                    width: '100%',
                                                    textAlign: 'center',
                                                    // pl: 1.5,
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

                      {abnormalities &&
                        abnormalities['Doppler']?.length > 0 && (
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
                                            <Box sx={{ width: '26%' }}>
                                              {key}
                                            </Box>

                                            <Box
                                              sx={{
                                                display: 'flex',
                                                width: '74%',
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
                                                        width: '100%',
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
                                <Box>{d.contentValueName}</Box>
                                <Box
                                  sx={{
                                    width: '18%',
                                    textAlign: 'right',
                                    mr: 1,
                                  }}
                                >
                                  {d.content}
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
              {/* {loading && <LinearProgress sx={{ mt: 0.5 }} />} */}
              <SkeletonLoading loading={loading} style={{ mt: 0.5 }} />
              <div style={{ display: loading && 'none', marginTop: 10 }}>
                <Fade in={!loading ? true : false} timeout={200}>
                  <div>
                    <Box>
                      <table style={{ width: '100%' }}>
                        <tbody>
                          <tr>
                            <td
                              style={{
                                width: '26%',
                                textAlign: 'right',
                              }}
                            ></td>
                            <td
                              style={{
                                width: '12.33%',
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
                                PSV
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
                                  (cm/s)
                                </Box>
                              </Typography>
                            </td>
                            <td
                              style={{
                                width: '12.33%',
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
                                EDV
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
                                  (cm/s)
                                </Box>
                              </Typography>
                            </td>
                            <td
                              style={{
                                width: '12.33%',
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
                                MnV
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
                                  (cm/s)
                                </Box>
                              </Typography>
                            </td>
                            <td
                              style={{
                                width: '12.33%',
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
                                PI
                              </Typography>
                            </td>
                            <td
                              style={{
                                width: '12.33%',
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
                                RI
                              </Typography>
                            </td>
                            <td
                              style={{
                                width: '12.33%',
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
                                S/D
                              </Typography>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </Box>
                    <Divider />
                    <>
                      <Box style={{ width: '100%' }}>
                        {Object.keys(uterine).map((key, i) => {
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
                                <Box sx={{ width: '26%' }}>{key}</Box>

                                <Box sx={{ display: 'flex', width: '74%' }}>
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
                                <Box sx={{ width: '26%' }}>{key}</Box>

                                <Box sx={{ display: 'flex', width: '74%' }}>
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

export default Doppler

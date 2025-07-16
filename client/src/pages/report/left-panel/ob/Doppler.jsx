import { useEffect, useState } from 'react'

import axios from 'axios'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
// import LoadingButton from '@mui/lab/LoadingButton'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import useTheme from '@mui/material/styles/useTheme'
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
import { computeMOM, initFormSend } from '../../report-utils'
import { blue } from '@mui/material/colors'
import SkeletonLoading from '../../../../components/page-tools/SkeletonLoading'

const boxStyle = {
  ml: 0.5,
  // pl: 0.5,
  color: theme => MODE[theme.palette.mode].dataGrid.font,
}

const chipStyle = {
  ml: 0,
  fontSize: 14,
  color: 'white',
}

const chipColor = {
  Positive: '#21BA45',
  Negative: '#F2711C',
  'Reverse Flow': '#00B5AD',
}

const EDF = [39, 44, 49, 54, 59]

const mrArteries = {
  //  mr: 1,
}

const templateId = TEMPLATES.obDoppler.id

const Doppler = ({ patient }) => {
  const theme = useTheme()
  const [showEditForm, setShowEditForm] = useState(false)
  const [mom, setMom] = useState({ 'Lt.MCA': null, 'Rt.MCA': null })
  const [arteries, setArteries] = useState(null)
  const [ductusVenosus, setDuctusVenosus] = useState(null)
  const [umbilicalVein, setUmbilicalVein] = useState(null)
  const [showUnit, setShowUnit] = useState(false)
  const [loading, setLoading] = useState(false)
  // const [data, setData] = useState(null)
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
    setDataForm([])
    setArteries(null)
  }

  function initData() {
    try {
      setLoading(true)
      const rand = randomMs()
      sleep(rand).then(async () => {
        if (!REPORT_ID[TEMPLATES.obDoppler.name][patient.currentFetus]) {
          // console.log('******getReportId()', rand)
          const id = await getReportId(
            patient.accession,
            patient.currentFetus,
            templateId
          )

          REPORT_ID[TEMPLATES.obDoppler.name][patient.currentFetus] = id
        }

        fetchDoppler()
      })
    } catch (error) {
      console.log(error)
    }
  }

  async function fetchDoppler() {
    try {
      const res = await axios.get(API.REPORT_CONTENT, {
        params: {
          reportId: getRiD(TEMPLATES.obDoppler.name, patient.currentFetus),
        },
      })

      // console.log('DATA:', res.data.data)

      getReportForm(res.data.data)
      computeMOM(res.data.data, patient, setMom)
    } catch (error) {
      console.log(error)
    }
  }

  async function getReportForm(data) {
    const [formSend, form] = await initFormSend(
      data,
      getRiD(TEMPLATES.obDoppler.name, patient.currentFetus),
      templateId,
      true
    )

    setDataFormSend(formSend)
    setDefaultDataFormSend(formSend)
    // console.log('DATA SEND:', formSend)
    // console.log('FORM:', form)
    setDataForm(form)
    setLoading(false)
    fillArteries(data)
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
        await fetchDoppler()
      }
    } catch (error) {
      console.log(error)
    }
  }

  function resetForm() {
    setDataFormSend(defaultDataFormSend)
    setShowEditForm(false)
  }

  function fillArteries(doppler) {
    let tempShowUnit = false

    const UmA = doppler.filter(
      dop => dop.refValueId >= 35 && dop.refValueId <= 39
    )
    const LtMCA = doppler.filter(
      dop => dop.refValueId >= 40 && dop.refValueId <= 44
    )
    const RtMCA = doppler.filter(
      dop => dop.refValueId >= 45 && dop.refValueId <= 49
    )
    const LtUA = doppler.filter(
      dop => dop.refValueId >= 50 && dop.refValueId <= 54
    )
    const RtUA = doppler.filter(
      dop => dop.refValueId >= 55 && dop.refValueId <= 59
    )
    // const FreeText = doppler.filter(
    //   dop => dop.refValueId >= 151 && dop.refValueId <= 155
    // )

    setArteries({
      UmA,
      'Lt.MCA': LtMCA,
      'Rt.MCA': RtMCA,
      'Lt.UA': LtUA,
      'Rt.UA': RtUA,
      // FreeText: FreeText,
    })
    if (
      UmA.length > 0 ||
      LtMCA.length > 0 ||
      RtMCA.length > 0 ||
      LtUA.length > 0 ||
      RtUA.length > 0
    )
      tempShowUnit = true

    setShowUnit(tempShowUnit)

    const dv = doppler.filter(d => d.refValueId >= 60 && d.refValueId <= 64)
    setDuctusVenosus(dv)
    const uv = doppler.filter(d => d.refValueId >= 65 && d.refValueId <= 68)
    setUmbilicalVein(uv)
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
              <div style={{ display: loading && 'none' }}>
                <Fade in={!loading ? true : false} timeout={200}>
                  <div>
                    {showUnit && (
                      <>
                        {' '}
                        <Box>
                          <Typography variant='h5' sx={{ mb: 1 }}>
                            Arteries
                          </Typography>
                          <table style={{ width: '100%' }}>
                            <tbody>
                              <tr>
                                <td
                                  style={{
                                    width: '37%',
                                    textAlign: 'right',
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      ...mrArteries,
                                    }}
                                    variant='body1'
                                  >
                                    Vmax
                                    <Box
                                      component='span'
                                      sx={{
                                        display: 'inline',
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
                                    width: '13%',
                                    textAlign: 'center',
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      ...mrArteries,
                                    }}
                                    variant='body1'
                                  >
                                    PI
                                  </Typography>
                                </td>
                                <td
                                  style={{
                                    width: '15%',
                                    textAlign: 'center',
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      ...mrArteries,
                                    }}
                                    variant='body1'
                                  >
                                    RI
                                  </Typography>
                                </td>
                                <td
                                  style={{
                                    width: '15%',
                                    textAlign: 'center',
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      ...mrArteries,
                                    }}
                                    variant='body1'
                                  >
                                    S/D
                                  </Typography>
                                </td>
                                <td
                                  style={{
                                    width: '20%',
                                    textAlign: 'center',
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      ...mrArteries,
                                    }}
                                    variant='body1'
                                  >
                                    EDF
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
                      {arteries && (
                        <>
                          <Box style={{ width: '100%' }}>
                            {Object.keys(arteries).map((key, i) => {
                              if (arteries[key].length > 0) {
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
                                      <Box sx={{ width: '20%' }}>{key}</Box>

                                      <Box
                                        sx={{ display: 'flex', width: '80%' }}
                                      >
                                        {dataForm
                                          .filter(d => d.name === key)
                                          .map((f, i) => {
                                            let t = arteries[key].find(
                                              a => a.refValueId === f.valueId
                                            )

                                            if (!t)
                                              return (
                                                <Box
                                                  key={f.valueId}
                                                  sx={{
                                                    width: EDF.includes(
                                                      f.valueId
                                                    )
                                                      ? '25%'
                                                      : '19%',
                                                  }}
                                                ></Box>
                                              )

                                            let value = t.content
                                              ? t.content
                                              : t.contentOption

                                            if (typeof value === 'number') {
                                              let edf = dataForm.find(
                                                d => d.valueId === t.refValueId
                                              )
                                              const edfName = edf.options.find(
                                                o => o.opId === value
                                              ).display
                                              edf = edfName

                                              if (edfName === 'Reverse Flow') {
                                                edf = edf.slice(0, 7)
                                              } else {
                                                edf = edf.slice(0, 3)
                                                if (edf === 'Neg') {
                                                  edf = '- ' + edf
                                                } else {
                                                  edf = '+ ' + edf
                                                }
                                              }

                                              value = (
                                                <div title={edfName}>
                                                  <Chip
                                                    label={edf}
                                                    size='small'
                                                    sx={{
                                                      ...chipStyle,
                                                      pointerEvents: 'none',

                                                      bgcolor:
                                                        chipColor[edfName],
                                                    }}
                                                  />
                                                </div>
                                              )
                                            }

                                            return (
                                              <Box
                                                key={f.valueId}
                                                sx={{
                                                  // whiteSpace: 'nowrap',
                                                  width: !t.content
                                                    ? '25%'
                                                    : '19%',
                                                  textAlign: !t.content
                                                    ? 'center'
                                                    : 'center',
                                                }}
                                              >
                                                {value}
                                                {['Lt.MCA', 'Rt.MCA'].includes(
                                                  key
                                                ) &&
                                                  i === 0 &&
                                                  mom[key] && (
                                                    <div
                                                      title='Multiples of Median'
                                                      style={{
                                                        cursor: 'default',
                                                        fontSize: 12,
                                                        color:
                                                          theme.palette.mode ===
                                                          'dark'
                                                            ? blue[100]
                                                            : 'blue',
                                                      }}
                                                    >
                                                      {mom[key]}
                                                    </div>
                                                  )}
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

                    {(ductusVenosus?.length > 0 ||
                      umbilicalVein?.length > 0) && (
                      <Typography variant='h5' sx={{ mt: 3 }}>
                        Veins
                      </Typography>
                    )}

                    {ductusVenosus?.length > 0 && (
                      <>
                        <Typography
                          variant='body1'
                          sx={{ textAlign: 'right', fontWeight: 'bold', mr: 1 }}
                        >
                          Ductus Venosus
                        </Typography>
                        <Divider />
                        <Box
                          sx={{
                            '& :hover': {
                              bgcolor: theme =>
                                MODE[theme.palette.mode].dataGrid.rowHover,
                            },
                          }}
                        >
                          {ductusVenosus.map(d => {
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
                                  <Box sx={{ width: '50%' }}>
                                    {d.contentUnit}
                                  </Box>
                                </Box>
                                <Divider />
                              </div>
                            )
                          })}
                        </Box>
                      </>
                    )}

                    {umbilicalVein?.length > 0 && (
                      <>
                        <Typography
                          variant='body1'
                          sx={{
                            textAlign: 'right',
                            fontWeight: 'bold',
                            mt: 3,
                            mr: 1,
                          }}
                        >
                          Umbilical Vein
                        </Typography>
                        <Divider />
                        <Box
                          sx={{
                            '& :hover': {
                              bgcolor: theme =>
                                MODE[theme.palette.mode].dataGrid.rowHover,
                            },
                          }}
                        >
                          {umbilicalVein.map(d => {
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
                                  <Box sx={{ width: '50%' }}>
                                    {d.contentUnit}
                                  </Box>
                                </Box>
                                <Divider />
                              </div>
                            )
                          })}
                        </Box>
                      </>
                    )}
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
              <div style={{ display: loading && 'none' }}>
                <Fade in={!loading ? true : false} timeout={200}>
                  <div>
                    <Box>
                      <Typography variant='h5' sx={{ mb: 1 }}>
                        Arteries
                      </Typography>
                      <table style={{ width: '100%' }}>
                        <tbody>
                          <tr>
                            <td
                              style={{
                                width: '37%',
                                textAlign: 'right',
                              }}
                            >
                              <Typography
                                sx={{
                                  ...mrArteries,
                                }}
                                variant='body1'
                              >
                                Vmax
                                <Box
                                  component='span'
                                  sx={{
                                    display: 'inline',
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
                                width: '13%',
                                textAlign: 'center',
                              }}
                            >
                              <Typography
                                sx={{
                                  ...mrArteries,
                                }}
                                variant='body1'
                              >
                                PI
                              </Typography>
                            </td>
                            <td
                              style={{
                                width: '15%',
                                textAlign: 'center',
                              }}
                            >
                              <Typography
                                sx={{
                                  ...mrArteries,
                                }}
                                variant='body1'
                              >
                                RI
                              </Typography>
                            </td>
                            <td
                              style={{
                                width: '15%',
                                textAlign: 'center',
                              }}
                            >
                              <Typography
                                sx={{
                                  ...mrArteries,
                                }}
                                variant='body1'
                              >
                                S/D
                              </Typography>
                            </td>
                            <td
                              style={{
                                width: '20%',
                                textAlign: 'center',
                              }}
                            >
                              <Typography
                                sx={{
                                  ...mrArteries,
                                }}
                                variant='body1'
                              >
                                EDF
                              </Typography>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </Box>
                    <Divider />
                    <>
                      <Box style={{ width: '100%' }}>
                        {Object.keys(arteries).map((key, i) => {
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
                                <Box sx={{ width: '20%' }}>{key}</Box>

                                <Box sx={{ display: 'flex', width: '80%' }}>
                                  {dataForm
                                    .filter(d => d.name === key)
                                    .map(form => {
                                      let dataValue =
                                        dataFormSend[form.valueId].value
                                      return (
                                        <Box
                                          key={form.valueId}
                                          sx={{
                                            width:
                                              form.options.length > 0
                                                ? '25%'
                                                : '19%',
                                          }}
                                        >
                                          {form.options.length === 0 ? (
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
                                          ) : (
                                            <select
                                              value={dataValue}
                                              onChange={e => {
                                                setDataFormSend(prev => ({
                                                  ...prev,
                                                  [form.valueId]: {
                                                    ...prev[form.valueId],
                                                    type: 'S',
                                                    value:
                                                      e.target.value !== ''
                                                        ? parseInt(
                                                            e.target.value
                                                          )
                                                        : '',
                                                  },
                                                }))
                                              }}
                                              style={{
                                                width: '98%',
                                                height: 26,
                                                marginLeft: 3,
                                                borderRadius: 3,
                                                // fontSize: 13,
                                                color:
                                                  MODE[theme.palette.mode]
                                                    .dataGrid.font,
                                                backgroundColor:
                                                  theme.palette.mode === 'light'
                                                    ? 'white'
                                                    : '#393939',
                                              }}
                                            >
                                              <option value=''></option>
                                              {form.options.map(o => (
                                                <option
                                                  key={o.opId}
                                                  value={o.opId}
                                                >
                                                  {o.display}
                                                </option>
                                              ))}
                                            </select>
                                          )}
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
                    <Typography variant='h5' sx={{ mt: 3 }}>
                      Veins
                    </Typography>
                    <Typography
                      variant='body1'
                      sx={{ textAlign: 'right', fontWeight: 'bold', mr: 1 }}
                    >
                      Ductus Venosus
                    </Typography>
                    <Divider />
                    <Box>
                      {dataForm
                        .filter(d => d.valueId >= 60 && d.valueId <= 64)
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
                                }}
                              >
                                <Box sx={{ width: '35%' }}>{form.name}</Box>
                                <Box
                                  sx={{
                                    width: '20%',
                                    textAlign: 'right',
                                    mr: 1,
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
                                <Box sx={{ width: '45%' }}>{form.unit}</Box>
                              </Box>
                              <Divider />
                            </div>
                          )
                        })}
                    </Box>
                    <Typography
                      variant='body1'
                      sx={{
                        textAlign: 'right',
                        fontWeight: 'bold',
                        mt: 3,
                        mr: 1,
                      }}
                    >
                      Umbilical Vein
                    </Typography>
                    <Divider />
                    <Box>
                      {dataForm
                        .filter(d => d.valueId >= 67 && d.valueId <= 68)
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
                                }}
                              >
                                <Box sx={{ width: '35%' }}>{form.name}</Box>
                                <Box
                                  sx={{
                                    width: '20%',
                                    textAlign: 'right',
                                    mr: 1,
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
                                <Box sx={{ width: '45%' }}>{form.unit}</Box>
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

export default Doppler

import { useEffect, useContext, useState, useRef, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import axios from 'axios'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import ChildCareIcon from '@mui/icons-material/ChildCare'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Paper from '@mui/material/Paper'
import ButtonGroup from '@mui/material/ButtonGroup'

import DataContext from '../../context/data/dataContext'
import Layout from '../../components/layout/Layout'
import ReportNavBar from '../../components/page-tools/ReportNavBar'
import { API, APP_ROUTES, FETUS_NAME, MODE, STORAGE_NAME } from '../../config'
import LeftTabIndex from './left-panel/TabIndex'
import RightTabIndex from './right-panel/TabIndex'

const Report = () => {
  const history = useHistory()

  const editorRef = useRef(null)
  const {
    setPatient,
    patient,
    systemProperties,
    templateNotification,
    setTemplateNotification,
    user,
    doctor,
  } = useContext(DataContext)
  const [loading, setLoading] = useState(true)
  const [fetus, setFetus] = useState(['1'])

  const [fetusActive, setFetusActive] = useState({
    1: true,
    2: false,
    3: false,
    4: false,
  })

  // let accession = history.location.search.split('=')[1]
  const params = new Proxy(new URLSearchParams(history.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  })

  let accession = params.accession

  const LeftTabIndexMemo = useMemo(() => {
    return (
      <LeftTabIndex
        templateNotification={templateNotification}
        setTemplateNotification={setTemplateNotification}
        patient={patient}
        systemProperties={systemProperties}
        user={user}
        doctor={doctor}
      />
    )

    // eslint-disable-next-line
  }, [patient, templateNotification, systemProperties, user, doctor])

  const RightTabIndexMemo = useMemo(() => {
    return (
      <RightTabIndex
        templateNotification={templateNotification}
        setTemplateNotification={setTemplateNotification}
        systemProperties={systemProperties}
        patient={patient}
        editorRef={editorRef}
      />
    )

    // eslint-disable-next-line
  }, [patient, templateNotification, editorRef])

  async function getObInfo() {
    // console.log('getObInfo')
    try {
      // setLoading(true)

      const resPatient = await axios.get(API.PATIENT, {
        params: {
          accession,
          reportPage: '1',
        },
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem(
            STORAGE_NAME.token
          )}`,
        },
      })

      if (!resPatient.data.data?.obAccession)
        return history.push(`${APP_ROUTES.worklist}`)

      setPatient({ ...resPatient.data.data, currentFetus: '1' })
      if (systemProperties?.showTabDataChecked === 'YES') {
        setTemplateNotification({
          reportTemplateId: resPatient.data.data?.reportTemplateId,
          hasManualContent: resPatient.data.data?.hasManualContent,
          hasImage: resPatient.data.data?.hasImage,
        })
      }

      let f = []
      let nf = parseInt(resPatient.data.data.noFetus)
      for (let i = 1; i <= nf; i++) {
        f.push(i)
      }
      setFetus(f)
      setLoading(false)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (!accession) return history.push(`${APP_ROUTES.worklist}`)

    if (systemProperties) getObInfo()

    return () => {}
    // eslint-disable-next-line
  }, [systemProperties])

  return (
    <Layout>
      {patient && doctor && user && systemProperties && (
        <Box
          sx={{
            // display: 'flex',
            // flexDirection: 'column',
            // justifyContent: 'flex-start',
            // alignContent: 'flex-start',
            mx: { xs: 1, xl: 3 },
          }}
        >
          <ReportNavBar />
          {loading && <LinearProgress sx={{ mt: 1 }} />}
          <Fade in={!loading && user && patient ? true : false} timeout={400}>
            <Box sx={{ display: 'flex', mt: 1 }}>
              {!loading && user && patient && (
                <>
                  {fetus.length > 1 && (
                    <Box sx={{ width: 50, mr: 0.5 }}>
                      <ChildCareIcon sx={{ ml: 0.3 }} fontSize='large' />
                      <ButtonGroup
                        orientation='vertical'
                        disableRipple
                        // sx={{ height: 47 }}
                      >
                        {fetus.length > 1 &&
                          fetus.map(f => (
                            <Button
                              sx={{
                                color: theme =>
                                  MODE[theme.palette.mode].dataGrid.font,
                                bgcolor: theme =>
                                  fetusActive[f] &&
                                  theme.palette.mode === 'dark'
                                    ? '#6d6d6d'
                                    : fetusActive[f] &&
                                      theme.palette.mode === 'light'
                                    ? '#d9d9d9'
                                    : undefined,
                                '&:hover': {
                                  //you want this to be the same as the backgroundColor above
                                  backgroundColor: theme =>
                                    theme.palette.mode === 'dark'
                                      ? '#6d6d6d'
                                      : '#d9d9d9',
                                },
                              }}
                              key={f}
                              onClick={async () => {
                                window.localStorage.setItem(
                                  STORAGE_NAME.activeFetus,
                                  f
                                )

                                if (
                                  systemProperties?.showTabDataChecked === 'YES'
                                ) {
                                  let res = await axios.get(API.TEMPLATE_DATA, {
                                    params: {
                                      accession: patient.accession,
                                      fetus: f,
                                    },
                                  })
                                  setTemplateNotification(res.data.data)
                                }

                                setPatient({
                                  ...patient,
                                  currentFetus: `${f}`,
                                })

                                setFetusActive(() => {
                                  let reset = {
                                    1: false,
                                    2: false,
                                    3: false,
                                    4: false,
                                  }
                                  reset = { ...reset, [f]: true }
                                  return reset
                                })
                              }}
                            >
                              {FETUS_NAME[f]}
                            </Button>
                          ))}
                      </ButtonGroup>
                    </Box>
                  )}
                  <Paper
                    elevation={4}
                    sx={{
                      // width: '33%',
                      minWidth: 390,
                      maxWidth: 460,
                      mr: 1,
                      bgcolor: theme => MODE[theme.palette.mode].tab.active,
                    }}
                  >
                    {LeftTabIndexMemo}
                  </Paper>
                  <Paper
                    elevation={4}
                    sx={{
                      // minWidth: fetus.length === 1 ? 790 : 750,
                      minWidth: 820,
                      flex: 1,
                      bgcolor: theme => MODE[theme.palette.mode].tab.active,
                    }}
                  >
                    {/* <RightTabIndex patient={patient} /> */}
                    {RightTabIndexMemo}
                  </Paper>
                </>
              )}
            </Box>
          </Fade>
        </Box>
      )}
    </Layout>
  )
}

export default Report

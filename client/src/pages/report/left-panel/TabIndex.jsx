import { useState, useEffect } from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Badge from '@mui/material/Badge'
import { makeStyles } from '@mui/styles'

import TwoDMesurements from './ob/TwoDMesurements'
import Doppler from './ob/Doppler'
import TwoDMesurementsGyn from './gyn/TwoDMesurements'
import DopplerGyn from './gyn/Doppler'
import History from './History'
import { API, MODE, TEMPLATES } from '../../../config'
import axios from 'axios'

function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0.5, m: 0 }}>{children}</Box>}
    </div>
  )
}

const useStyles = makeStyles({
  tab: {
    '& .Mui-selected': {
      fontSize: '18px',
    },
  },
})

const TabIndex = ({
  templateNotification,
  patient,
  systemProperties,
  user,
  doctor,
}) => {
  // console.log('TabIndex left, active fetus ', patient.currentFetus)
  const [elHeight, setElHeight] = useState(window.innerHeight - 215)
  const [historyData, setHistoryData] = useState([])
  // let historyData = []
  window.addEventListener('resize', setElementHeight)
  function setElementHeight(e) {
    setElHeight(e.currentTarget.innerHeight - 215)
  }
  const classes = useStyles()
  const [tabSelected, setTabSelected] = useState('2D & Measurement')

  const obTabs = [
    {
      name: '2D & Measurement',
      id: TEMPLATES['obMeasurement'].name,
      component: <TwoDMesurements patient={patient} />,
      hasData: templateNotification?.reportTemplateId?.includes(
        TEMPLATES['obMeasurement'].id
      ),
    },
    {
      name: 'Doppler',
      id: TEMPLATES['obDoppler'].name,
      component: <Doppler patient={patient} />,
      hasData: templateNotification?.reportTemplateId?.includes(
        TEMPLATES['obDoppler'].id
      ),
    },
  ]
  const gynTabs = [
    {
      name: '2D & Measurement',
      id: TEMPLATES['gynMeasurement'].name,
      component: <TwoDMesurementsGyn patient={patient} />,
      hasData: templateNotification?.reportTemplateId?.includes(
        TEMPLATES['gynMeasurement'].id
      ),
    },
    {
      name: 'Doppler',
      id: TEMPLATES['gynDoppler'].name,
      component: <DopplerGyn patient={patient} />,
      hasData: templateNotification?.reportTemplateId?.includes(
        TEMPLATES['gynDoppler'].id
      ),
    },
  ]

  let tabs = []
  if (patient?.obStudyType === '1') tabs = obTabs
  else tabs = gynTabs

  if (historyData?.length > 0) {
    tabs = tabs.concat([
      {
        name: 'History',
        id: 'history',
        component: (
          <History
            patient={patient}
            systemProperties={systemProperties}
            elHeight={elHeight}
            user={user}
            doctor={doctor}
            historyData={historyData}
          />
        ),
      },
    ])
  }

  useEffect(() => {
    getReportHistory()

    return () => {}
    // eslint-disable-next-line
  }, [])

  async function getReportHistory() {
    try {
      const res = await axios.get(API.REPORT_HISTORY, {
        params: {
          hn: patient.hn,
          exceptAccession: patient.accession,
        },
      })
      setHistoryData(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  const handleChange = (event, tabSelected) => {
    setTabSelected(tabSelected)
  }

  return (
    <>
      {patient?.currentFetus && (
        <>
          <Box
            sx={{
              bgcolor: theme =>
                MODE[theme.palette.mode].tab.inActive.background,
            }}
          >
            <Tabs
              className={classes.tab}
              value={tabSelected}
              onChange={handleChange}
              variant='scrollable'
              // scrollButtons
              aria-label='scrollable auto tabs example'
              sx={{
                '& .Mui-selected': {
                  color: theme => MODE[theme.palette.mode].tab.active.font,
                  bgcolor: theme =>
                    MODE[theme.palette.mode].tab.active.background,
                },
                '.MuiTabs-indicator': {
                  bgcolor: theme =>
                    MODE[theme.palette.mode].tab.active.background,
                },
                '& .MuiTab-root:hover': {
                  color: theme => MODE[theme.palette.mode].dataGrid.font,
                },
              }}
            >
              {tabs.map((tab, index) => {
                let label = tab.name

                if (tab.name === 'History') {
                  const count = historyData.length
                  label = (
                    <Badge
                      badgeContent={count}
                      color='warning'
                      max={99}
                      sx={{
                        '& .MuiBadge-badge': {
                          color: theme =>
                            MODE[theme.palette.mode].tab.notification.font,
                          backgroundColor: theme =>
                            MODE[theme.palette.mode].tab.notification
                              .background,
                        },
                      }}
                    >
                      {count > 99 ? (
                        <span>{tab.name}&nbsp;&nbsp;&nbsp;&nbsp;</span>
                      ) : count > 9 ? (
                        <span>{tab.name}&nbsp;&nbsp;&nbsp;</span>
                      ) : (
                        <span>{tab.name}&nbsp;&nbsp;</span>
                      )}
                    </Badge>
                  )
                } else {
                  label =
                    tab?.hasData &&
                    systemProperties?.showTabDataChecked === 'YES' ? (
                      <Badge
                        badgeContent='✔'
                        // color='warning'
                        // variant='dot'
                        sx={{
                          '& .MuiBadge-badge': {
                            color: theme =>
                              MODE[theme.palette.mode].tab.notificationInfo
                                .font,
                            backgroundColor: theme =>
                              MODE[theme.palette.mode].tab.notificationInfo
                                .background,
                          },
                        }}
                      >
                        <span>{tab.name} &nbsp;</span>
                      </Badge>
                    ) : (
                      tab.name
                    )
                }

                return (
                  <Tab
                    disableRipple
                    sx={{
                      textTransform: 'none',
                      minWidth: 45,
                      px: 2,
                    }}
                    key={index}
                    label={label}
                    to={tab.link}
                    value={tab.name}
                  />
                )
              })}
            </Tabs>
          </Box>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 0,
              pt: 0.5,
              height: elHeight,
              overflowX: 'hidden',
              overflowY: 'auto',
              // minHeight: 500,
              bgcolor: theme => MODE[theme.palette.mode].tab.background,
            }}
          >
            {tabs.map((tab, index) => {
              return (
                <TabPanel key={index} value={tabSelected} index={tab.name}>
                  {tab.component}
                </TabPanel>
              )
            })}
          </Paper>
        </>
      )}
    </>
  )
}

export default TabIndex

import { useState } from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import { makeStyles } from '@mui/styles'
import camelCase from 'lodash/camelCase'
import Badge from '@mui/material/Badge'

import Anc from './ob/1_Anc'
import EarlyPregnancy from './ob/2_EarlyPregnancy'
import AnatomicalScan from './ob/3_AnatomicalScan'
import CervicalLength from './ob/4_CervicalLength'
import Bpp from './ob/5_Bpp'
import Invasive from './ob/6_Invasive'
import FetalEcho from './ob/7_FetalEcho'
import Diagnosis from './ob/8_Diagnosis'
import Uterus from './gyn/1_Uterus'
import Ovaries from './gyn/2_Ovaries'
import AbnormalMass from './gyn/3_AbnormalMass'
import Kidneys from './gyn/4_Kidneys'
import FollicleScreen from './gyn/5_FollicleScreen'
import DiagnosisGyn from './gyn/6_Diagnosis'
import Image from './Image'
import ReportEditor from './ReportEditor'
import EFW from './ob/charts/EFW'
// import Sample from './Sample'
import { FETUS_NAME, MODE, STORAGE_NAME, TEMPLATES } from '../../../config'
import Feedback from '../../../components/page-tools/Feedback'
import { Chip } from '@mui/material'
import { orange } from '@mui/material/colors'

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
  systemProperties,
  patient,
  editorRef,
}) => {
  // console.log('TabIndex right, active fetus ', patient.currentFetus)
  // console.log('noFetus', patient.noFetus)
  // console.log('currentFetus', patient.currentFetus)
  // console.log('obStudyType', patient?.obStudyType)
  const [elHeight, setElHeight] = useState(window.innerHeight - 215)

  window.addEventListener('resize', setElementHeight)
  function setElementHeight(e) {
    setElHeight(e.currentTarget.innerHeight - 215)
  }
  const classes = useStyles()
  const [tabSelected, setTabSelected] = useState(
    patient?.obStudyType === '1' ? 'ANC' : 'Uterus'
    // patient?.obStudyType === '1' ? 'Invasive' : 'Uterus'
  )

  // useEffect(() => {
  //   // console.log('reportTemplateId', patient.reportTemplateId)

  //   return () => {}
  // }, [])

  let tSelected = tabSelected

  if (tabSelected === 'Diagnosis') {
    tSelected = patient?.obStudyType === '1' ? `obDiagnosis` : `gynDiagnosis`
  }

  if (tabSelected === 'Cervical Length') {
    tSelected = tabSelected.replace(' Length', '')
  }

  const selected =
    tabSelected === 'Editor'
      ? 'editor'
      : tabSelected === 'Image'
      ? 'image'
      : tabSelected === 'EFW Charts'
      ? 'EFWCharts'
      : TEMPLATES[camelCase(tSelected)].id

  // console.log(selected)

  // let storageValue = selected
  // if ([4, 6].includes(selected)) {
  //   storageValue = `${selected},39`
  // }

  window.localStorage.setItem(STORAGE_NAME.lastActiveTab, selected)

  const obTabs = [
    // {
    //   name: 'EFW Charts',
    //   id: 'EFWCharts',
    //   component: <EFW patient={patient} />,
    // },
    {
      name: 'ANC',
      id: TEMPLATES['anc'].name,
      component: <Anc patient={patient} />,
      hasData: templateNotification?.reportTemplateId?.includes(
        TEMPLATES['anc'].id
      ),
    },
    {
      name: 'Early Pregnancy',
      id: TEMPLATES['earlyPregnancy'].name,
      component: <EarlyPregnancy patient={patient} />,
      hasData: templateNotification?.reportTemplateId?.includes(
        TEMPLATES['earlyPregnancy'].id
      ),
    },
    {
      name: 'Anatomical Scan',
      id: TEMPLATES['anatomicalScan'].name,
      component: <AnatomicalScan patient={patient} />,
      hasData: templateNotification?.reportTemplateId?.includes(
        TEMPLATES['anatomicalScan'].id
      ),
    },
    // {
    //   name: 'Cervical Length',
    //   id: TEMPLATES['cervical'].name,
    //   component: <CervicalLength patient={patient} />,
    //   hasData: templateNotification?.reportTemplateId?.includes(
    //     TEMPLATES['cervical'].id
    //   ),
    // },
    {
      name: 'Bpp',
      id: TEMPLATES['bpp'].name,
      component: <Bpp patient={patient} />,
      hasData: templateNotification?.reportTemplateId?.includes(
        TEMPLATES['bpp'].id
      ),
    },
    {
      name: 'Invasive',
      id: TEMPLATES['invasivePrerequisite'].name,
      component: <Invasive patient={patient} />,
      hasData: templateNotification?.reportTemplateId?.includes(
        TEMPLATES['invasivePrerequisite'].id
      ),
    },
    {
      name: 'Fetal Echo',
      id: TEMPLATES['fetalEcho'].name,
      component: <FetalEcho patient={patient} />,
      hasData: templateNotification?.reportTemplateId?.includes(
        TEMPLATES['fetalEcho'].id
      ),
    },
    {
      name: 'Diagnosis',
      id: TEMPLATES['obDiagnosis'].name,
      component: <Diagnosis patient={patient} />,
      hasData: templateNotification?.reportTemplateId?.includes(
        TEMPLATES['obDiagnosis'].id
      ),
    },
  ]
  const gynTabs = [
    {
      name: 'Uterus',
      id: TEMPLATES['uterus'].name,
      component: <Uterus patient={patient} />,
      hasData: templateNotification?.reportTemplateId?.includes(
        TEMPLATES['uterus'].id
      ),
    },
    {
      name: 'Ovaries',
      id: TEMPLATES['ovaries'].name,
      component: <Ovaries patient={patient} />,
      hasData: templateNotification?.reportTemplateId?.includes(
        TEMPLATES['ovaries'].id
      ),
    },
    {
      name: 'Abnormal Mass',
      id: TEMPLATES['abnormalMass'].name,
      component: <AbnormalMass patient={patient} />,
      hasData: templateNotification?.reportTemplateId?.includes(
        TEMPLATES['abnormalMass'].id
      ),
    },
    {
      name: 'Kidneys',
      id: TEMPLATES['kidneys'].name,
      component: <Kidneys patient={patient} />,
      hasData: templateNotification?.reportTemplateId?.includes(
        TEMPLATES['kidneys'].id
      ),
    },
    {
      name: 'Follicle Screen',
      id: TEMPLATES['follicleScreen'].name,
      component: <FollicleScreen patient={patient} />,
      hasData: templateNotification?.reportTemplateId?.includes(
        TEMPLATES['follicleScreen'].id
      ),
    },
    {
      name: 'Diagnosis',
      id: TEMPLATES['gynDiagnosis'].name,
      component: <DiagnosisGyn patient={patient} />,
      hasData: templateNotification?.reportTemplateId?.includes(
        TEMPLATES['gynDiagnosis'].id
      ),
    },
  ]

  let tabs = []
  if (patient?.obStudyType === '1') tabs = obTabs
  else tabs = gynTabs

  tabs = tabs.concat([
    {
      name: 'Image',
      id: 'Image',
      component: <Image patient={patient} />,
      hasData: templateNotification?.hasImage,
    },
    {
      name: 'Editor',
      id: 'ReportEditor',
      component: <ReportEditor patient={patient} editorRef={editorRef} />,
      hasData: templateNotification?.hasManualContent,
    },
  ])

  if (patient?.obStudyType === '1') {
    tabs = tabs.concat([
      {
        name: 'EFW Charts',
        id: 'EFWCharts',
        component: <EFW patient={patient} />,
        // hasData: templateNotification?.hasImage,
      },
    ])
  }

  const handleChange = (event, tabSelected) => {
    // console.log('handleChange', selected)
    // window.localStorage.setItem(STORAGE_NAME.lastActiveTab, selected)
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
                // let label = tab.name
                let label =
                  tab?.hasData &&
                  systemProperties?.showTabDataChecked === 'YES' ? (
                    <Badge
                      badgeContent='✔'
                      // color='warning'
                      // variant='dot'
                      sx={{
                        '& .MuiBadge-badge': {
                          color: theme =>
                            MODE[theme.palette.mode].tab.notificationInfo.font,
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

                return (
                  <Tab
                    sx={{
                      textTransform: 'none',
                      minWidth: 45,
                      px: 2,
                      // color: tab?.hasData ? 'yellow' : undefined,
                    }}
                    key={index}
                    label={label}
                    to={tab.link}
                    value={tab.name}
                    disableRipple
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
              overflow: 'auto',
              // minHeight: 500,

              bgcolor: theme => MODE[theme.palette.mode].tab.background,
            }}
          >
            {tabs.map((tab, index) => {
              return (
                <TabPanel key={index} value={tabSelected} index={tab.name}>
                  {tab.component}
                  {patient.obStudyType === '1' &&
                    patient.noFetus !== 1 &&
                    !['Image', 'Editor', 'EFW Charts'].includes(tab.name) && (
                      <div
                        style={{ position: 'absolute', top: 180, right: 46 }}
                      >
                        <Chip
                          label={`Fetus ${FETUS_NAME[patient.currentFetus]}`}
                          size='medium'
                          // color='warning'
                          sx={{
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: theme =>
                              theme.palette.mode === 'dark' ? '#233' : 'white',
                            backgroundColor: theme =>
                              theme.palette.mode === 'dark'
                                ? orange[400]
                                : orange[800],
                          }}
                        />
                      </div>
                    )}
                </TabPanel>
              )
            })}
          </Paper>
        </>
      )}
      <Feedback />
    </>
  )
}

export default TabIndex

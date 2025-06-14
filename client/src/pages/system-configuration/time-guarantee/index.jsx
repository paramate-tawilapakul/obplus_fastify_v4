import { useState, useContext, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useMediaQuery } from '@mui/material'
import Grid from '@mui/material/Grid'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import { makeStyles } from '@mui/styles'

import Layout from '../../../components/layout/Layout'
import LeftButton from '../button'
import { MODE } from '../../../config'
import { checkLogin, hasPermission } from '../../../utils'
import DataContext from '../../../context/data/dataContext'
// import TimeGuarantee from './TimeGuarantee'
import DefaultDate from './DefaultDate'
import { getMatchScreenWidth } from '../utils'

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

const Index = () => {
  const { user } = useContext(DataContext)
  const history = useHistory()
  const classes = useStyles()

  const px = getMatchScreenWidth(useMediaQuery)
  const reduceHeight = 165
  const [elHeight, setElHeight] = useState(window.innerHeight - reduceHeight)
  window.addEventListener('resize', setElementHeight)
  function setElementHeight(e) {
    setElHeight(e.currentTarget.innerHeight - reduceHeight)
  }

  const [tabSelected, setTabSelected] = useState('Default Date & List')
  const allTabs = [
    // {
    //   name: 'Time Guarantee',
    //   id: 'timeGuarantee',
    //   component: <TimeGuarantee />,
    // },

    {
      name: 'Default Date & List',
      id: 'defaultDate',
      component: <DefaultDate />,
    },
  ]

  const handleChange = (event, tabSelected) => {
    setTabSelected(tabSelected)
  }

  useEffect(() => {
    checkLogin()

    if (user) {
      hasPermission('allowTimeguaranteeConfig', history, user, 'setting')
      // fetchData()
    }

    return () => {}

    // eslint-disable-next-line
  }, [user])

  function renderTabs() {
    return (
      <Paper elevation={4}>
        <Box
          sx={{
            bgcolor: theme => MODE[theme.palette.mode].tab.inActive.background,
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
            {allTabs.map((tab, index) => {
              let label = tab.name

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
            bgcolor: theme => MODE[theme.palette.mode].tab.background,
            overflow: 'auto',
          }}
        >
          {allTabs.map((tab, index) => {
            return (
              <TabPanel key={index} value={tabSelected} index={tab.name}>
                {tab.component}
              </TabPanel>
            )
          })}
        </Paper>
      </Paper>
    )
  }

  return (
    <Layout>
      <LeftButton />
      <Grid container spacing={2} sx={{ px, pt: 0 }}>
        <Grid item xs={12}>
          {user && allTabs.length > 0 && renderTabs(allTabs)}
        </Grid>
      </Grid>
    </Layout>
  )
}

export default Index

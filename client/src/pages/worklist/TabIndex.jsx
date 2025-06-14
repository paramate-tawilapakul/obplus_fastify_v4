import { useState, useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
// import Badge from '@mui/material/Badge'
import { makeStyles } from '@mui/styles'

import { MODE } from '../../config'
import { checkLogin } from '../../utils'

import Layout from '../../components/layout/Layout'
import DataContext from '../../context/data/dataContext'
import tabData from './tab-data'

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

function TabIndex({ tabName }) {
  const [tabSelected, setTabSelected] = useState(tabName)
  const classes = useStyles()
  const { user, setPatient } = useContext(DataContext)

  const handleChange = (event, tabSelected) => {
    setTabSelected(tabSelected)
  }

  useEffect(() => {
    checkLogin()
    if (user) {
      setPatient(null)
    }

    return () => {}
    // eslint-disable-next-line
  }, [user])

  function renderTabs() {
    return (
      <Paper
        elevation={4}
        sx={{
          mx: { xs: 1, xl: 20 },
        }}
      >
        <Box
          sx={{
            // mx: { sm: 1, md: 4, xl: 10 },
            display: 'flex',
            bgcolor: theme => MODE[theme.palette.mode].tab.inActive.background,
            justifyContent: 'flex-start',
          }}
        >
          <Tabs
            className={classes.tab}
            value={tabSelected}
            onChange={handleChange}
            // variant='scrollable'
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
              // [`& .${tabsClasses.scrollButtons}`]: {
              //   '&.Mui-disabled': { opacity: 0.3 }
              // }
            }}
          >
            {tabData
              // ?.filter(tab => tab.show)
              .map((tab, index) => {
                return (
                  <Tab
                    disableRipple
                    sx={{
                      textTransform: 'none',
                      minWidth: 45,
                      px: 2,
                      display: !tab.show ? 'none' : undefined,
                    }}
                    key={index}
                    //  label={label}
                    label={tab.name}
                    component={Link}
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
            bgcolor: theme => MODE[theme.palette.mode].tab.background,
          }}
        >
          {tabData
            // ?.filter(tab => tab.show)
            .map((tab, index) => {
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

  return <Layout>{user && renderTabs()}</Layout>
}

TabIndex.propTypes = {
  tabName: PropTypes.string.isRequired,
}

export default TabIndex

import { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'
import AppRegistrationIcon from '@mui/icons-material/AppRegistration'
import SettingsIcon from '@mui/icons-material/Settings'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import FindInPageIcon from '@mui/icons-material/FindInPage'
import KeyIcon from '@mui/icons-material/Key'
import ListAltIcon from '@mui/icons-material/ListAlt'
import BackupTableIcon from '@mui/icons-material/BackupTable'
import Typography from '@mui/material/Typography'

import { APP_CONFIG, APP_ROUTES, MODE } from '../../config'
import DataContext from '../../context/data/dataContext'
import ChangePasswordDialog from '../page-tools/ChangePasswordDialog'

function Sidebar({ toggleDrawer, drawer }) {
  const { user, systemProperties } = useContext(DataContext)
  const [dialog, setDialog] = useState(false)

  const sidebarMenu = [
    {
      name: 'Patient Management',
      show: user?.allowPatientManagement,
      subMenu: [
        {
          name: 'Registration',
          link: `/${APP_CONFIG.APP_NAME}/${APP_ROUTES.registration}`,
          icon: <AppRegistrationIcon />,
          show: user?.allowRegistration,
        },
      ],
    },
    {
      name: 'Report Management',
      show: user?.allowReportManagement,
      subMenu: [
        {
          name: 'Worklist',
          link: `/${APP_CONFIG.APP_NAME}/${APP_ROUTES.worklist}`,
          icon: <ListAltIcon />,
          show: user?.allowWorklist,
        },
        {
          name: 'Report Template',
          link: `/${APP_CONFIG.APP_NAME}/${APP_ROUTES.reportTemplate}`,
          icon: <BackupTableIcon />,
          show: user?.allowReportTemplate,
        },
        {
          name: 'Teaching Files',
          link: `/${APP_CONFIG.APP_NAME}/${APP_ROUTES.teachingFiles}`,
          icon: <FileCopyIcon />,
          show: user?.allowTeachingFiles,
        },
        {
          name: 'Report Search',
          link: `/${APP_CONFIG.APP_NAME}/${APP_ROUTES.reportSearch}`,
          icon: <FindInPageIcon />,
          show: user?.allowReportSearch,
        },
      ],
    },
    {
      name: 'Setting',
      show: '1',
      subMenu: [
        {
          name: 'System Configuration',
          link: `/${APP_CONFIG.APP_NAME}/${APP_ROUTES.systemConfiguration}`,
          icon: <SettingsIcon />,
          show: user?.allowSystemConfig,
        },
        {
          name: 'Change Password',
          icon: <KeyIcon />,
          func: () => setDialog(true),
          show: '1',
        },
      ],
    },
  ]

  const linkToExternal = []

  const list = () => {
    return (
      <Box
        role='presentation'
        onClick={toggleDrawer(false)}
        onKeyDown={toggleDrawer(false)}
        sx={{
          width: 230,
          bgcolor: theme => MODE[theme.palette.mode].tab.active,
          height: '100%',
        }}
      >
        {/* <img src={logoImg} style={{ width: 100 }} alt='logo' /> */}
        <List>
          {sidebarMenu.map(menu => {
            return (
              <div
                key={menu.name}
                style={{ display: menu.show === '1' ? undefined : 'none' }}
              >
                <Typography variant='h6' sx={{ pl: 1, mt: 0.5 }}>
                  {menu.name}
                </Typography>

                {menu.subMenu.map(sub => {
                  return (
                    <ListItemButton
                      key={sub.name}
                      component={
                        linkToExternal.includes(sub.name) || sub.func
                          ? undefined
                          : Link
                      }
                      to={
                        linkToExternal.includes(sub.name) || sub.func
                          ? undefined
                          : sub.link
                      }
                      onClick={
                        linkToExternal.includes(sub.name)
                          ? () => {
                              window.open(sub.externalLink)
                            }
                          : sub.func
                          ? sub.func
                          : undefined
                      }
                      sx={{
                        px: 2,
                        py: 0.5,
                        display: sub.show === '1' ? undefined : 'none',
                      }}
                    >
                      <ListItemIcon>{sub.icon}</ListItemIcon>
                      <ListItemText
                        primary={sub.name}
                        style={{ marginLeft: '-20px' }}
                      />
                    </ListItemButton>
                  )
                })}
                <Divider />
              </div>
            )
          })}
        </List>
      </Box>
    )
  }

  return (
    user &&
    systemProperties && (
      <>
        <Drawer anchor='left' open={drawer} onClose={toggleDrawer(false)}>
          {list()}
        </Drawer>
        <ChangePasswordDialog
          dialog={dialog}
          setDialog={setDialog}
          user={user.code}
        />
      </>
    )
  )
}

Sidebar.propTypes = {
  toggleDrawer: PropTypes.func.isRequired,
  drawer: PropTypes.bool.isRequired,
}

export default Sidebar

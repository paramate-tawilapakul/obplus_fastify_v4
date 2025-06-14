import { useContext, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import Grid from '@mui/material/Grid'
import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import ListItemAvatar from '@mui/material/ListItemAvatar'

import Layout from '../../components/layout/Layout'
import { menus } from './menus'
import DataContext from '../../context/data/dataContext'
import { checkLogin, hasPermission } from '../../utils'
import { MODE, reportBgColor } from '../../config'

function Index() {
  const { user, systemProperties } = useContext(DataContext)

  const [systemMenu, setSystemMenu] = useState(null)

  const history = useHistory()

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor:
      theme.palette.mode === 'dark'
        ? MODE[theme.palette.mode].tab.active.background
        : reportBgColor.light,
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    // color: theme.palette.text.primary,
    color: MODE[theme.palette.mode].dataGrid.font,
  }))

  function makeMenuPermission() {
    let newMenu = [...menus]

    newMenu = newMenu.map(m => {
      if (m.id === 'user') return { ...m, show: user.allowUserConfig === '1' }
      if (m.id === 'order') return { ...m, show: user.allowOrderConfig === '1' }
      if (m.id === 'location')
        return { ...m, show: user.allowLocationConfig === '1' }
      if (m.id === 'timeGuarantee')
        return { ...m, show: user.allowTimeguaranteeConfig === '1' }

      if (m.id === 'systemProperties')
        return { ...m, show: user.allowSystemPropertiesConfig === '1' }

      if (m.id === 'feedback')
        return {
          ...m,
          show: user.code === 'admin' && systemProperties?.obFeedback === 'YES',
        }
    })

    // console.log(newMenu)

    setSystemMenu(newMenu)
  }

  useEffect(() => {
    checkLogin()

    if (user) {
      hasPermission('allowSystemConfig', history, user)
      makeMenuPermission()
    }

    return () => {}

    // eslint-disable-next-line
  }, [user])

  return (
    <Layout>
      <Grid container spacing={2} sx={{ px: 9, pt: 1 }}>
        {systemMenu &&
          systemMenu.length > 0 &&
          systemMenu.map((menu, index) => {
            if (menu.show)
              return (
                <Grid item xs={12} md={6} xl={4} key={index}>
                  <Item
                    sx={{
                      cursor: 'pointer',
                      height: '100%',
                      '&:hover': {
                        boxShadow: '2px 2px 6px #1d1d1d',
                        transform: 'scale(1.015)',
                      },
                    }}
                    onClick={() => history.push(menu.link)}
                  >
                    <ListItem alignItems='flex-start'>
                      <ListItemAvatar>{menu.icon}</ListItemAvatar>
                      <ListItemText
                        primary={
                          <>
                            <Typography variant='h6'>{menu.header}</Typography>
                          </>
                        }
                        secondary={
                          <>
                            <Typography component='span' variant='body2'>
                              {menu.title}
                            </Typography>
                          </>
                        }
                      ></ListItemText>
                    </ListItem>
                  </Item>
                </Grid>
              )
          })}
      </Grid>
    </Layout>
  )
}

export default Index

import { useState, useEffect, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import axios from 'axios'
import sortBy from 'lodash/sortBy'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'

import {
  checkLogin,
  combineTreeArr,
  convertToTreeObj,
  hasPermission,
} from '../../utils'
import { API, MODE, reqHeader } from '../../config'
import DataContext from '../../context/data/dataContext'

import Layout from '../../components/layout/Layout'
import Folder from './Folder'
import List from './List'

function Teaching() {
  const history = useHistory()
  const { systemProperties, theme, user } = useContext(DataContext)
  const [teaching, setTeaching] = useState(null)
  const [selectedFolder, setSelectedFolder] = useState('')

  useEffect(() => {
    checkLogin()

    if (user) {
      hasPermission('allowTeachingFiles', history, user)
    }

    if (systemProperties) getFolder()

    return () => {}
    // eslint-disable-next-line
  }, [user, systemProperties])

  async function getFolder() {
    const response = await axios.get(API.TEACHING_FOLDER)
    let listPrivate = response.data.data
    let listPublic = []

    if (response.data.total === 0) {
      // create private folder
      const body = {
        folderName: 'Private',
        parentId: 0,
        parent: 'Private',
      }

      const response = await axios.post(API.TEACHING_FOLDER, body, reqHeader)

      listPrivate = [
        {
          FOLDER_ID: response.data.data[0].FOLDER_ID,
          PARENT_ID: response.data.data[0].PARENT_ID,
          FOLDER_NAME: response.data.data[0].FOLDER_NAME,
        },
      ]
    }

    if (systemProperties.publicTeachingFiles === 'enable') {
      const response = await axios.get(API.TEACHING_FOLDER, {
        params: {
          folderName: 'Public',
        },
      })

      listPublic = response.data.data

      if (response.data.total === 0) {
        const body = {
          folderName: 'Public',
          parentId: 0,
          parent: 'Public',
        }

        const response = await axios.post(API.TEACHING_FOLDER, body, reqHeader)

        listPublic = [
          {
            FOLDER_ID: response.data.data[0].FOLDER_ID,
            PARENT_ID: response.data.data[0].PARENT_ID,
            FOLDER_NAME: response.data.data[0].FOLDER_NAME,
          },
        ]
      }
    }

    const data = {
      private: sortBy(listPrivate, o => o.FOLDER_NAME),
      public: sortBy(listPublic, o => o.FOLDER_NAME),
    }
    const privateArr = convertToTreeObj(data.private)
    const publicArr = convertToTreeObj(data.public)

    const combineTeaching = combineTreeArr(privateArr, publicArr)

    setTeaching(combineTeaching)
  }

  return (
    <Layout>
      <Stack
        direction='row'
        justifyContent='center'
        alignItems='flex-start'
        sx={{ px: 1 }}
        spacing={1}
      >
        <Box sx={{ width: '15%' }}>
          {theme && teaching?.length > 0 && (
            <Paper
              elevation={4}
              sx={{
                borderRadius: 0,
                overflowY: 'auto',

                bgcolor: theme =>
                  theme.palette.mode === 'dark' ? '' : '#f8f8f8',
              }}
            >
              <Folder
                teaching={teaching}
                setSelectedFolder={setSelectedFolder}
                theme={theme}
              />
            </Paper>
          )}
        </Box>
        <Box sx={{ width: '85%' }}>
          {selectedFolder && (
            <Paper
              elevation={4}
              sx={{
                // height: matches768px ? 525 : 700,
                borderRadius: 0,
                p: 1,
                bgcolor: theme =>
                  theme.palette.mode === 'dark'
                    ? MODE[theme.palette.mode].tab.active // ''
                    : '#f8f8f8',
              }}
            >
              <List
                selectedFolder={selectedFolder}
                systemProperties={systemProperties}
              />
            </Paper>
          )}
        </Box>
      </Stack>
    </Layout>
  )
}

export default Teaching

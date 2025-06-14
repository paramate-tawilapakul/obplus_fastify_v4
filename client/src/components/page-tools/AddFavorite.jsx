import { useState } from 'react'
import axios from 'axios'
import PropTypes from 'prop-types'
import useTheme from '@mui/material/styles/useTheme'
import StarOutlineIcon from '@mui/icons-material/StarOutline'
import StarIcon from '@mui/icons-material/Star'

import { API, STORAGE_NAME, reqHeader } from '../../config'
import SnackBarWarning from './SnackBarWarning'
import { yellow } from '@mui/material/colors'

const style = {
  mr: 0.5,
}

function AddFavorite({
  isFavorite,
  radCode,
  accession,
  action,
  studyPriority,
}) {
  const theme = useTheme()
  const [isFav, setIsFav] = useState(isFavorite)
  const [snackWarning, setSnackWarning] = useState({
    show: false,
    message: null,
    autoHideDuration: 1500,
    severity: 'success',
  })

  const { dataList, setDataList } = action

  const priority = JSON.parse(
    window.localStorage.getItem(STORAGE_NAME.priority)
  )

  async function handleClick(condition) {
    const response = await axios.post(
      API.UPDATE_FAVORITE,
      {
        radCode: condition === 'remove' ? '' : radCode,
        accession,
      },
      reqHeader
    )

    if (response.data.data.status) {
      let newData = [...dataList.data]
      let message = 'Add favorite completed'
      let favoriteValue = '0'

      if (condition === 'remove') {
        message = 'Remove favorite completed'
        setIsFav(false)
      } else {
        favoriteValue = radCode
        setIsFav(true)
      }

      newData = newData.map(d => {
        if (d.accessionNumber === accession) {
          return { ...d, studyFavorite: favoriteValue }
        }
        return d
      })

      setSnackWarning(prev => ({
        ...prev,
        show: true,
        message,
      }))

      setDataList({ ...dataList, data: newData })
    }
  }

  return (
    <>
      {isFav ? (
        <StarIcon
          onClick={() => handleClick('remove')}
          titleAccess='Remove favorite'
          sx={style}
          style={{
            color:
              studyPriority !== '2'
                ? yellow['A200']
                : theme.palette.mode === 'dark'
                ? yellow[200]
                : yellow[700],
          }} //studyPriority !== '2' ?
        />
      ) : (
        <StarOutlineIcon
          onClick={() => handleClick('add')}
          titleAccess='Add favorite'
          sx={style}
          style={{
            color:
              studyPriority !== '2'
                ? priority.find(p => p.id.toString() === studyPriority)
                    .fontColor
                : theme.palette.mode === 'dark'
                ? '#FCC7B9'
                : '#666', //light
            // color:
            //   studyPriority !== '2'
            //     ? '#333'
            //     : theme.palette.mode === 'dark'
            //     ? '#f2f2f2'
            //     : '#666',
          }}
        />
      )}

      <SnackBarWarning
        snackWarning={snackWarning}
        setSnackWarning={setSnackWarning}
        vertical='top'
        horizontal='center'
      />
    </>
  )
}

AddFavorite.propTypes = {
  isFavorite: PropTypes.bool.isRequired,
  radCode: PropTypes.string.isRequired,
  accession: PropTypes.string.isRequired,
}

export default AddFavorite

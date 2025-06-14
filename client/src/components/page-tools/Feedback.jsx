import { useState, useRef, useContext } from 'react'
import axios from 'axios'
import { Button, TextField, IconButton } from '@mui/material'
import RateReviewIcon from '@mui/icons-material/RateReview'

import DataContext from '../../context/data/dataContext'
import SnackBarWarning from '../../components/page-tools/SnackBarWarning'

import './feedback.css'
import { API } from '../../config'

const Feedback = () => {
  const { user, patient, systemProperties } = useContext(DataContext)
  const [showIcon, setShowIcon] = useState(true)
  const [showInput, setShowInput] = useState(false)
  const inputRef = useRef(null)

  const [snackWarning, setSnackWarning] = useState({
    show: false,
    message: null,
    severity: null,
    autoHideDuration: 2000,
  })

  async function submitFeedback() {
    const feedback = inputRef.current.value.trim()
    if (!feedback) return alert('Feedback is required!')

    const body = {
      hn: patient.hn,
      accession: patient.accession,
      feedback,
      fromUser: `${user.desc}(${user.code})`,
    }

    const response = await axios.post(API.FEEDBACK, body)
    if (response.data.data.result) {
      setShowInput(false)
      setShowIcon(false)
      setSnackWarning(prev => ({
        ...prev,
        show: true,
        message: 'Send feedback completed!',
        severity: 'success',
      }))
      setTimeout(() => {
        setShowIcon(true)
      }, 2000)
      return
    }
    setSnackWarning(prev => ({
      ...prev,
      show: true,
      message: 'Send feedback fail!',
      severity: 'error',
    }))
  }
  return (
    <>
      {user && patient && systemProperties?.obFeedback === 'YES' && (
        <div className='feedback-container'>
          {showInput && (
            <>
              <div>
                <TextField
                  autoFocus
                  inputRef={inputRef}
                  placeholder='Feedback...'
                  autoComplete='off'
                  sx={{ bgcolor: '#ece0e0' }}
                  multiline
                  rows={3}
                  //   onChange={handleChange}
                  inputProps={{
                    style: {
                      width: 350,
                      fontSize: 16,
                      color: '#000',
                    },
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  sx={{ mt: 0.3, mr: 1 }}
                  variant='outlined'
                  onClick={() => {
                    setShowIcon(true)
                    setShowInput(false)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  sx={{ mt: 0.3 }}
                  variant='contained'
                  onClick={() => submitFeedback()}
                >
                  Submit
                </Button>
              </div>
            </>
          )}
          {showIcon && (
            <IconButton
              aria-label='feedback'
              size='large'
              title='Send feedback'
              onClick={() => {
                setShowIcon(false)
                setShowInput(true)
              }}
            >
              <RateReviewIcon fontSize='inherit' />
            </IconButton>
          )}

          <SnackBarWarning
            snackWarning={snackWarning}
            setSnackWarning={setSnackWarning}
            vertical='bottom'
            horizontal='right'
          />
        </div>
      )}
    </>
  )
}

export default Feedback

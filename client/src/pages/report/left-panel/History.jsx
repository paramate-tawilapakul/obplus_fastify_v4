import { useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'
import Fade from '@mui/material/Fade'
import Box from '@mui/material/Box'

import { MODE } from '../../../config'
import { green } from '@mui/material/colors'
import { convertDateTimeFormat } from '../../../utils'
import { viewPdf } from '../report-utils'
import BackDrop from '../../../components/page-tools/BackDrop'

const style = {
  ml: 0,
  my: 0.3,
  width: '100%',
}

const History = ({ patient, systemProperties, user, doctor, historyData }) => {
  const [openBackDrop, setOpenBackDrop] = useState(false)
  return (
    <>
      {historyData && patient && (
        <Fade in={true} timeout={200}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <Stack
              sx={{
                width: '100%',
                px: 0.5,
                py: 0.5,
                bgcolor: theme =>
                  theme.palette.mode === 'dark' ? 'grey.900' : 'grey.300',
              }}
            >
              <Typography variant='body1' component='span'>
                <span
                  style={{
                    paddingLeft: 3,
                    paddingRight: 50,
                  }}
                >
                  Date
                </span>{' '}
                |<span style={{ paddingLeft: 3 }}>Description</span>
              </Typography>
            </Stack>
            <div
              style={{
                overflow: 'auto',
                // height: elHeight - 53,
              }}
            >
              {patient &&
                historyData.map((h, i) => (
                  <Stack
                    direction='row'
                    sx={{
                      whiteSpace: 'nowrap',
                      pl: 0.5,
                      pt: 0.5,
                      '&:hover': {
                        bgcolor: theme =>
                          MODE[theme.palette.mode].dataGrid.rowHover,
                      },
                    }}
                    key={i}
                  >
                    <Typography
                      sx={{
                        ...style,
                        whiteSpace: 'nowrap',
                        minWidth: 375,
                        cursor: 'pointer',
                        fontSize: 16,
                        color: theme => MODE[theme.palette.mode].dataGrid.font,
                      }}
                      variant='body1'
                      component='div'
                      style={{ display: 'flex' }}
                      onClick={() =>
                        viewPdf(
                          h,
                          systemProperties,
                          doctor,
                          user,
                          true,
                          setOpenBackDrop
                        )
                      }
                    >
                      {convertDateTimeFormat(h.orderDate, 'D MMM YYYY')}
                      &nbsp;
                      {h.prelimDoctor === user.code && (
                        <AssignmentIndIcon
                          sx={{
                            color: theme =>
                              theme.palette.mode === 'dark'
                                ? green[300]
                                : green[700],
                          }}
                        />
                      )}
                      {h.prelimDoctor !== user.code && <span>&nbsp;</span>}
                      {h.description}
                    </Typography>
                  </Stack>
                ))}
            </div>
          </Box>
        </Fade>
      )}
      <BackDrop openBackDrop={openBackDrop} />
    </>
  )
}

export default History

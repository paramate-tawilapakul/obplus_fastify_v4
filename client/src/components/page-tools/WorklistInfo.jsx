import PrintIcon from '@mui/icons-material/Print'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import FeedIcon from '@mui/icons-material/Feed'
import { blue, red } from '@mui/material/colors'

import { printPdf, viewPdf } from '../../pages/report/report-utils'

function WorklistInfo({
  theme,
  params,
  systemProperties,
  doctor,
  user,
  handleCellClick,
  setOpenBackDrop = null,
}) {
  return (
    <>
      {['D', 'R'].includes(params.row.status) && (
        <>
          <PrintIcon
            titleAccess='Print report'
            style={{
              color: theme.palette.mode === 'dark' ? blue[200] : blue[400],
              marginLeft: '-5px',
              marginRight: '8px',
            }}
            onClick={() =>
              printPdf(
                'worklist',
                params.row,
                systemProperties,
                doctor,
                user,
                true,
                setOpenBackDrop
              )
            }
          />
          <PictureAsPdfIcon
            titleAccess='View report'
            style={{
              color: theme.palette.mode === 'dark' ? red[200] : red[400],
              marginLeft: '-5px',
              marginRight: '3px',
            }}
            onClick={() =>
              viewPdf(
                params.row,
                systemProperties,
                doctor,
                user,
                true,
                setOpenBackDrop
              )
            }
          />
        </>
      )}

      <FeedIcon
        titleAccess='Open report without image'
        sx={{ mr: 0.5 }}
        onClick={() => handleCellClick(params, false)}
      />
    </>
  )
}

export default WorklistInfo

import Chip from '@mui/material/Chip'

import { STUDY_NAME } from '../../config'

function StatusChip({ studyType }) {
  return (
    STUDY_NAME[studyType] && (
      <Chip
        title={`${studyType === '1' ? 'Obstetrics' : 'Gynecology'}`}
        label={`${STUDY_NAME[studyType]}`}
        size='small'
        color={`${studyType === '1' ? 'success' : 'info'}`}
      />
    )
  )
}

export default StatusChip

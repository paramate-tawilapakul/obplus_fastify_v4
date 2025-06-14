import PropTypes from 'prop-types'
import Pagination from '@mui/material/Pagination'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import { STORAGE_NAME } from '../../config'

function Paginations({
  total,
  pageNum,
  rowsPerPage,
  handleChangePage,
  handleChangeRows,
}) {
  function renderPagination() {
    const totalPage = total ? Math.ceil(total / rowsPerPage) : 0

    return (
      <Pagination
        size='large'
        count={totalPage}
        showFirstButton
        showLastButton
        page={pageNum}
        onChange={handleChangePage}
      />
    )
  }

  return (
    <Stack
      direction='row'
      spacing={2}
      justifyContent='space-between'
      alignItems='center'
      sx={{ pl: 0, mt: 1, mb: 0.5, height: 35 }}
    >
      <Stack
        direction='row'
        spacing={0}
        justifyContent='flex-start'
        alignItems='center'
      >
        <FormControl size='small' sx={{ m: 1, minWidth: 60 }}>
          <Select
            value={rowsPerPage}
            onChange={e => {
              window.localStorage.setItem(
                STORAGE_NAME.customRowsPerPage,
                e.target.value
              )
              handleChangeRows(e)
            }}
            inputProps={{ 'aria-label': 'Without label' }}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </FormControl>
        <Typography variant='subtitle1'>
          per page of <strong>{total.toLocaleString()}</strong>{' '}
          {total === 0 || total === 1 ? 'row' : 'rows'}
        </Typography>
      </Stack>

      <div>{renderPagination()}</div>
    </Stack>
  )
}

Paginations.propTypes = {
  total: PropTypes.number.isRequired,
  pageNum: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRows: PropTypes.func.isRequired,
}

export default Paginations

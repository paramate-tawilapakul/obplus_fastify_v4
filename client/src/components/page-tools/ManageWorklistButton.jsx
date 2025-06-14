// import { useContext } from 'react'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import RefreshIcon from '@mui/icons-material/Refresh'
import TextField from '@mui/material/TextField'
// import Autocomplete from '@mui/material/Autocomplete'
// import FormControl from '@mui/material/FormControl'
// import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd'
// import ListAltIcon from '@mui/icons-material/ListAlt'
// import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
// import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore'
import FileOpenIcon from '@mui/icons-material/FileOpen'
// import ClearIcon from '@mui/icons-material/Clear'
// import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove'
// import CallSplitIcon from '@mui/icons-material/CallSplit'
// import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { MODE } from '../../config'
// import { isMobileOrTablet } from '../../utils'
import { inputStyle, btStyle } from './form-style'
// import { qs } from '../../utils/domUtils'
// import DataContext from '../../context/data/dataContext'

const btr = {
  mr: 0.5,
}

const dontUseTeachingFile = ['new', 'teachingFiles']
// const useTagFilter = ['teachingFiles']

const bStyle = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      fontSize: 16,
      // mt: 0,
    },
    '&:hover fieldset': {
      borderColor: theme => MODE[theme.palette.mode].input,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme => MODE[theme.palette.mode].input,
    },
  },
}

function ManageWorklistButton({
  handleReloadClick,
  handleSearch,
  handleTeachingFolders,
  formRef,
  tab = 'new',
  date,
  setDate,
  stateFilterOptions,
  reset,
  // tag = [],
  // setTag = null,
  handleDeleteTeachingFiles = null,
}) {
  // const { masterTags } = useContext(DataContext)
  // const focusHnInputField = parent => {
  //   if (parent) {
  //     const note = qs('input[name="hn"]', parent)
  //     setTimeout(() => {
  //       note.focus()
  //     }, 100)
  //   }
  // }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        margin: 0,
        padding: 0,
      }}
    >
      <div style={{ marginTop: 1 }}>
        <IconButton
          title='Reload'
          onClick={handleReloadClick}
          sx={{
            color: theme => MODE[theme.palette.mode].buttonReload,
          }}
          aria-label='reload'
          component='span'
        >
          <RefreshIcon />
        </IconButton>

        {!dontUseTeachingFile.includes(tab) && (
          <Button
            variant='contained'
            onClick={handleTeachingFolders}
            sx={{
              ...btr,
              ...btStyle,
            }}
            startIcon={<FileOpenIcon />}
          >
            Teaching Files
          </Button>
        )}

        {tab === 'teachingFiles' && (
          <>
            <Button
              variant='contained'
              onClick={handleTeachingFolders}
              sx={{
                ...btr,
                ...btStyle,
              }}
              // startIcon={<DriveFileMoveIcon />}
            >
              Move
            </Button>
            <Button
              variant='contained'
              color='error'
              onClick={handleDeleteTeachingFiles}
              sx={btr}
              // startIcon={<ClearIcon />}
            >
              Delete
            </Button>
          </>
        )}
      </div>
      <div style={{ marginTop: '-6px' }}>
        <form ref={formRef} onSubmit={handleSearch} autoComplete='off'>
          <TextField
            label={tab === 'teachingFiles' ? 'HN or Note' : 'HN'}
            variant='outlined'
            size='small'
            margin='dense'
            InputProps={{
              // placeholder: tab === 'teachingFiles' ? 'HN or Note' : 'HN...',
              fontSize: 16,
            }}
            InputLabelProps={{
              sx: {
                // m: 0,
                // ml: 1.5,
                fontSize: 16,
              },
            }}
            sx={{
              width: 120,
              ...inputStyle,
              ...bStyle,
            }}
            // InputLabelProps={{
            //   shrink: true,
            //   sx: {
            //     // m: 0,
            //     // ml: 1.5,
            //     fontSize: 16,
            //   },
            // }}
            // InputProps={{
            //   style: {
            //     fontSize: 16,
            //     paddingTop: 5,
            //     paddingBottom: 4,
            //     paddingLeft: 10,
            //   },
            // }}
            name='hn'
            // autoFocus={!isMobileOrTablet()}
            // ref={focusHnInputField}
            autoFocus
          />
          <TextField
            label='Name'
            variant='outlined'
            size='small'
            margin='dense'
            sx={{
              width: 120,
              ...inputStyle,
              ...bStyle,
            }}
            name='name'
          />
          <TextField
            label='Description'
            variant='outlined'
            size='small'
            margin='dense'
            sx={{
              width: 120,
              ...inputStyle,
              ...bStyle,
            }}
            name='desc'
          />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              slotProps={{
                actionBar: { actions: ['clear', 'today'] },
                textField: {
                  size: 'small',
                  name: 'dateFrom',
                  sx: { ...inputStyle, ...bStyle, mt: 1, width: 155 },
                  InputLabelProps:
                    stateFilterOptions && stateFilterOptions.dateFrom !== ''
                      ? { shrink: true }
                      : undefined,
                },
              }}
              allowSameDateSelection
              clearable
              label='From'
              value={date.from}
              format='dd/MM/yyyy'
              onChange={newValue =>
                setDate(prev => {
                  if (!prev.to) {
                    return {
                      ...prev,
                      from: newValue,
                      to: newValue,
                    }
                  } else {
                    if (newValue > prev.to) {
                      return {
                        ...prev,
                        from: newValue,
                        to: newValue,
                      }
                    }
                    return {
                      ...prev,
                      from: newValue,
                    }
                  }
                })
              }
            />
          </LocalizationProvider>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              slotProps={{
                actionBar: { actions: ['clear', 'today'] },
                textField: {
                  size: 'small',
                  name: 'dateTo',
                  sx: { ...inputStyle, ...bStyle, mt: 1, width: 155 },
                  InputLabelProps:
                    stateFilterOptions && stateFilterOptions.dateTo !== ''
                      ? { shrink: true }
                      : undefined,
                },
              }}
              allowSameDateSelection
              clearable
              label='To'
              value={date.to}
              format='dd/MM/yyyy'
              onChange={newValue =>
                setDate(prev =>
                  !prev.from
                    ? {
                        ...prev,
                        from: newValue,
                        to: newValue,
                        // verifiedDate: null,
                      }
                    : {
                        ...prev,
                        to: newValue,
                        // verifiedDate: null
                      }
                )
              }
            />
          </LocalizationProvider>
          {/* {useTagFilter.includes(tab) && (
            <FormControl size='small' sx={{ ...btr, mt: 0.5, minWidth: 155 }}>
              <Autocomplete
                size='small'
                multiple
                value={tag}
                options={masterTags}
                getOptionLabel={option => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(event, values) => {
                  // console.log(values.map(v => v.id).join(','))
                  setTag(values)
                }}
                renderInput={params => {
                  // console.log(params)
                  return (
                    <TextField
                      {...params}
                      name='tagId'
                      size='small'
                      variant='outlined'
                      label='Tag'
                      InputLabelProps={
                        stateFilterOptions && stateFilterOptions.tagId !== ''
                          ? { shrink: true }
                          : undefined
                      }

                      // onChange={e => console.log(e.target.value)}
                      // placeholder="Favorites"
                    />
                  )
                }}
              />
            </FormControl>
          )} */}
          <Button
            sx={{ ...btStyle, ml: 0.5, height: 40, mt: 1 }}
            // startIcon={<SearchIcon />}
            size='small'
            variant='contained'
            type='submit'
            title='Search'
          >
            <SearchIcon />
          </Button>
          <Button
            sx={{ ...btStyle, ml: 0.5, height: 40, mt: 1 }}
            size='small'
            variant='contained'
            onClick={reset}
          >
            Clear
          </Button>
        </form>
      </div>
    </div>
  )
}

export default ManageWorklistButton

import PropTypes from 'prop-types'
import parse from 'html-react-parser'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import Grow from '@mui/material/Grow'
import useMediaQuery from '@mui/material/useMediaQuery'

import {
    reFormatDate,
    reFormatFullDate,
    reFormatTime,
} from '../../../utils'
import { cleanUpContent, replacePwithBR, reFormatSpace } from '../report-utils'
import { MODE } from '../../../config'

const font = { fontFamily: 'tahoma' }

function Popup({ renderActionBt, open, setOpen, tab, fontSize = 14 }) {
    const matches1600px = useMediaQuery('(max-width:1600px)')
    const matches1280px = useMediaQuery('(max-width:1280px)')
    const matches768px = useMediaQuery('(max-height:768px)')
    const matches900px = useMediaQuery('(max-height:900px)')


    const ftSize = parseInt(fontSize) + 2

    let examDateTime = ''

    if (tab !== 'template') {
        if (open.data.examDate) {
            examDateTime = `${open.data.examDate}, ${open.data.examTime}`
        }
    }

    return (
        <Grow in={open.show}>
            <Stack
                direction='row'
                sx={{
                    position: 'absolute',
                    top: 230,
                    left: matches1600px ? 12 : 18,

                    // bgcolor: matches ? 'red' : 'blue',
                    zIndex: 100,
                    maxHeight: matches768px ? 390 : matches900px ? 450 : 532,
                    p: 0,
                }}
            >
                <CloseIcon
                    fontSize='large'
                    sx={{
                        position: 'absolute',
                        alignSelf: 'flex-start',
                        cursor: 'pointer',
                        mr: 1.5,
                        mt: -7.6,
                        border: 1,
                        bgcolor: theme =>
                            theme.palette.mode === 'dark'
                                ? MODE[theme.palette.mode].tab.inActive //#222
                                : '#B9C49E'

                    }}
                    titleAccess='close'
                    onClick={() => setOpen({ show: false, data: null })}
                />
                <Paper
                    elevation={4}
                    sx={{
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        minWidth: 360,
                        maxWidth: matches1280px
                            ? 400
                            : 450,
                        // minWidth: matches3 ? 560 : matches2 ? 470 : 360,
                        p: 1,
                        mt: -3.2,
                        borderRadius: 0,
                        // backgroundColor: theme =>
                        //   theme.palette.mode === 'dark' ? '#313131' : '#f5f5f9',
                        backgroundColor: theme => MODE[theme.palette.mode].tab.active,
                        color: theme =>
                            theme.palette.mode === 'dark' ? '#f4f4f4' : 'rgba(0, 0, 0, 0.87)',
                    }}
                >
                    <Stack direction='column'>
                        {tab === 'template' ? (
                            <Stack direction='row' justifyContent='space-between'>
                                <Typography color='inherit' variant='h6'>
                                    {open.data.name}
                                </Typography>
                                <div>{renderActionBt(open.data)}</div>
                            </Stack>
                        ) : (
                            <>
                                <Stack direction='row' justifyContent='space-between'>
                                    <div>
                                        <Typography color='inherit' variant='h6'>
                                            {open.data.desc} - {open.data.modality}
                                        </Typography>
                                    </div>
                                    <div style={{ paddingTop: 4 }}>
                                        {renderActionBt(open.data)}
                                    </div>
                                </Stack>
                                {open.data.studyDate && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            direction: 'row',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <Typography
                                            color='inherit'
                                            variant='body1'
                                            sx={{ fontSize: ftSize }}
                                        >
                                            Order Date: {reFormatDate(open.data.studyDate)}
                                            {', '}
                                            {reFormatTime(open.data.studyTime)}
                                        </Typography>
                                    </div>
                                )}
                                {(open.data.examDate || open.data.referencedStudySequence) && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            direction: 'row',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <Typography
                                            color='inherit'
                                            variant='body1'
                                            sx={{ fontSize: ftSize }}
                                        >
                                            Exam Date: {examDateTime}
                                        </Typography>
                                    </div>
                                )}

                                <div
                                    style={{
                                        display: 'flex',
                                        direction: 'row',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <Typography
                                        color='inherit'
                                        variant='body1'
                                        sx={{ fontSize: ftSize }}
                                    >
                                        Report Date:{' '}
                                        {reFormatFullDate(open.data.reportedDate)[0] || ''}
                                        {', '}
                                        {reFormatFullDate(open.data.reportedDate)[1] || ''}
                                    </Typography>
                                </div>
                                {open.data.severity && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            direction: 'row',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <Typography
                                            color='inherit'
                                            variant='body1'
                                            sx={{ fontSize: ftSize }}
                                        >
                                            Severity: {open.data.severity}
                                        </Typography>
                                    </div>
                                )}
                            </>
                        )}

                        <Divider sx={{ mt: 0.5 }} />
                        <Typography
                            variant='body1'
                            component='div'
                            sx={{ ...font, fontSize: ftSize }}
                        >
                            {parse(
                                reFormatSpace(
                                    replacePwithBR(
                                        cleanUpContent(
                                            open.data.content,
                                            tab === 'template' ? 'template' : null
                                        )
                                    )
                                )
                            )}
                        </Typography>
                        {tab === 'history' && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography
                                    color='inherit'
                                    variant='body1'
                                    sx={{ fontSize: ftSize }}
                                >
                                    Report By: {open.data.signerName}
                                </Typography>
                                {/* {open?.data?.content?.length > 650 && (
                  <div>{renderActionBt(open.data)} </div>
                )} */}
                            </div>
                        )}
                    </Stack>
                </Paper>
            </Stack>
        </Grow>
    )
}

Popup.propTypes = {
    renderActionBt: PropTypes.func.isRequired,
    open: PropTypes.object.isRequired,
    setOpen: PropTypes.func.isRequired,
    tab: PropTypes.string.isRequired,
}

export default Popup

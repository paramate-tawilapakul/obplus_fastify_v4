import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import Box from '@mui/material/Box'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cyan, red } from '@mui/material/colors'

const imageBorderColor = theme => {
  if (theme === 'dark') return { default: cyan[400], selected: cyan[800] }

  // return { default: blue[200], selected: blue[300] }
  return { default: cyan[400], selected: cyan[400] }
}

export default function ImageCard({
  data,
  index,
  handleRemoveImage,
  host,
  imageColumn,
  setPhotoIndex,
  setIsOpenLightBox,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    // isDragging,
  } = useSortable({ id: data.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        border: `2px solid`,
        borderColor: theme =>
          data.selected
            ? imageBorderColor(theme.palette.mode).selected
            : imageBorderColor(theme.palette.mode).default,

        borderRadius: 1.5,
        p: 0.5,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ marginTop: '-3px' }}>{index + 1}</div>
        <Box
          {...attributes}
          {...listeners}
          sx={{
            cursor: 'grab',
            touchAction: 'none',
          }}
        >
          <DragIndicatorIcon />
        </Box>
        <RemoveCircleIcon
          onClick={() => handleRemoveImage(data.name)}
          titleAccess='Remove'
          sx={{
            cursor: 'pointer',
            mt: -0.4,
            color: theme =>
              theme.palette.mode === 'dark' ? red[200] : red[700],
          }}
        />
      </div>
      <img
        alt='img_dicom'
        src={`${host}${data.src}`}
        width={imageColumn === '2' ? 390 : 600}
        style={{ borderRadius: 4, cursor: 'pointer' }}
        title='Click to view'
        onClick={() => {
          setPhotoIndex(index)
          setIsOpenLightBox(true)
        }}
      />
    </Box>
  )
}

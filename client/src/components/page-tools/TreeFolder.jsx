import { useEffect, useContext, useRef } from 'react'
import axios from 'axios'
import PropTypes from 'prop-types'
import $ from 'jquery'
import 'jstree'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Backdrop from '@mui/material/Backdrop'
import { useConfirm } from 'material-ui-confirm'

import DataContext from '../../context/data/dataContext'
import { API, dialogStyle, reqHeader } from '../../config'
import { qs } from '../../utils/domUtils'
import { dialogTitleStyle, btStyle, inputStyle } from './form-style'

function TreeFolder({
  teaching,
  setTeaching,
  handleAddTeachingFiles,
  setSnackWarning,
  selectedFolder,
  setSelectedFolder,
  position = null,
  isMove = false,
}) {
  const { theme } = useContext(DataContext)
  const inputRef = useRef(null)
  const parentsId = teaching.data.filter(d => d.parent === '#')
  const confirm = useConfirm()

  async function createFolder(data) {
    const body = {
      folderName: data.node.text,
      parentId: data.node.parent,
      parent: parentsId.filter(p => p.id === data.node.parent)[0]?.text || null,
    }

    const response = await axios.post(API.TEACHING_FOLDER, body, reqHeader)

    return response.data.data[0].FOLDER_ID.toString()
  }

  async function editFolder(data) {
    const body = {
      folderName: data.node.text,
      id: data.node.id,
    }
    await axios.put(API.TEACHING_FOLDER, body, reqHeader)
  }

  async function deleteFolder(data) {
    await axios.delete(API.TEACHING_FOLDER, { params: { id: data.node.id } })
  }

  useEffect(() => {
    import(
      `./jstree/themes/default${theme === 'dark' ? '-dark' : ''}/style.min.css`
    )
    treeFolder()

    return () => {}
    // eslint-disable-next-line
  }, [theme])

  function treeFolder() {
    $('#jstree_')
      .on('create_node.jstree', function (e, data) {
        // console.log('create', data.node)
        $(this).jstree(true).set_id(data.node, 'newnode')
      })
      .on('select_node.jstree', function (e, data) {
        // console.log('select', data.node.id)
        setSelectedFolder(data.node.id)
      })
      .on('rename_node.jstree', async function (e, data) {
        if (data.node.id === 'newnode') {
          const id = await createFolder(data)
          $(this).jstree(true).set_id(data.node, id)
        } else {
          await editFolder(data)
        }
      })
      .on('delete_node.jstree', function (e, data) {
        deleteFolder(data)
      })
      .jstree({
        core: {
          themes: { name: `default${theme === 'dark' ? '-dark' : ''}` },
          check_callback: true,
          data: teaching.data,
          ccp: false,
        },
        plugins: ['contextmenu'],
        contextmenu: {
          items: function ($node) {
            const tree = $('#jstree_').jstree(true)
            let menu = {
              Create: {
                label: 'Create',
                action: function () {
                  $node = tree.create_node($node)
                  tree.edit($node)
                },
              },
            }

            if ($node.text !== 'Public' && $node.text !== 'Private') {
              menu['Rename'] = {
                label: 'Rename',
                action: function () {
                  tree.edit($node)
                },
              }
            }

            if ($node.parent !== '#') {
              menu['Delete'] = {
                label: 'Delete',
                action: function () {
                  confirm({
                    title: `Confirm to delete "${$node.text}"  ?`,
                    confirmationButtonProps: { autoFocus: true },
                    dialogProps: {
                      maxWidth: 'xs',
                      PaperProps: { sx: dialogStyle },
                    },
                  })
                    .then(() => {
                      $node = tree.delete_node($node)
                    })
                    .catch(e => {
                      console.log(e)
                    })
                },
              }
            }

            return menu
          },
        },
      })
      .bind('ready.jstree', function () {
        $(this).jstree('open_all')
      })
  }

  return (
    <>
      <Paper
        elevation={4}
        sx={{
          position: 'absolute',
          top: position ? position.top : 140,
          right: position ? position.right : undefined,
          left: position ? undefined : '50%',
          transform: position ? undefined : 'translate(-50%, 0)',
          width: 400,
          overflowY: 'auto',
          // px: 2,
          // pt: 1.5,
          zIndex: 1101,
        }}
      >
        {!isMove && (
          <>
            <Typography variant='h6' sx={dialogTitleStyle}>
              Teaching Files
            </Typography>
            <TextField
              fullWidth
              size='small'
              sx={{ ...inputStyle, m: 1, width: 380 }}
              autoFocus
              label='Note'
              ref={inputRef}
            />
          </>
        )}
        <div
          id='jstree_'
          style={{ minHeight: 280, marginTop: 10, marginLeft: 10 }}
        ></div>
        <Button
          sx={{ m: 1, ml: 2 }}
          variant='outlined'
          onClick={() => {
            setSelectedFolder('')
            setTeaching({ show: false, data: [] })
          }}
        >
          Close
        </Button>
        <Button
          sx={{ ...btStyle, mb: 1, mt: 1 }}
          variant='contained'
          onClick={() => {
            if (
              !selectedFolder ||
              parentsId.filter(p => p.id === selectedFolder).length > 0
            ) {
              setSnackWarning({
                show: true,
                message: 'Please select folder',
                severity: 'warning',
                autoHideDuration: 3000,
              })
              return
            }

            if (isMove) {
              handleAddTeachingFiles()
            } else {
              const el = inputRef.current
              const input = qs('input', el)
              handleAddTeachingFiles(input.value)
            }
          }}
        >
          {isMove ? 'Move' : 'Add'}
        </Button>
      </Paper>
      <Backdrop
        sx={{ zIndex: 1100 }}
        open={teaching.show}
        onClick={() => setTeaching({ show: false, data: [] })}
      ></Backdrop>
    </>
  )
}

TreeFolder.propTypes = {
  teaching: PropTypes.object.isRequired,
  setTeaching: PropTypes.func.isRequired,
  handleAddTeachingFiles: PropTypes.func.isRequired,
  selectedFolder: PropTypes.string.isRequired,
  setSelectedFolder: PropTypes.func.isRequired,
  setSnackWarning: PropTypes.func.isRequired,
  position: PropTypes.object,
}

export default TreeFolder

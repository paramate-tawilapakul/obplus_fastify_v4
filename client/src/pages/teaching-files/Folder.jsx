import { useEffect } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import $ from 'jquery'
import 'jstree'
import { useConfirm } from 'material-ui-confirm'

import { API, dialogStyle, reqHeader } from '../../config'

function Folder({ teaching, setSelectedFolder, theme }) {
  const confirm = useConfirm()
  const parentsId = teaching.filter(d => d.parent === '#')
  // console.log('parentsId', parentsId)

  useEffect(() => {
    import(
      `../../components/page-tools/jstree/themes/default${
        theme === 'dark' ? '-dark' : ''
      }/style.min.css`
    )

    // window.location.reload()
    treeFolder()

    return () => {}
    // eslint-disable-next-line
  }, [theme])

  function treeFolder() {
    // console.log('treeFolder')
    $('#jstree_folder')
      .on('create_node.jstree', function (e, data) {
        // console.log('create', data.node)
        $(this).jstree(true).set_id(data.node, 'newnode')
      })
      .on('select_node.jstree', function (e, data) {
        // console.log('select', data.node.id)
        const pid = parentsId.map(d => d.id)
        if (!pid.includes(data.node.id)) setSelectedFolder(data.node.id)
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
          themes: { name: theme === 'dark' ? 'default-dark' : 'default' },
          check_callback: true,
          data: teaching,
          ccp: false,
        },
        plugins: ['contextmenu'],
        contextmenu: {
          items: function ($node) {
            const tree = $('#jstree_folder').jstree(true)
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
  return (
    <>
      {/* <link
        rel='stylesheet'
        type='text/css'
        href={`/css/jstree/themes/default${
          theme === 'dark' ? '-dark' : ''
        }/style.min.css`}
      /> */}
      <div
        id='jstree_folder'
        style={{ minHeight: 400, paddingTop: 10, paddingBottom: 10 }}
      ></div>
    </>
  )
}

Folder.propTypes = {
  teaching: PropTypes.array.isRequired,
  setSelectedFolder: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired,
}

export default Folder

import { useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import Pagination from './Pagination'
import Fade from '@mui/material/Fade'
import SkeletonLoading from './SkeletonLoading'
import { MODE, ROW_HEIGHT, STORAGE_NAME } from '../../config'
import { checkboxStyle } from './form-style'

function DataGridTemplate({
  dataList,
  columns,
  rowsPerPage,
  handleCellClick,
  systemProperties,
  pageNum,
  setPageNum,
  setRowsPerPage,
  handleChangePage,
  handleChangeRows,
  setRowSelected = null,
  isSelectAble = true,
  tab,
  module,
}) {
  let reduceHeight = tab === 'teachingFiles' ? 225 : 268

  const [elHeight, setElHeight] = useState(window.innerHeight - reduceHeight)

  window.addEventListener('resize', setElementHeight)
  function setElementHeight(e) {
    setElHeight(e.currentTarget.innerHeight - reduceHeight)
  }

  const hiddenColumns = {
    // instituionalDepartmentName:
    //   systemProperties?.showDepartmentService === 'enable',
    // institutionName: systemProperties?.showLocationService === 'enable',
    // techNote: systemProperties?.showTechnoteService === 'enable',
    // studyPriority: systemProperties?.showPriorityService === 'enable',
    // orderNotes: systemProperties?.showPriorityService === 'enable',
    // orderFrom: systemProperties?.showDepartmentService === 'enable',
    // orderLocation: systemProperties?.showLocationService === 'enable',
    // orderTech: systemProperties?.showTechnoteService === 'enable',
    // patientAge: systemProperties?.showAgeService === 'enable',
    // suspectedPathology: systemProperties?.deeptek === 'YES',
    // breastDensity: systemProperties?.lunit === 'YES',
    // mmgAIScore: systemProperties?.lunit === 'YES',
    // reportBirads: systemProperties?.hspId === 'KB',
    // reportStatus: systemProperties?.hspId !== 'KB',
  }
  const columnModel = JSON.parse(
    window.localStorage.getItem(STORAGE_NAME.columnModel)
  )

  // if (dataList?.data && !columnModel[module].hasOwnProperty(tab)) {
  if (dataList?.data && !Object.hasOwn(columnModel[module], tab)) {
    columnModel[module][tab] = hiddenColumns

    window.localStorage.setItem(
      STORAGE_NAME.columnModel,
      JSON.stringify(columnModel)
    )
  }

  const [columnVisibilityModel, setColumnVisibilityModel] = useState(
    columnModel[module][tab]
  )

  const rowStyle = {
    cursor: 'pointer',
    border: 0,
    margin: 0,
    padding: 0,
  }

  let newColumns = columns

  return (
    <div
      style={{
        marginTop: 2,
        width: '100%',
      }}
    >
      {/* {!dataList.data && <SkeletonLoading />} */}
      <SkeletonLoading loading={dataList.data == null} />
      <div
        style={{
          minHeight: elHeight,
        }}
      >
        {dataList?.data && (
          <Fade in={dataList?.data ? true : false} timeout={400}>
            <div>
              <DataGrid
                initialState={{
                  columns: {
                    columnVisibilityModel: columnModel[module][tab],
                  },
                }}
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={newModel => {
                  columnModel[module][tab] = newModel
                  window.localStorage.setItem(
                    STORAGE_NAME.columnModel,
                    JSON.stringify(columnModel)
                  )

                  setColumnVisibilityModel(newModel)
                }}
                rows={dataList?.data || []}
                columns={newColumns}
                onSelectionModelChange={ids => {
                  const selectedIDs = new Set(ids)
                  const selectedRowData = dataList?.data?.filter(row => {
                    return selectedIDs.has(row.id)
                  })
                  if (setRowSelected) setRowSelected(selectedRowData)
                }}
                pageSize={rowsPerPage}
                checkboxSelection={isSelectAble}
                disableSelectionOnClick
                rowHeight={ROW_HEIGHT}
                headerHeight={ROW_HEIGHT}
                hideFooterPagination
                hideFooterSelectedRowCount
                hideFooter
                onCellClick={handleCellClick}
                sx={{
                  minHeight: elHeight,
                  borderLeft: '0px',
                  borderRight: '0px',
                  borderBottom: '0px',
                  color: theme => MODE[theme.palette.mode].dataGrid.font,
                  backgroundColor: theme =>
                    MODE[theme.palette.mode].tab.background,
                  '.MuiDataGrid-row': {
                    ...rowStyle,
                    fontSize: 16,
                    borderBottom: theme =>
                      `1px solid ${
                        MODE[theme.palette.mode].dataGrid.rowBorder
                      }`,
                    color: theme => MODE[theme.palette.mode].dataGrid.font,
                  },
                  '.MuiDataGrid-row:hover': {
                    backgroundColor: theme =>
                      MODE[theme.palette.mode].dataGrid.rowHover,
                  },

                  '.MuiDataGrid-columnHeaders ': {
                    borderBottom: theme =>
                      `1px solid ${
                        MODE[theme.palette.mode].dataGrid.headerBorder
                      }`,
                    backgroundColor: theme =>
                      MODE[theme.palette.mode].dataGrid.headerBackground,
                    color: theme => MODE[theme.palette.mode].dataGrid.font,
                  },
                  '.MuiDataGrid-footerContainer ': {
                    borderTop: 'none',
                    height: 5,
                    padding: 0,
                    margin: 0,
                    display: 'none',
                  },
                  ...checkboxStyle,
                }}
              />
            </div>
          </Fade>
        )}
      </div>
      <Pagination
        total={dataList.total}
        pageNum={pageNum}
        setPageNum={setPageNum}
        rowsPerPage={rowsPerPage || systemProperties.defaultList}
        setRowsPerPage={setRowsPerPage}
        handleChangePage={handleChangePage}
        handleChangeRows={handleChangeRows}
      />
    </div>
  )
}

export default DataGridTemplate

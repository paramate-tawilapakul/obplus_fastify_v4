import GroupsIcon from '@mui/icons-material/Groups'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff'
// import LocationCityIcon from '@mui/icons-material/LocationCity'
import StorageIcon from '@mui/icons-material/Storage'
import RateReviewIcon from '@mui/icons-material/RateReview'

import { APP_CONFIG, APP_ROUTES } from '../../config'

export const menus = [
  {
    header: 'User',
    id: 'user',
    title: 'Manage user, group and permission.',
    icon: <GroupsIcon fontSize='large' />,
    link: `/${APP_CONFIG.APP_NAME}/${APP_ROUTES.systemConfiguration}/${APP_ROUTES.allUser}`,
    show: true,
  },
  {
    header: 'Order',
    id: 'order',
    title: 'Manage protocol.',
    icon: <AssignmentIndIcon fontSize='large' />,
    link: `/${APP_CONFIG.APP_NAME}/${APP_ROUTES.systemConfiguration}/${APP_ROUTES.order}`,
    show: true,
  },
  // {
  //   header: 'Location',
  //   id: 'location',
  //   title: 'Manage location.',
  //   icon: <LocationCityIcon fontSize='large' />,
  //   link: `/${APP_CONFIG.APP_NAME}/${APP_ROUTES.systemConfiguration}/${APP_ROUTES.location}`,
  //   show: true,
  // },
  {
    header: 'Default Date',
    id: 'timeGuarantee',
    title: 'Manage default date.',
    icon: <HistoryToggleOffIcon fontSize='large' />,
    link: `/${APP_CONFIG.APP_NAME}/${APP_ROUTES.systemConfiguration}/${APP_ROUTES.timeGuarantee}`,
    show: true,
  },
  {
    header: 'System Properties',
    id: 'systemProperties',
    title: 'Manage system properties of OBPlus system.',
    icon: <StorageIcon fontSize='large' />,
    link: `/${APP_CONFIG.APP_NAME}/${APP_ROUTES.systemConfiguration}/${APP_ROUTES.systemProperties}`,
    show: true,
  },
  {
    header: 'Feedback',
    id: 'feedback',
    title: 'Manage feedback from users',
    icon: <RateReviewIcon fontSize='large' />,
    link: `/${APP_CONFIG.APP_NAME}/${APP_ROUTES.systemConfiguration}/${APP_ROUTES.feedback}`,
    show: true,
  },
]

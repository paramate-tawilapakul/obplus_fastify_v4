// const schema = {
//   querystring: {
//     type: 'object',
//     properties: {
//       name: { type: 'string' },
//       excitement: { type: 'integer' },
//     },
//   },
//   params: {
//     type: 'object',
//     properties: {
//       id: { type: 'string' },
//     },
//   },
//   response: {
//     200: {
//       type: 'object',
//       properties: {
//         message: { type: 'integer' },
//       },
//     },
//   },
// }
const userDataSchema = {
  allowOrderConfig: { type: 'string' },
  allowPatientManagement: { type: 'string' },
  allowRegistration: { type: 'string' },
  allowReportManagement: { type: 'string' },
  allowReportSearch: { type: 'string' },
  allowReportTemplate: { type: 'string' },
  allowSystemConfig: { type: 'string' },
  allowSystemPropertiesConfig: { type: 'string' },
  allowTeachingFiles: { type: 'string' },
  allowTimeguaranteeConfig: { type: 'string' },
  allowUserConfig: { type: 'string' },
  allowUserGroupConfig: { type: 'string' },
  allowWorklist: { type: 'string' },
  allowWorklistAll: { type: 'string' },
  allowWorklistReported: { type: 'string' },
  allowWorklistUnverified: { type: 'string' },
  code: { type: 'string' },
  desc: { type: 'string' },
  descEng: { type: 'string' },
  id: { type: 'integer' },
  radName: { type: 'string' },
  token: { type: 'string' },
  type: { type: 'string' },
  typeId: { type: 'integer' },
}

exports.license = {
  description: 'Check License',
  tags: ['user'],
  response: {
    200: {
      description: 'Successful response',
      type: 'object',
      properties: {
        decoded: {
          type: 'object',
          properties: {
            exp: { type: 'integer' },
          },
        },
        message: { type: 'string' },
        status: { type: 'integer' },
      },
    },
  },
}

exports.userData = {
  description: 'User data by JWT token header',
  tags: ['user'],
  security: [{ bearer: [] }],
  response: {
    200: {
      description: 'Successful response',
      type: 'object',
      properties: userDataSchema,
    },
  },
}

exports.userSignIn = {
  description: 'Sign In',
  tags: ['user'],
  // summary: 'qwerty',
  // security: [{ apiKey: [] }],
  body: {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: { type: 'string' },
      password: { type: 'string' },
    },
  },
  response: {
    200: {
      description: 'Successful response',
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: userDataSchema,
        },
      },
    },
  },
}

exports.userSignOut = {
  description: 'Sign Out, remove JWT token',
  tags: ['user'],
  response: {
    200: {
      description: 'Successful response',
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  },
}

exports.reportTemplate = {
  description: 'Report Template by JWT token header',
  tags: ['user'],
  // summary: 'qwerty',
  security: [{ bearer: [] }],
  querystring: {
    type: 'object',
    properties: {
      showPublic: { type: 'string' },
      sex: { type: 'string' },
    },
  },
  response: {
    200: {
      description: 'Successful response',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          properties: {
            id: { type: 'integer' },
            label: { type: 'string' },
            name: { type: 'string' },
            desc: { type: 'string' },
            content: { type: 'string' },
            owner: { type: 'string' },
            type: { type: 'string' },
          },
        },
      },
    },
  },
}

import * as api from './api/index'
import * as customApi from './customApi/index'

export const merchantApi = {
  ...api,
  ...customApi,
};

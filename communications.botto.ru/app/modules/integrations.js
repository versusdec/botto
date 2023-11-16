define(['microcore', 'scripts', "notify"],
  function (mc, scripts, notify) {
      return async (id) => {
          let data = {
              id: +id,
              integration: {
                  name: '',
                  project_id: mc.storage.get('project_id'),
                  type: 'api',
                  settings: {
                      method: 'POST',
                      type: 'formdata',
                  }
              },
              method_options: [
                  {option: 'POST', value: 'POST'},
                  {option: 'GET', value: 'GET'},
              ],
              type_options: [
                  {option: 'formdata', value: 'formdata'},
                  {option: 'json', value: 'json'},
                  {option: 'raw', value: 'raw'},
              ],
          }
          if (+id) {
              data.integration = await mc.api.call('integrations.get', {
                  id: +id,
                  project_id: mc.storage.get('project_id')
              })
              if (data.integration.type !== 'api') {
                  data.fields = {
                      method: 'projects.fields.list',
                      selected: [],
                      params: {
                          project_id: mc.storage.get('project_id'),
                          status: 'active',
                          limit: 10,
                          offset: 0
                      }
                  }
              }
          }
          mc.storage.set('integration', data.integration)
          return data
      }
  });
define(['microcore',
      'mst!settings/list/item',
      'mst!settings/edit/fields',
      'mst!settings/edit/integrations/edit',
      'mst!settings/edit/integrations/create',
      'app/modules/integrations',
      "confirm", "notify",
      "popup"],
  function (mc, item_view, fields_popup, integrations_edit, integrations_create, prepareIntegration, confirm, notify, popup) {
      let filter = {
          project_id: mc.storage.get('project_id'),
          status: 'active'
      }, page, method, type;

      mc.events.on('settings.item.archive', ({btn, id, type}) => {
          confirm(mc.i18n(`settings.${type}.archive`), '', () => {
              let method = type === 'fields' ? 'projects.fields.update' : 'integrations.update'
              mc.api.call(method, {
                  id: +id,
                  project_id: filter.project_id,
                  status: 'archived',
              })
                .then(res => {
                    if (res) {
                        notify(mc.i18n(`settings.${type}.archived`));
                        // $(btn).closest('tr').remove()
                        mc.router.go(location.pathname)

                    } else
                        notify(mc.i18n('system.error'))
                })
          })
      });

      mc.events.on('settings.item.unzip', ({btn, id, type}) => {
          confirm(mc.i18n(`settings.${type}.unzip`), '', () => {
              let method = type === 'fields' ? 'projects.fields.update' : 'integrations.update'
              mc.api.call(method, {
                  id: +id,
                  project_id: filter.project_id,
                  status: 'active',
              })
                .then(res => {
                    if (res) {
                        notify(mc.i18n(`settings.${type}.unzipped`));
                        mc.router.go(location.pathname)
                    } else
                        notify(mc.i18n('system.error'))
                })
          })
      });

      mc.events.on('settings.fields.edit', async ({type, id, copy}) => {
          let data = {}
          switch (type) {
              case 'fields':
                  data = {
                      id: id,
                      field: {
                          type: 'string',
                      },
                      select_options: [
                          {option: mc.i18n('settings.fields.options.string'), value: 'string'},
                          {option: mc.i18n('settings.fields.options.int'), value: 'int'},
                          {option: mc.i18n('settings.fields.options.select'), value: 'select'},
                          {option: mc.i18n('settings.fields.options.phone'), value: 'phone'},
                          {option: 'Email', value: 'email'},
                          {option: mc.i18n('settings.fields.options.date'), value: 'date'},
                          {option: mc.i18n('settings.fields.options.time'), value: 'time'},
                          {option: mc.i18n('settings.fields.options.datetime'), value: 'datetime'},
                          {option: mc.i18n('settings.fields.options.checkbox'), value: 'checkbox'}],

                  }
                  if (+id) {
                      data.field = await mc.api.call('projects.fields.get', {
                          id: +id,
                          project_id: mc.storage.get('project_id')
                      })
                  }
                  popup(fields_popup, data)
                  break;
              case 'integrations':
                  data = await prepareIntegration(id);
                  data.copy = copy;
                  let content = +id && data.integration.type !== 'api' ? integrations_edit : integrations_create;
                  popup(content, data)
                  break;
              default:
                  break;
          }

      })

      mc.events.on('settings.list', async (scope) => {
          let response = await mc.api.call(method, filter);
          if (response && response.items && response.items.length) {
              if (type !== 'tags') {
                  $(scope).find('tbody').html('');
                  for (let i in response.items) {
                      let item = response.items[i];
                      item.is_field = type === 'fields';
                      $(scope).find('tbody').append(await item_view(item))
                  }

                  mc.events.push('system:pagination.update', {
                      id: 'settings',
                      total: response.total,
                      limit: response.limit,
                      current: filter.offset / filter.limit + 1
                  })
              } else {

              }
          } else {
              $(scope).find('.loader').html(mc.i18n('table.empty'))
          }
      })

      return async ($scope, $params) => {
          let hash_params = mc.router.hash();
          page = parseInt(hash_params.page) || 1;
          filter.limit = parseInt(hash_params.limit) || 10;
          filter.offset = (page - 1) * filter.limit;
          filter.status = 'active';

          if ($params.tab === 'archived') {
              filter.status = 'archived'
          }
          type = $params.type;
          method = `projects.${type}.list`;
          if (type === 'integrations') {
              method = 'integrations.list'
          }

          mc.events.push('settings.list', $scope)
      }
  });
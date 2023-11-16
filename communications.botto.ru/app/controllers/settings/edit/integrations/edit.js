define([
      'microcore',
      'mst!settings/edit/integrations/params',
      'mst!settings/edit/fields',
      'mst!settings/edit/integrations/edit',
      'mst!settings/edit/integrations/create',
      "scripts",
      "notify",
      "popup"
  ],
  function (mc, row, fields_view, integrations_edit, integrations_create, scripts, notify, popup) {


      let scope, integration = {}, settings = {};

      mc.events.on('sys:page.init:settings/edit/integrations/edit', () => {

      });

      mc.events.on("settings.integrations.tab", ({tab, btn}) => {
          $('.integration_popup .tabs li').removeClass('active');
          $(btn).closest('li').addClass('active');
          $('.integration_popup .tab').addClass('hide');
          $(`#${tab}`).removeClass('hide')
      });

      mc.events.on('integrations.edit.fields.create', async () => {
          const data = {
              id: 'new',
              external: true,
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
          popup(fields_view, data)
          mc.events.off('fields.created')
          mc.events.on('fields.created', ({id}) => {
              $('#fields .select').forEach(select => {
                  select.updateSelect([])
              })
          })
      })

      mc.events.on('integration.edit.settings.change', input => {
          if (input.value)
              settings[input.name] = +input.value || input.value;
          else
              delete settings[input.name]
          console.log(settings);
      })

      return async ($scope, $params) => {
          document.title = `${mc.i18n('settings.title')} | Botto Platform`;
          settings = {}
          scope = $scope;
          integration = mc.storage.get('integration');
          mc.events.push('sys:page.init:settings/edit/integrations/edit')
      }
  })
;
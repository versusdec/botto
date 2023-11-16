define([
      'microcore',
      'mst!settings/edit/integrations/params',
      'mst!settings/edit/integrations/edit',
      'mst!settings/edit/integrations/create',
      "app/modules/integrations",
      "scripts",
      "notify",
      "popup",
  ],
  function (mc, row, integrations_edit, integrations_create, prepareIntegration, scripts, notify, popup) {

      let scope, settings, integration = {};

      async function addRow(type) {
          $(`#${type}`).removeClass('hide')
          $(`#${type} tbody`).append(await row({}));
      }

      function settingsMemo() {
          let memo = {}

          return (key, value) => {
              if (value) {
                  memo[key] = value
              }
              return memo[key]
          }
      }

      const getType = settingsMemo()

      function switchType(val) {
          if (val === 'raw') {
              $('.params_tab').addClass('hide')
              $('.body_tab').removeClass('hide')
          } else {
              $('.params_tab').removeClass('hide')
              $('.body_tab').addClass('hide')
          }
      }

      mc.events.on("settings.integrations.tab", ({tab, btn}) => {
          $('.integration_popup .tabs li').removeClass('active');
          $(btn).closest('li').addClass('active');
          $('.integration_popup .tab').addClass('hide');
          $(`#${tab}`).removeClass('hide')
      });

      mc.events.on("settings.integrations.name.change", (value) => {
          integration.name = value
      });

      mc.events.on("integration.api.settings.change", (input) => {
          if (input.type === 'checkbox') {
              settings.api[input.name] = input.checked;
              if (input.checked) {
                  $('#auth').removeClass('hide')
              } else {
                  $('#auth').addClass('hide')
                  delete integration.settings.login
                  delete integration.settings.password
                  $('#auth input').val('')
              }
          } else
              settings.api[input.name] = input.value;

          if (input.name === 'method' && input.value === 'POST') {
              $('#method').removeClass('hide');
              settings.api.type = getType('type');
              switchType(settings.api.type)
          } else if (input.name === 'method' && input.value !== 'POST') {
              getType('type', settings.api.type)
              delete settings.api.type
              $('#method').addClass('hide');
              $('.params_tab').removeClass('hide')
              $('.body_tab').addClass('hide')
          }
          if (input.name === 'type') {
              getType('type', input.value)
              switchType(input.value)
          }

          console.log(settings.api);
      });

      mc.events.on("integration.amo.settings.change", (input) => {
          settings.amo[input.name] = input.value;
      });

      mc.events.on("integration.bitrix.settings.change", (input) => {
          settings.bitrix[input.name] = input.value;
      });

      mc.events.on("settings.integrations.type.change", ({btn, type}) => {
          integration.type = type;
          $(`#apps button`).removeAttr('disabled');
          btn.setAttribute('disabled', '');
          $('.type_block').addClass('hide');
          if (type !== 'api')
              $(`#${type}`).removeClass('hide');
          /*
          switch (type) {
              case 'api':
                  $(scope).find('ul.tabs').removeClass('hide')
                  break;
              case 'amo':
                  $(scope).find('ul.tabs').addClass('hide')
                  break;
              case 'bitrix':
                  $(scope).find('ul.tabs').addClass('hide')
                  break;
              default:
                  break;
          }*/
      });

      mc.events.on("settings.integrations.settings.body.change", (value) => {
          integration.settings.body = value
      });

      mc.events.on("settings.integrations.settings.params.add", async (type) => {
          await addRow(type);
      });

      mc.events.on("settings.integrations.settings.params.remove", async (button) => {
          $(button).closest('tr').remove();
      });

      mc.events.on("settings.integrations.save", async ({id, btn, copy}) => {
          if (integration.name === '') {
              return scripts.fieldError($('.integration_popup').find('input[name=name][required]'))
          }
          integration.settings = settings[integration.type]
          if (integration.type === 'api') {
              if ($('#headers tbody tr').length) {
                  integration.settings.headers = []
                  $('#headers tbody tr').forEach(e => {
                      integration.settings.headers.push({
                          name: $(e).find('[name=name]').val(),
                          value: $(e).find('[name=value]').val(),
                      })
                  })
              } else {
                  delete integration.settings.headers
              }
              if ($('#params tbody tr').length) {
                  integration.settings.params = []
                  $('#params tbody tr').forEach(e => {
                      integration.settings.params.push({
                          name: $(e).find('[name=name]').val(),
                          value: $(e).find('[name=value]').val(),
                      })
                  })
              } else {
                  delete integration.settings.params
              }
              if (integration.settings.type === 'raw') {
                  delete integration.settings.params
              } else {
                  delete integration.settings.body
              }
              if (integration.settings.url === '') {
                  delete integration.settings.url
              }
          } else {
              if ($(`#${integration.type} [required]`).val() === '') {
                  return scripts.fieldError($(`#${integration.type} [required]`))
              }
          }
          let method = integration.id ? 'update' : 'create';
          if (copy) {
              method = 'create';
              delete integration.id
          }

          mc.api.call('integrations.' + method, integration).then(async res => {
              if (res) {
                  if (location.pathname.match(/\/\d+\/settings\//i)) {
                      if (+integration.id || copy) {
                          mc.router.go(`/${mc.storage.get('project_id')}/settings/active/integrations/`)
                      } else {
                          mc.router.go(`/${mc.storage.get('project_id')}/settings/edit/integrations/${res}/`)
                      }
                  } else {
                      $(btn).closest('.popup-wrapper').remove();
                      mc.events.push('integration.created', {id: res, type: 'webhook'})

                      if (res !== true) {
                          integration.id = res;
                          let data = await prepareIntegration(res)
                          let content = integration.type !== 'api' ? integrations_edit : integrations_create;
                          popup(content, data)
                      }
                  }
                  notify(mc.i18n(`settings.integrations.${integration.id ? 'updated' : 'created'}`))
              } else {
                  btn.removeAttribute('disabled')
                  notify(mc.i18n(`system.error`))
              }
          })

      });

      return async ($scope, $params) => {
          document.title = `${mc.i18n('settings.title')} | Botto Platform`;
          settings = {
              amo: {},
              bitrix: {},
              api: {
                  method: 'POST',
                  type: 'formdata'
              }
          }
          scope = $scope;
          integration = mc.storage.get('integration');
          if (+integration.id) {
              settings.api = integration.settings
          }
      }
  })
;
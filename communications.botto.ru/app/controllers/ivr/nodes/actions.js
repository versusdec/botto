define([
      'microcore',
      'notify', 'popup', 'confirm',
      'mst!ivr/nodes/actions/item',
      'mst!ivr/nodes/actions/playback',
      'mst!ivr/nodes/actions/phone',
      'mst!ivr/nodes/actions/tag',
      'mst!bases/edit/index',
      'mst!materials/edit/audio/index',
      'mst!materials/edit/text/index',
      'mst!settings/edit/integrations/create',
      'app/modules/integrations',
      'masked',
      'scripts'
  ],
  function (mc, notify, popup, confirm,
            table_item,
            playback_item,
            phone_item,
            tag_item,
            bases_popup,
            playback_popup,
            message_popup,
            webhook_popup,
            prepareIntegration,
            masked,
            scripts
  ) {

      mc.events.on('sys:page.init:controllers/ivr/nodes/actions',()=>{
         masked()
      })

      mc.events.on('ivr.settings.actions.item.created', ({id, type}) => {
          let method, select, table,
            params = {
                project_id: mc.storage.get('project_id'),
                id: id
            };
          switch (type) {
              case 'blacklists':
                  method = `communications.blacklists.get`;
                  select = '.blacklists_select';
                  break;
              case 'text':
              case 'audio':
                  method = `communications.materials.get`;
                  select = type === 'text' ? '.message_select' : '.playback_select';
                  table = type === 'text' ? '#message' : '#playback';
                  break;
              case 'webhook':
                  method = `integrations.get`;
                  select = '.webhook_select';
                  table = '.webhook_select'
                  break;
              default:
                  break;
          }
          mc.api.call(method, params).then(async (res) => {
              if (res) {
                  let tbody = $(`#node_actions ${table} tbody`);
                  switch (type) {
                      case 'blacklists':
                          $(select)[0].updateSelect([res.id], res.name, res.id)
                          break;
                      case 'text':
                          tbody.append(await table_item({id: res.id, name: res.name, type: type}));
                          $(table)[0].classList.remove('hide');
                          $(select)[0].updateSelect($(`${table} tr[data-id]`).map(item => +item.dataset.id), mc.i18n('select.default'))
                          break;
                      case 'audio':
                          res.file = `${require.config.api}${res.data.data.path}`;
                          res.action_type = type;
                          tbody.append(await playback_item(res));
                          $(table)[0].classList.remove('hide');
                          $(select)[0].updateSelect($(`${table} tr[data-id]`).map(item => +item.dataset.id), mc.i18n('select.default'))

                          break;
                      case 'webhook':
                          $(select)[0].updateSelect([res.id], res.name, res.id)

                          //$(`${table} .options`).find(`[data-value="${res.id}"]`)[0].click();
                          // tbody.html(await table_item({id: res.id, name: res.name, type: type}));
                          break;
                      default:
                          break;
                  }
              } else {
                  notify(mc.i18n('system.error'))
              }
          });
      })

      mc.events.on('ivr.node.settings.actions.remove', ({btn, type, id}) => {
          if (type !== 'playback') {
              $(btn).closest('tr').remove();
          } else {
              let r = $(btn).closest('tr');
              let p = $(r)[0].nextElementSibling
              r.remove();
              $(p).remove()
          }
          if (type !== 'manager') {
              let selected = $(`#${type} tbody tr[data-id]`).map(item => +item.dataset.id)
              $(`.${type}_select`)[0].updateSelect(selected)
          }
      })

      mc.events.on('ivr.node.settings.actions.manager.add', async ({btn, type}) => {
          let item;
          item = $(`.manager-settings input[name=phone]`);
          if (item.val() === '' || /[a-zA-Z]/.test(item.val())) {
              return scripts.fieldError($(item), false, mc.i18n('system.errors.manager'), '.manager-settings .columns', 'after')
          } else {
              $(`#${type}`)[0].classList.remove('hide')
              $(`#${type} tbody`).append(await phone_item({phone: item.val().replace(/[^0-9]/g, ''), type: type}))
              item.val('')
              scripts.loading(false);
              $(`#${$(item)[0].error}`).remove()
          }
      })

      mc.events.on('ivr.create.popup', async (type) => {
          let data = {
              popup: true,
              id: 'new'
          };
          let view;

          switch (type) {
              case 'blacklists':
                  mc.storage.set('base', {
                      name: '',
                      project_id: mc.storage.get('project_id')
                  })
                  data.type = 'blacklists'
                  view = bases_popup;
                  break;
              case 'playback':
                  data.type = 'audio';
                  view = playback_popup;
                  break;
              case 'message':
                  data.type = 'text';
                  view = message_popup;
                  break;
              case 'webhook':
                  data = await prepareIntegration('new');
                  view = webhook_popup
                  break;
              default:
                  break;
          }

          popup(view, data)
      })

      mc.events.on('ivr.node.settings.tags.add', async (btn) => {
          let autocomplete = $(btn).closest('.tag-settings').find('.autocomplete input');
          if (!autocomplete.val().length) {
              return mc.fieldError(autocomplete)
          }
          if (autocomplete[0].dataset.value) {
              $('#tags').append(await tag_item({id: autocomplete[0].dataset.value, tag: autocomplete.val()}))
              autocomplete.val('')
          } else {
              confirm(mc.i18n('ivr.nodes.actions.types.create_tag'), '', () => {
                  mc.api.call('projects.tags.create', {
                      project_id: mc.storage.get('project_id'),
                      tag: autocomplete.val()
                  })
                    .then(async res => {
                        if (res) {
                            $('#tags').append(await tag_item({id: res, tag: autocomplete.val()}))
                            autocomplete.val('')
                        } else {
                            notify(mc.i18n('system.error'))
                        }
                    })
              })
          }
      })


      return ($scope, $params) => {
          mc.events.off(['bases.created', 'materials.created', 'integration.created'])

          mc.events.on(['bases.created', 'materials.created', 'integration.created'], ({type, id, name}) => {
              mc.events.push('ivr.settings.actions.item.created', {type: type, id: id, name: name})
          })
      }
  });
define([
      'microcore', 'app/modules/ivr/prepare', 'app/modules/ivr/actions', 'mst!ivr/nodes/node', 'mst!ivr/nodes/branch', 'mst!ivr/nodes/setting', 'mst!ivr/nodes/filters/edit', 'mst!ivr/nodes/actions/edit',
      'notify', 'popup', 'confirm', 'scripts'],
  function (mc, ivr_prepare, actions_prepare, node_view, branch_view, setting_view, filter_edit_view, action_edit_view, notify, popup, confirm, scripts) {
      let node_type, is_copy;

      function new_node(pid) {
          let ivr = mc.storage.get('ivr')
          let id = ++$('ul.nodes')[0].dataset.last_id

          ivr.nodes[id] = {
              id: id,
              pid: pid,
              name: '',
              filters: {},
              actions: {}
          }
          // $('ul.nodes').attr('data-last_id', +id + 1)

          mc.storage.set('ivr', ivr)
          return ivr.nodes[id]
      }

      mc.events.on('ivr.name.change', val => {
          let ivr = mc.storage.get('ivr')
          ivr.name = val
          mc.storage.set('ivr', ivr)
      })

      mc.events.on('ivr.save', async (btn) => {
          let ivr = ivr_prepare.toSave(mc.storage.get('ivr'))
          if (!ivr.name || ivr.name === '') {
              return scripts.fieldError('#ivr_name', false, mc.i18n('system.errors.name'))
          }
          btn.setAttribute('disabled', true)

          let method = ivr.id !== 'new' ? 'update' : 'create';
          if (is_copy) {
              delete ivr.id
              method = 'create'
          }
          await mc.api.call('communications.ivr.' + method, ivr).then(res => {
              if (res) {
                  notify(mc.i18n(`ivr.${method === 'create' ? 'created' : 'updated'}`))
                  mc.events.push('ivr.created', res)
                  if (location.pathname.match(/\/\d+\/ivr\//i)) {
                      mc.router.go(`/${mc.storage.get('project_id')}/ivr/`)
                  } else {
                      $(btn).closest('.popup-wrapper').remove();
                  }
              } else {
                  btn.removeAttribute('disabled')
                  notify(mc.i18n('system.error'))
              }
          })
      })

      mc.events.on('ivr.nodes.zoom.in', () => {
          let nodes = $('#ivr_scheme .nodes')
          let scale = (parseFloat(getComputedStyle(nodes[0]).zoom) + 0.1)
          nodes.attr('style', 'zoom: ' + (scale <= 1.5 ? scale : 1.5))
      })

      mc.events.on('ivr.nodes.zoom.out', () => {
          let nodes = $('#ivr_scheme .nodes')
          let scale = (parseFloat(getComputedStyle(nodes[0]).zoom) - 0.1)
          nodes.attr('style', 'zoom: ' + (scale >= 0.3 ? scale : 0.3))
      })

      mc.events.on('ivr.node.settings.open', async (data) => {
          let node_edit = $('#node_edit');
          $('#ivr_scheme .overlay').removeClass('hide')
          node_edit.removeClass('hide')
          // $(node_edit)[0].scrollIntoView({behavior: 'smooth', block: 'start'})

          let item = $('#ivr_node_' + data.type + '_' + data.id)

          if (item) {
              item.addClass('selected')
          }

          switch (data.type) {
              case 'filter':
                  data.params.types = [
                      {option: mc.i18n("ivr.nodes.filters.types.dtmf"), value: "dtmf"},
                      {option: mc.i18n("ivr.nodes.filters.types.recognize"), value: "recognize"}
                  ]
                  node_edit.html(await filter_edit_view(data.params))
                  mc.loading(false)
                  break;
              case 'action':
                  mc.loading(true)
                  data = await actions_prepare.prepareActions(data);
                  node_edit.html(await action_edit_view(data.params))
                  mc.loading(false)
                  break;
          }
      })

      mc.events.on('ivr.node.settings.close', () => {
          $('#ivr_scheme .overlay').addClass('hide')
          $('#node_edit').addClass('hide')
          $('.node .selected').removeClass('selected')
      })

      mc.events.on('ivr.node.update', (data) => {
          let ivr = mc.storage.get('ivr')
          for (let field in data) {
              ivr.nodes[data.id][field] = data[field]
          }
          mc.storage.set('ivr', ivr)
      })

      mc.events.on('ivr.node.remove', (id) => {
          function removeNodes(id) {
              let child_id;
              for (let i in ivr.nodes) {
                  if (ivr.nodes[i].pid === id) {
                      child_id = ivr.nodes[i].id;
                      delete ivr.nodes[i]
                      removeNodes(child_id)
                  }
              }
          }

          let node = $('#ivr_node_' + id).closest('li')
          let holder = node.closest('ul')
          node.remove()
          let ivr = mc.storage.get('ivr')
          delete ivr.nodes[id]
          removeNodes(id)
          mc.storage.set('ivr', ivr)

          if (!holder.hasClass('nodes') && holder.find('li').length == 1) {
              holder.remove()
          }
      })

      mc.events.on('ivr.node.add', async (node) => {
          let nodes = $(node).closest('ul').find('li .node')

          let pid_field = nodes.length ? $(nodes[0]).find('input[name=pid]') : ''
          let pid = pid_field.length ? parseInt(pid_field.val()) : 0

          $(node).closest('li').before($(await node_view(new_node(pid))))
      })

      mc.events.on('ivr.node.add.branch', async (pid) => {
          $('#ivr_node_' + pid).closest('li').append(await branch_view(new_node(pid)))
      })

      mc.events.on('ivr.node.filters.add', async (id) => {
          mc.events.push('ivr.node.settings.open', {
              type: 'filter',
              params: {
                  node_id: id,
                  id: (new Date()).getTime(),
                  type: "dtmf"
              }
          })
      })

      mc.events.on('ivr.node.actions.add', async (id) => {
          mc.events.push('ivr.node.settings.open', {
              type: 'action', params: {
                  node_id: id,
                  id: (new Date()).getTime(),
                  type: "lead"
              }
          })
      })

      mc.events.on('ivr.node.settings.type.change', async (data) => {
          for (let i in data.options) {
              $('#node_edit .' + data.options[i].value + '-settings').addClass('hide')
          }
          $('#node_edit .' + data.value + '-settings').removeClass('hide')
      })

      mc.events.on('ivr.node.settings.remove', async (data) => {
          let item = $('#ivr_node_' + data.type + '_' + data.id)
          let node_id = item.closest('.node')[0].dataset.id
          let ivr = mc.storage.get('ivr')
          delete ivr.nodes[node_id][data.type + 's'][data.id]
          mc.storage.set('ivr', ivr)
          item.remove()
      })

      mc.events.on('ivr.node.settings.edit', async (data) => {
          let ivr = mc.storage.get('ivr')
          let node_id = $('#ivr_node_' + data.type + '_' + data.id).closest('.node')[0].dataset.id
          let setting = JSON.parse(JSON.stringify(ivr.nodes[node_id][data.type + 's'][data.id]))
          setting.node_id = node_id
          setting.id = data.id
          mc.events.push('ivr.node.settings.open', {type: data.type, params: setting})
      })

      mc.events.on('ivr.node.settings.save', async (data) => {
          let ivr = mc.storage.get('ivr')
          let settings = ivr.nodes[data.node_id][data.type + 's']

          if (!settings[data.id]) {
              settings[data.id] = {}
          }
          let setting = settings[data.id]

          let type = $('#node_edit').find('.select .option')[0].dataset
          setting.type = type.value
          setting.settings = {};
          switch (setting.type) {
              case 'blacklist':
                  if ($(`.blacklists_select .option`)[0].dataset.value === 'select' || $(`.blacklists_select .option`)[0].dataset.value === '') {
                      return scripts.fieldError('.blacklists_select', false, mc.i18n('system.errors.blacklist'), '.blacklist-settings .columns', 'after')
                  }
                  setting.settings.id = +$(`.blacklists_select .option`)[0].dataset.value;
                  break;
              case 'message':
                  if (!$(`#message tbody tr`).length) {
                      return scripts.fieldError('.message_select', false, mc.i18n('system.errors.message'), '.message-settings .columns', 'after')
                  }
                  setting.settings.materials = [];
                  setting.settings.send_via = $('.send_via_select .option')[0].dataset.value
                  $(`#message tbody tr`).forEach(row => {
                      setting.settings.materials.push({id: row.dataset.id})
                  })
                  break;
              case 'tag':
                  if (!$(`#tags .tag`).length) {
                      return scripts.fieldError('.tag-settings .autocomplete input')
                  }
                  setting.settings.id = []
                  $(`#tags .tag`).forEach((item, i) => {
                      setting.settings.id.push(+item.dataset.id)
                  })
                  break;
              case 'playback':
                  if (!$(`#playback tr[data-id]`).length) {
                      return scripts.fieldError('.playback_select', false, mc.i18n('system.errors.playback'), '.playback-settings .columns', 'after')
                  }
                  setting.settings = {materials: []}
                  $(`#playback tr[data-id]`).forEach((item, i) => {
                      setting.settings.materials.push({
                          id: +item.dataset.id,
                          start: $(item).find('input').val().length ? +$(item).find('input').val() : 0
                      })
                  })
                  break;
              case 'manager':
                  if (!$(`#manager tbody tr`).length) {
                      return scripts.fieldError('.manager-settings input')
                  }
                  setting.settings = []
                  $(`#manager tbody tr`).forEach(row => {
                      setting.settings.push({
                          phone: row.dataset.phone,
                          timeout: $(row).find('[name=timeout]').val() === '' ? 0 : +$(row).find('[name=timeout]').val()
                      })
                  })
                  break;
              case 'webhook':
                  if ($(`.webhook_select .option`)[0].dataset.value === 'select' || $(`.webhook_select .option`)[0].dataset.value === '') {
                      return scripts.fieldError('.webhook_select', false, mc.i18n('system.errors.webhook'), '.webhook-settings .columns', 'after')
                  }
                  setting.settings.id = +$(`.webhook_select .option`)[0].dataset.value;
                  break;

              default:
                  break;
          }

          $('#node_edit').find('input.filter, textarea.filter').forEach((item) => {
              if (item.offsetParent !== null) {
                  setting.settings[item.name] = item.value
              }
          })

          if (!$('#ivr_node_' + data.type + '_' + data.id).length) {
              let ivr_settings = $('#ivr_node_' + data.node_id).find('div.' + data.type)
              ivr_settings[ivr_settings.length - 1].before($(await setting_view({
                  setting_type: data.type,
                  id: data.id,
                  type: setting.type
              }))[0])
          } else {
              $('#ivr_node_' + data.type + '_' + data.id + ' .name').text(mc.i18n('ivr.nodes.' + data.type + 's.types.' + setting.type))
          }

          mc.events.push('ivr.node.settings.close')
          mc.storage.set('ivr', ivr)
      })

      mc.events.on('ivr.node.settings.position', async (data) => {
          let ivr = mc.storage.get('ivr')
          let node_id = $(data.el).closest('.node')[0].dataset.id
          let settings = ivr.nodes[node_id][data.el.classList[0] + 's']
          let new_settings = {}
          for (let i in data.ordered) {
              new_settings[node_id * 1000 + i] = settings[data.ordered[i]]
          }
          ivr.nodes[node_id][data.el.classList[0] + 's'] = new_settings
          mc.storage.set('ivr', ivr)
      })

      return ($scope, $params) => {
          node_type = 'lead';
          is_copy = $params.mode === 'clone';
      }
  });
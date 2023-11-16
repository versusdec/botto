define(['microcore', 'scripts', 'mst!ivr/nodes/actions/item', 'mst!ivr/nodes/actions/playback', "notify"],
  function (mc, scripts, table_item, playback_item, notify) {

      function onSelect(select, selected) {
          $(`#${select}`)[0].updateSelect(selected)
      }

      return {
          prepareActions: async (data) => {
              data.params.types = [
                  {option: mc.i18n("ivr.nodes.actions.types.lead"), value: "lead"},
                  {option: mc.i18n("ivr.nodes.actions.types.blacklist"), value: "blacklist"},
                  {option: mc.i18n("ivr.nodes.actions.types.tag"), value: "tag"},
                  {option: mc.i18n("ivr.nodes.actions.types.message"), value: "message"},
                  {option: mc.i18n("ivr.nodes.actions.types.manager"), value: "manager"},
                  {option: mc.i18n("ivr.nodes.actions.types.playback"), value: "playback"},
                  {option: mc.i18n("ivr.nodes.actions.types.webhook"), value: "webhook"}
              ];
              data.params.select = {
                  message: async (select) => {
                      let data = {
                          id: +select.value,
                          name: $(`.message_select .options [data-value="${select.value}"]`)[0].innerText,
                          type: 'message'
                      }
                      $(`#message`)[0].classList.remove('hide')
                      $(`#message tbody`).append(await table_item(data));
                      let selected = $(`#message tbody tr[data-id]`).map(item => +item.dataset.id)
                      onSelect(select.id, selected)
                  },
                  playback: async (select) => {
                      await mc.api.call(`communications.materials.get`, {
                          id: +select.value,
                          project_id: mc.storage.get('project_id')
                      })
                        .then(async res => {
                            if (res) {
                                res.file = `${require.config.api}${res.data.data.path}`;
                                res.action_type = 'playback';
                                $(`#playback tbody`).append(await playback_item(res));
                                $(`#playback`)[0].classList.remove('hide')
                                let selected = $(`#playback tbody tr[data-id]`).map(item => +item.dataset.id)
                                onSelect(select.id, selected)
                            } else {
                                notify(mc.i18n('system.error'))
                            }
                        })
                  },
              }
              data.params.request = {
                  webhook_method: 'integrations.list',
                  webhook_params: {
                      limit: 10,
                      offset: 0,
                      project_id: mc.storage.get('project_id')
                  },
                  playback_method: 'communications.materials.list',
                  playback_params: {
                      status: 'active',
                      type: 'audio',
                      limit: 10,
                      offset: 0,
                      project_id: mc.storage.get('project_id')
                  },
                  blacklist_method: 'communications.blacklists.list',
                  blacklist_params: {
                      limit: 10,
                      offset: 0,
                      status: 'active',
                      project_id: mc.storage.get('project_id')
                  },
                  message_method: 'communications.materials.list',
                  message_params: {
                      status: 'active',
                      type: 'short_message_template',
                      project_id: mc.storage.get('project_id'),
                      limit: 10,
                      offset: 0
                  }
              }

              if (data.params.settings) {
                  switch (data.params.type) {
                      case 'blacklist':
                          data.params.items = [await mc.api.call('communications.blacklists.get',
                            {project_id: mc.storage.get('project_id'), id: data.params.settings.id})];
                          data.params.settings.blacklist_option = data.params.items[0].name;
                          data.params.settings.blacklist_value = data.params.settings.id;
                          data.params.settings.blacklist_selected = [data.params.items[0].id];
                          break;
                      case 'webhook':
                          data.params.items = [await mc.api.call('integrations.get',
                            {project_id: mc.storage.get('project_id'), id: data.params.settings.id})];
                          data.params.settings.webhook_option = data.params.items[0].name;
                          data.params.settings.webhook_value = data.params.settings.id;
                          data.params.settings.webhook_selected = [data.params.items[0].id];
                          break;
                      case 'message':
                          data.params.items = [];
                          data.params.settings.message_selected = [];

                          for (let i = 0; i < data.params.settings.materials.length; i++) {
                              data.params.items.push(await mc.api.call('communications.materials.get',
                                {
                                    project_id: mc.storage.get('project_id'),
                                    id: +data.params.settings.materials[i].id
                                })
                                .then(res => {
                                    data.params.settings.message_selected.push(res.id);
                                    res.type = 'message';
                                    return res;
                                }))
                          }

                          break;
                      case 'playback':
                          data.params.items = [];
                          data.params.settings.playback_selected = [];

                          for (let i in data.params.settings.materials) {
                              let item = await mc.api.call('communications.materials.get',
                                {
                                    project_id: mc.storage.get('project_id'),
                                    id: data.params.settings.materials[i].id
                                })
                                .then(res => {
                                    res.file = `${require.config.api}${res.data.data.path}`;
                                    res.action_type = 'playback';
                                    return res
                                })
                              item.start = data.params.settings.materials[i].start;
                              data.params.settings.playback_selected.push(item.id);
                              data.params.items.push(item);
                          }
                          break;
                      case 'tag':
                          data.params.items = []
                          for (let i = 0; i < data.params.settings.id.length; i++) {
                              data.params.items.push(await mc.api.call('projects.tags.get', {
                                  project_id: mc.storage.get('project_id'),
                                  id: +data.params.settings.id[i]
                              })
                                .then(res => res))
                          }
                          break;
                      case 'manager':
                          data.params.items = [];
                          data.params.settings.forEach(p => {
                              data.params.items.push({phone: p.phone, type: data.params.type, timeout: p.timeout})
                          })
                          break;
                      default:
                          break;
                  }
              } else {
                  data.params.settings = {send_via: 'sms'}
              }
              return data
          }
      }
  });
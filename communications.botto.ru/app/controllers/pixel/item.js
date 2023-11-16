define(["microcore", "mst!layouts/view", "mst!/item_view"],
  function (mc, view, list_view) {

      return async function (params) {
          document.title = `${mc.i18n('detailing.title')} | Botto Platform`;
          let data = await mc.api.call('communications.dialings.get', {
              project_id: mc.storage.get('project_id'),
              id: +params.id
          }).then(async call => {
              if (call) {
                  console.log(call);

                  if (call.record === false || call.record === 'false') {
                      call.record = false
                  } else {
                      call.file = `${require.config.api}${call.record}`;
                      call.record = true;
                  }

                  if (call.ivr && call.ivr.length) {
                      for (let i = 0; i < call.ivr.length; i++) {
                          await mc.api.call('communications.ivr.get', {project_id: mc.storage.get('project_id'), id: +call.ivr[i].ivr_id}).then(ivr => {
                              if (ivr) {
                                  // console.log(ivr);
                                  call.ivr[i].name = ivr.nodes.find(item => {
                                      if (item.id === +call.ivr[i].pid) {
                                          /*item.actions.find(async action => {
                                              if (action.type === 'playback') {
                                                  call.ivr[i].material = {
                                                      type: 'audio',
                                                      item: await mc.api.call('communications.materials.get', {
                                                          project_id: mc.storage.get('project_id'),
                                                          id: action.settings.materials[0].id
                                                      }).then(res => {
                                                          if (res) {
                                                              return `${require.config.api}${res.data.data.path}`;
                                                          }
                                                      })
                                                  }
                                              }
                                          })*/
                                          return item.name
                                      }

                                  }) || ivr.name;

                              }
                          })
                      }
                  } else {
                      call.ivr = false
                  }
                  return call
              } else {
                  // notify(mc.i18n('system.error'))
              }
          })
          return view({
              back: mc.storage.get('detailing.back_link') || `/${mc.storage.get('project_id')}/detailing/`,
              title: mc.i18n('detailing.title'),
              content: await call_view(data)
          });
      }
  }
);
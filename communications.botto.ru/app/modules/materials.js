define(['microcore', 'scripts', "notify"],
  function (mc, scripts, notify) {

      let material, type, is_copy;

      mc.events.on('material.name.change', name => {
          material.name = name;
      });

      mc.events.on("materials.save", async ({btn}) => {
          if (is_copy) {
              delete material.id
          }
          if (material.name === '') {
              return scripts.fieldError('[name=name]');
          }
          if (type === 'link' && material.url === '') {
              return scripts.fieldError('[name=url]');
          }
          if (type !== 'link' && !material.data.data) {
              let type = mc.storage.get('material.source');
              switch (type) {
                  case 'file':
                      return scripts.fieldError('#file .dropzone');
                  case 'tts':
                      return scripts.fieldError('#tts textarea[name=tts-text]');
                  case 'mic':
                      if (!$('#mic .player')[0].blob) {
                          return scripts.fieldError('#mic .player');
                      } else {
                          let mic_data = new FormData();
                          mic_data.append('file', $('#mic .player')[0].blob);
                          await fetch(`${require.config.api}/upload`, {
                              method: 'POST',
                              body: mic_data
                          }).then(res => res.json())
                            .then(res => {
                                console.log(res);
                                if (res) {
                                    material.data = {
                                        type: 'file',
                                        data: {
                                            filename: 'mic',
                                            path: res[0].path
                                        }
                                    };
                                } else {
                                    scripts.notification(mc.i18n('system.error'))
                                }
                            });
                      }
              }
          }

          btn.setAttribute('disabled', true)

          let method = material.id ? 'update' : 'create';
          delete material.status;
          console.log(material);
          mc.api.call(`communications.${type === 'link' ? 'tracker' : 'materials'}.${method}`, material).then(res => {
              if (res) {
                  if (location.pathname.match(/\/\d+\/materials\//i)) {
                      mc.router.go(`/${mc.storage.get('project_id')}/materials/active/${type}/`)
                  } else {
                      $(btn).closest('.popup-wrapper').remove();
                  }
                  notify(mc.i18n(`materials.${material.id ? 'updated' : 'created'}`))
                  mc.events.push(`materials.created`, {id: res, type: type})
              } else {
                  btn.removeAttribute('disabled')
                  notify(mc.i18n('system.error'))
              }
          })
      });

      return async (params) => {
          type = params.type;
          is_copy = params.mode === 'clone';
          let data = {
              type: params.type,
              id: params.id
          }
          if (+params.id && params.type !== 'link') {
              data.material = await mc.api.call('communications.materials.get',
                {project_id: mc.storage.get('project_id'), id: +params.id}).then(res => {
                  if (res) {
                      if (params.type === 'audio') {
                          // data.file = `${res.data.data.path.substring(0, 4) === 'blob' ? res.data.data.path : require.config.api + res.data.data.path}`
                          data.file = `${require.config.api}${res.data.data.path}`
                          data.source = res.data.data.text ? 'tts' : res.data.data.filename === 'mic'
                            ? 'mic' : res.data.type;
                      }
                      if (res.data.type === 'tts_template') {
                          data.source = 'tts_template'
                      }
                  }
                  return res
              });
          } else if (+params.id && params.type === 'link') {
              data.material = await mc.api.call('communications.tracker.get',
                {project_id: mc.storage.get('project_id'), id: +params.id}).then(res => res);
          }
          if (+params.id && !data.material) {
              return mc.router.go(`/${mc.storage.get('project_id')}/404`)
          }
          if (params.mode === 'clone') {
              data.mode = 'clone'
          }
          if (!+params.id && params.type === 'audio') {
              data.source = 'file'
          }
          if (params.id === 'new') {
              if (params.type === 'audio') {
                  data.material = {
                      project_id: mc.storage.get('project_id'),
                      name: '',
                      data: {
                          type: 'file'
                      },
                      type: 'audio',
                      normalize: false
                  }
              }
              if (params.type === 'text') {
                  data.material = {
                      project_id: mc.storage.get('project_id'),
                      name: '',
                      data: {},
                      type: 'short_message_template'
                  }
              }
              if (params.type === 'tts') {
                  data.material = {
                      project_id: mc.storage.get('project_id'),
                      name: '',
                      data: {},
                      type: 'tts_template'
                  }
              }
              if (params.type === 'link') {
                  data.material = {
                      project_id: mc.storage.get('project_id'),
                      name: '',
                      url: '',
                      redirect_type: 'js',
                      utm_tags: {}
                  }
              }

          }

          mc.storage.set('material', data.material);
          mc.storage.set('material.source', data.source)
          material = mc.storage.get('material')

          return data
      }
  });
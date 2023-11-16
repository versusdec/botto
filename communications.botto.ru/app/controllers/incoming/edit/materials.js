define(["microcore",
      "mst!/incoming/edit/materials",
      "mst!/incoming/edit/materials/item",
      "mst!/materials/edit/audio/index",
      "notify", "popup", "scripts"],
  function (mc, view,
            materials_item,
            materials_create,
            notify,
            popup,
            scripts) {

      let incoming;

      function materialsCreated() {

      }

      mc.events.on('incoming.audio.start.change', async (input) => {
          incoming.start_materials.find(x => {
              if (x.id === +input.dataset.id) {
                  x.start = +input.value
              }
          })
      })

      mc.events.on('incoming.materials.remove', async ({btn, id}) => {
          incoming.start_materials.forEach((e, i) => {
              if (e.id === id) {
                  incoming.start_materials.splice(i, 1);
                  $('#materials .select')[0].updateSelect(incoming.start_materials.map(x => x.id))
              }
          })
          $(btn).closest('tr').remove();
      });

      mc.events.on('incoming.materials.create', async () => {
          popup(materials_create, {
              type: 'audio',
              popup: true,
              id: 'new'
          }).then((p) => {
              mc.events.off('materials.created')

              mc.events.on('materials.created', ({id, type}) => {
                  mc.api.call('communications.materials.get', {
                      project_id: mc.storage.get('project_id'),
                      id: id
                  }).then(async (res) => {
                      res.file = `${require.config.api}${res.data.data.path}`;
                      $('.table.materials tbody')
                        .append(await materials_item(res))
                      incoming.start_materials.push({id: res.id, start: 0});
                      $('#materials .select')[0].updateSelect(incoming.start_materials.map(x => x.id))
                  });
              })
          })
      })

      return async function ($scope, $params) {
          incoming = mc.storage.get('incoming');

          let data = {
              id: $params.id ? $params.id : 'new',
              materials: [],
              onselect: (select) => {
                  mc.api.call('communications.materials.get', {
                      project_id: incoming.project_id,
                      id: +select.value
                  }).then(async res => {
                      if (res) {
                          incoming.start_materials.push({
                              id: res.id,
                              start: 0
                          })
                          try {
                              res.file = `${require.config.api}${res.data.data.path}`
                          } catch (e) {
                              res.file = 'undefined'
                          }
                          $('.table.materials tbody')
                            .append(await materials_item(res))
                          $('#materials .select')[0].updateSelect(incoming.start_materials.map(x => x.id))
                      }
                  })
              },
              method: 'communications.materials.list',
              params: {
                  status: 'active',
                  type: 'audio',
                  limit: 10,
                  offset: 0,
                  project_id: incoming.project_id
              },
              selected: [],
              incoming: incoming
          }

          if (+incoming.id) {
              if (incoming.start_materials && incoming.start_materials.length) {
                  for (let i = 0; i < incoming.start_materials.length; i++) {
                      data.selected.push(incoming.start_materials[i].id)
                      let res = await mc.api.call('communications.materials.get', {
                          project_id: incoming.project_id,
                          id: incoming.start_materials[i].id
                      })
                      if (res) {
                          data.materials.push({
                              id: res.id,
                              name: res.name,
                              start: incoming.start_materials[i].start,
                              file: `${require.config.api}${res.data.data.path}`
                          });
                      }
                  }
              }
          }

          $($scope).html(await view(data))

      }

  });
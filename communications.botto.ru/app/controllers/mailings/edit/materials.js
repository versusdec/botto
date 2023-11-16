define(["microcore",
      "mst!/mailings/edit/materials",
      "mst!/mailings/edit/materials/item",
      "mst!/materials/edit/audio/index",
      "notify", "popup", "scripts"],
  function (mc, view,
            materials_item,
            materials_create,
            notify,
            popup,
            scripts) {

      let mailing;

      function materialsCreated() {

      }

      mc.events.on('mailings.audio.start.change', async (input) => {
          mailing.start_materials.find(x => {
              if (x.id === +input.dataset.id) {
                  x.start = +input.value
              }
          })
      })

      mc.events.on('mailings.materials.remove', async ({btn, id}) => {
          mailing.start_materials.forEach((e, i) => {
              if (e.id === id) {
                  mailing.start_materials.splice(i, 1);
                  $('#materials .select')[0].updateSelect(mailing.start_materials.map(x => x.id))
              }
          })
          $(btn).closest('tr').remove();
      });

      mc.events.on('mailings.materials.create', async () => {
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
                      mailing.start_materials.push({id: res.id, start: 0});
                      $('#materials .select')[0].updateSelect(mailing.start_materials.map(x => x.id))
                  });
              })
          })
      })

      return async function ($scope, $params) {
          mailing = mc.storage.get('mailing');

          let data = {
              id: $params.id ? $params.id : 'new',
              materials: [],
              onselect: (select) => {
                  mc.api.call('communications.materials.get', {
                      project_id: mailing.project_id,
                      id: +select.value
                  }).then(async res => {
                      if (res) {
                          mailing.start_materials.push({
                              id: res.id,
                              start: 0
                          })
                          try {
                              res.file = `${require.config.api}${res.data.data.path}`
                          } catch (e) {
                              res.file = ``
                          }
                          $('.table.materials tbody')
                            .append(await materials_item(res))
                          $('#materials .select')[0].updateSelect(mailing.start_materials.map(x => x.id))
                      }
                  })
              },
              method: 'communications.materials.list',
              params: {
                  status: 'active',
                  type: 'audio',
                  limit: 10,
                  offset: 0,
                  project_id: mailing.project_id
              },
              selected: [],
              mailing: mailing
          }

          if (+mailing.id) {
              if (mailing.start_materials && mailing.start_materials.length) {
                  for (let i = 0; i < mailing.start_materials.length; i++) {
                      data.selected.push(mailing.start_materials[i].id)
                      let res = await mc.api.call('communications.materials.get', {
                          project_id: mailing.project_id,
                          id: mailing.start_materials[i].id
                      })
                      if (res) {
                          data.materials.push({
                              id: res.id,
                              name: res.name,
                              start: mailing.start_materials[i].start,
                              file: `${require.config.api}${res.data.data.path}`
                          });
                      }
                  }
              }
          }

          $($scope).html(await view(data))

      }

  });
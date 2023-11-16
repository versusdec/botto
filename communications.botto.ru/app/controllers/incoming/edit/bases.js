define(["microcore",
      "mst!/incoming/edit/bases",
      "mst!/incoming/edit/bases/item",
      "mst!/bases/edit/index",
      "notify", "popup"],
  function (mc, view,
            bases_item,
            bases_create,
            notify,
            popup) {

      let incoming, tab, scope;

      mc.events.on('incoming.bases.remove', async ({btn, id}) => {
          const tab = $(btn).closest('.block').attr('id')
          incoming[tab].forEach((e, i) => {
              if (e === id) {
                  incoming[tab].splice(i, 1);
                  $(`#${tab} .select`)[0].updateSelect(incoming[tab])
              }
          })
          $(btn).closest('tr').remove();
      });

      mc.events.on('incoming.bases.create', async (btn) => {
          let target = $(btn).closest('#bases') ? 'bases' : 'blacklists';
          mc.storage.set('base', {
              name: '',
              project_id: mc.storage.get('project_id')
          })
          popup(bases_create, {
              id: 'new',
              popup: true,
              type: target
          }).then(p => {
              mc.events.off('bases.created')

              mc.events.on('bases.created', ({type, id}) => {
                  mc.api.call(`communications.${type}.get`, {
                      project_id: mc.storage.get('project_id'),
                      id: id
                  }).then(async (res) => {
                      $(`.table.${target} tbody`)
                        .append(await bases_item({id: res.id, name: res.name}))
                      incoming[target].push(res.id)
                      $(`#${target} .select`)[0].updateSelect(incoming[target])
                  });
              })
          })
      })

      mc.events.on('incoming.bases.edit', async ({btn, id}) => {
          let target = $(btn).closest('#bases') ? 'bases' : 'blacklists';
          mc.storage.set('base', await mc.api.call(`communications.${target}.get`, {
              project_id: mc.storage.get('project_id'), id: +id
          }).then(res => {
              if (res) {
                  return res
              } else {
                  notify(mc.i18n('system.error'))
              }
          }))
          popup(bases_create, {
              id: +id,
              popup: true,
              type: target,
              base: mc.storage.get('base')
          }).then(p => {
              mc.events.off('bases.updated')

              mc.events.on('bases.updated', (base) => {
                  $(btn).closest('tr').find('td:nth-child(2)').html(base.name)
                  $(`#${target}`).find(`.select li[data-value="${base.id}"]`).html(base.name)
              })
          })
      })

      return async function ($scope, $params) {
          incoming = mc.storage.get('incoming');
          tab = $scope.attributes.id.value;
          let data = {
              id: $params.id ? $params.id : 'new',
              type: $scope.attributes.id.value,
              onselect: async (select) => {
                  incoming[select.name].push(+select.value)
                  $(`.table.${select.name} tbody`)
                    .append(await bases_item({id: select.value, name: select.option}))
                  $(`#${select.name} .select`)[0].updateSelect(incoming[select.name])
              },
              incoming: incoming,
              bases: [],
              blacklists: [],
              method: `communications.${tab}.list`,
              params: {
                  status: 'active', limit: 10, offset: 0,
                  project_id: incoming.project_id
              },
              selected: incoming[tab],
              last: true
          }

          if (+incoming.id) {
              if (incoming.blacklists && incoming.blacklists.length) {
                  for (let i = 0; i < incoming.blacklists.length; i++) {
                      let res = await mc.api.call('communications.blacklists.get', {
                          project_id: incoming.project_id,
                          id: incoming.blacklists[i]
                      })

                      if (res) {
                          data.blacklists.push({
                              id: res.id,
                              name: res.name
                          });
                      }
                  }
              } else {
                  incoming.blacklists = []
              }
          }


          $($scope).html(await view(data))

      }

  });
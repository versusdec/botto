define(["microcore",
      "mst!/mailings/edit/bases",
      "mst!/mailings/edit/bases/item",
      "mst!/bases/edit/index",
      "notify", "popup"],
  function (mc, view,
            bases_item,
            bases_create,
            notify,
            popup) {

      let mailing, tab, scope;

      mc.events.on('mailings.bases.remove', async ({btn, id}) => {
          const tab = $(btn).closest('.block').attr('id')
          mailing[tab].forEach((e, i) => {
              if (e === id) {
                  mailing[tab].splice(i, 1);
                  $(`#${tab} .select`)[0].updateSelect(mailing[tab])
              }
          })
          $(btn).closest('tr').remove();
      });

      mc.events.on('mailings.bases.create', async (btn) => {
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
                      mailing[target].push(res.id)
                      $(`#${target} .select`)[0].updateSelect(mailing[target])
                  });
              })
          })
      })

      mc.events.on('mailings.bases.edit', async ({btn, id}) => {
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
          mailing = mc.storage.get('mailing');
          tab = $scope.attributes.id.value;
          let data = {
              id: $params.id ? $params.id : 'new',
              type: $scope.attributes.id.value,
              onselect: async (select) => {
                  mailing[select.name].push(+select.value)
                  $(`.table.${select.name} tbody`)
                    .append(await bases_item({id: select.value, name: select.option}))
                  $(`#${select.name} .select`)[0].updateSelect(mailing[select.name])
              },
              mailing: mailing,
              bases: [],
              blacklists: [],
              method: `communications.${tab}.list`,
              params: {
                  status: 'active', limit: 10, offset: 0,
                  project_id: mailing.project_id
              },
              selected: mailing[tab],
          }

          if (+mailing.id) {
              if (mailing.bases && mailing.bases.length) {
                  for (let i = 0; i < mailing.bases.length; i++) {
                      let res = await mc.api.call('communications.bases.get', {
                          project_id: mailing.project_id,
                          id: mailing.bases[i]
                      })

                      if (res) {
                          data.bases.push({
                              id: res.id,
                              name: res.name
                          });
                      }
                  }
              }
              if (mailing.blacklists && mailing.blacklists.length) {
                  for (let i = 0; i < mailing.blacklists.length; i++) {
                      let res = await mc.api.call('communications.blacklists.get', {
                          project_id: mailing.project_id,
                          id: mailing.blacklists[i]
                      })

                      if (res) {
                          data.blacklists.push({
                              id: res.id,
                              name: res.name
                          });
                      }
                  }
              } else {
                  mailing.blacklists = []
              }
          }


          $($scope).html(await view(data))

      }

  });
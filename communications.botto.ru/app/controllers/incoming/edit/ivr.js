define(["microcore",
      "mst!/incoming/edit/ivr",
      "mst!/ivr/edit",
      "app/modules/ivr/prepare",
      "mst!/incoming/edit/ivr/item",
      "notify", "popup"],
  function (mc, view,
            ivr_create,
            ivr_prepare,
            ivr_item,
            notify,
            popup) {

      let incoming;

      mc.events.on('incoming.ivr.create', async () => {
          let ivr = {nodes: [], last_id: 0, project_id: mc.storage.get('project_id'), id: 'new'};
          mc.storage.set('ivr', ivr_prepare.toStorage(ivr))
          popup(ivr_create, ivr_prepare.toView(ivr))
      })

      mc.events.on('ivr.created', id => {
          mc.api.call('communications.ivr.get', {
              project_id: mc.storage.get('project_id'),
              id: id
          }).then((res) => {
              if (res) {
                  incoming.ivr = res.id
                  $('#ivr .select')[0].updateSelect([res.id], res.name, res.id)
              } else {
                  notify(mc.i18n('system.error'))
              }
          });
      })

      return async function ($scope, $params) {
          incoming = mc.storage.get('incoming');

          let data = {
              id: $params.id ? $params.id : 'new',
              onselect: async (select) => {
                  select.value === 'select' ? incoming.ivr = null : incoming.ivr = +select.value;
              },
              method: 'communications.ivr.list',
              params: {
                  status: 'active', project_id: mc.storage.get('project_id'),
                  limit: 10, offset: 0
              },
              selected: [],
              incoming: incoming
          }

          if (+incoming.id && incoming.ivr) {
              let res = await mc.api.call('communications.ivr.get', {
                  project_id: incoming.project_id,
                  id: incoming.ivr
              })
              if (res) {
                  data.ivr = res;
                  data.selected.push(res.id)
              }
          }

          $($scope).html(await view(data))
      }

  });
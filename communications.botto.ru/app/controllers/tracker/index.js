define(
  ["microcore",
      "mst!/tracker/index",
      "notify",
      "popup"
  ],
  function (mc, view, notify, popup) {

      let filter = {
          project_id: mc.storage.get('project_id'),
          status: 'active'
      }, page, hash = {};


      return async function (params) {
          document.title = `${mc.i18n('tracker.title')} | Botto Platform`;

          hash = mc.router.hash();

          page = parseInt(hash.page) || 1;
          filter.limit = parseInt(hash.limit) || 10;
          filter.offset = (page - 1) * filter.limit;
          filter.status = 'active';
          hash.period_start ? filter.period_start = hash.period_start : void 0;
          hash.period_end ? filter.period_end = hash.period_end : void 0;

          let data = {
              options: [
                  {
                      option: mc.i18n('button.pick'),
                      value: 'select'
                  }
              ],
              value: mc.storage.get('tracker.link') ? mc.storage.get('tracker.link').value : 'select',
              option: mc.storage.get('tracker.link') ? mc.storage.get('tracker.link').option : mc.i18n('button.pick'),
              period_start: hash.period_start,
              period_end: hash.period_end
          };
          let [response, stats] = await mc.api.batch({
              method: `communications.tracker.list`, params: filter
          }, {
              method: 'communications.tracker.log.stats',
              params: {
                  project_id: mc.storage.get('project_id')
              }
          });
          data.stats = stats
          if (response && response.items && response.items.length) {
              for (let i in response.items) {
                  let item = response.items[i];
                  data.options.push({
                      option: item.name,
                      value: item.id
                  })
              }
          }
          return view(data);
      }
  });
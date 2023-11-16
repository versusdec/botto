define(
  ["microcore",
      "mst!/tariff/index"
  ],
  function (mc, view) {

      mc.events.on('sys:page.init:dashboard/index', () => {

      })

      return async function (params) {
          document.title = `${mc.i18n('tariff.title')} | Botto Platform`;
          let tariff = await mc.api.call('users.me').then(async u => {
              if (u) {
                  try {
                      var t = await mc.api.call('system.tariffs.get', {id: u.tariff.id})
                  } catch (e) {
                  }
              }
              return t
          });
          console.log(tariff);
          return view({tariff: tariff});
      }
  });
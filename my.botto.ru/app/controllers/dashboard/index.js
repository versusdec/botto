define(
  ["microcore",
      "mst!/dashboard/index",
      "mst!/profile/popup",
      "app/modules/notify",
      "popup"
  ],
  function (mc, view, profile, notify, popup) {
      let user, popupInited = true;

      mc.events.on('sys:page.init:dashboard/index', () => {
          !popupInited && mc.events.push('dashboard.inited')
      })

      mc.events.on('profile.update.popup', () => {
          popupInited = false
          mc.events.on('dashboard.inited', async () => {
              popup(profile, {user: await mc.api.call('users.me')})
              popupInited = true
          })
      })

      return async function (params) {
          document.title = `${mc.i18n('dashboard.title')} | Botto Platform`;
          let [user, tariff] = await mc.api.call('users.me').then(async u => {
              if (u) {
                  try {
                      var t = await mc.api.call('system.tariffs.get', {id: u.tariff.id})
                  } catch (e) {
                  }
              }
              return [u, t]
          });

          return view({user: user, tariff: tariff});
      }
  });
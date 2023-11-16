define(["microcore", "mst!/notifications/index"], function (mc, view) {

  mc.events.on('sys:page.init:notifications/index', function () {

  });

  return async function (params) {
    document.title = `${mc.i18n('system.notifications')} | Botto Platform`;
   /* let ns = await mc.api.call('notifications.list');
    console.log(ns);*/
    return view({
      options: [
        {
          option: mc.i18n('notification.not_read'),
          value: 'not_read'
        }, {
          option: mc.i18n('notification.read'),
          value: 'read'
        }
      ]
    });
  }
});
define(['microcore', 'mst!dashboard/news/item'], function (mc, item_view) {
  return async function ($scope, $params) {
    let user = await mc.api.call('users.me');

    mc.api.call("news.list", {
      limit: 3,
      role: user.settings.role
    }).then(async function (news) {
      if (news && news.items && news.items.length) {
        $($scope).find('.loader').remove()
        for (let i in news.items) {
          let item = news.items[i];

          $($scope).find('.list').append(await item_view(item))
        }
      } else {
        $($scope).find('.loader').text(mc.i18n('table.empty'))
      }

    })
  }
});
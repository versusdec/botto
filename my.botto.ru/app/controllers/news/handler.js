define(['microcore', 'mst!news/list/item'], function (mc, item_view) {
  return async function ($scope, $params) {
    let hash_params = mc.router.hash();
    let page = parseInt(hash_params.page) || 1;
    let limit = parseInt(hash_params.limit) || 10;
    let user = await mc.api.call('users.me');

    mc.api.call("news.list", {
      limit: limit,
      offset: (page - 1) * limit,
      role: user.settings.role
    }).then(async function (news) {
      if (news.items && news.items.length) {
        news.total > limit ? $('.pagination-wrapper').css('display', 'block') : void 0;
        $($scope).find('.list').html('')
        for (let i in news.items) {
          let item = news.items[i];

          $($scope).find('.list').append(await item_view(item))
        }
      } else {
        $($scope).find('.loader').text(mc.i18n('table.empty'))
      }

      mc.events.push('system:pagination.update', {
        total: news.total,
        limit: news.limit,
        current: page
      })
    })
  }
});
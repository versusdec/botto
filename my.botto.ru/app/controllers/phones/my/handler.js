define(['microcore', 'scripts', 'mst!phones/my/item', "/app/modules/confirm",
      "/app/modules/notify"],
  function (mc, scripts, item_view, confirm, notify) {
      let filter = {}, page;

      mc.events.on('phones.release', (phone) => {
          confirm(mc.i18n('phones.release') + '?', '', () => {
              mc.api.call('phones.release', {phone: phone.toString()})
                .then(res => {
                    if (res)
                        mc.router.go('/phones');
                    else
                        notify(mc.i18n('system.error'))
                })
          })
      });

      mc.events.on('phones.release.multiple', async () => {
          if (!$('[name=phone]:checked').length) {
              notify(mc.i18n('phones.not_selected'))
          } else {
              let phones = [];
              let checkboxes = $('input[name=phone]:checked');
              checkboxes.forEach(phone => {
                  phones.push(phone.value.toString());
              });
              confirm(mc.i18n('phones.release') + '?', '', () => {
                  mc.api.call('phones.release', {phone: phones})
                    .then(res => {
                        if (res) {
                            mc.router.go('/phones')
                        } else {
                            notify(mc.i18n('system.error'))
                        }
                    })
              })
          }
      });

      mc.events.on('phones.my.check.all', (checkbox) => {
          if (checkbox.checked) {
              $('tbody input[type=checkbox]').forEach(box => {
                  box.checked = true
              })
          } else {
              $('tbody input[type=checkbox]').forEach(box => {
                  box.checked = false
              })
          }
      });

      return async ($scope, $params) => {
          let hash_params = mc.router.hash();
          page = parseInt(hash_params.page) || 1;
          filter.limit = parseInt(hash_params.limit) || 10;
          filter.offset = (page - 1) * filter.limit;

          let phones = await mc.api.call('phones.my', filter);

          if (phones && phones.items && phones.items.length) {
              console.log(phones);
              $($scope).find('tbody').html('');
              for (let i in phones.items) {
                  let item = phones.items[i];
                  // item.private_phone = scripts.phoneClassify(item.phone)
                  $($scope).find('tbody').append(await item_view(item))
              }

              mc.events.push('system:pagination.update', {
                  id: 'my',
                  total: phones.total,
                  limit: phones.limit,
                  current: filter.offset / filter.limit + 1
              })
          } else {
              $($scope).find('.loader').html(mc.i18n('table.empty'))
          }


      }
  });
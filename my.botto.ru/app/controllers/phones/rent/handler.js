define(['microcore', 'scripts', 'mst!phones/rent/item', 'mst!phones/rent/popup', "/app/modules/confirm", "/app/modules/popup",
    "/app/modules/notify"],
  function (mc, scripts, item_view, popup_view, confirm, popup, notify) {
    let filter = {}, page;

    mc.events.on('phones.rent', (phone) => {
      confirm(mc.i18n('phones.confirm_rent'), '', () => {
        mc.api.call('phones.rent', {phone: phone})
          .then(res => {
            if (res) {
              mc.router.go('/phones');
            } else
              notify(mc.i18n('system.error'))
          })
      })
    });

    mc.events.on('phones.rent.multiple', async () => {
      if (!$('[name=phone]:checked').length) {
        notify(mc.i18n('phones.not_selected'))
      } else {
        let phones = [], price = 0, rows = [];
        let checkboxes = $('input[name=phone]:checked');
        checkboxes.forEach(phone => {
          price += +phone.dataset.price;
          phones.push(phone.value);
          rows.push({phone: scripts.phoneClassify(phone.value), price: phone.dataset.price})
        });
        popup(popup_view, {total: price, rows: rows}).then(phones_popup => {
          $(phones_popup).find('button').on('click', () => {
            mc.api.call('phones.rent', {phone: phones})
              .then(res => {
                if (res) {
                  mc.router.go('/phones')
                } else {
                  notify(mc.i18n('system.error'))
                }
              })
          })
        })
      }
    });

    mc.events.on('phones.check.all', (checkbox) => {
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

      let stock = await mc.api.call('phones.stock', filter);

      if (stock && stock.items && stock.items.length) {
        $($scope).find('tbody').html('');
        for (let i in stock.items) {
          let item = stock.items[i];
          item.private_phone = scripts.phoneClassify(item.phone)
          $($scope).find('tbody').append(await item_view(item))
        }

        mc.events.push('support:stats.update', {
          total: stock.total
        });

        mc.events.push('system:pagination.update', {
          id: 'stock',
          total: stock.total,
          limit: stock.limit,
          current: filter.offset / filter.limit + 1
        })
      } else {
        $($scope).find('.loader').html(mc.i18n('table.empty'))
      }


    }
  });
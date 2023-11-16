define(["microcore", "scripts",
      "mst!/incoming/edit/common",
      "mst!/incoming/edit/phones/item",
      "mst!/incoming/edit/phones/rent",
      "mst!/incoming/edit/phones/rent_item",
      "notify", "popup"],
  function (mc, scripts, view,
            phone_item,
            phones_rent,
            rent_item,
            notify,
            popup) {

      let incoming;

      mc.events.on('incoming.name.change', name => {
          incoming.name = name;
      });

      mc.events.on('incoming.phones.rent', async () => {
          let data = await mc.api.call('phones.stock', {limit: 10, offset: 0})
          data.items.forEach(item => {
              item.private_phone = scripts.phoneClassify(item.phone)
          })
          popup(phones_rent, {phones: data.items}).then((p) => {
              let price = 0;
              let phones = [];

              function check_event(e) {
                  if (e.target.checked) {
                      price += +e.target.dataset.price;
                      $(p).find('#phones_rent_total').html(price);
                      phones.push(e.target.value)
                  } else {
                      phones.forEach((p, i) => {
                          if (p === e.target.value) {
                              phones.splice(i, 1);
                          }
                      })
                      price -= +e.target.dataset.price;
                      $(p).find('#phones_rent_total').html(price)
                  }
              }

              $(p).find('.phones_check_all').on('click', (e) => {
                  price = 0;
                  phones = [];
                  if (e.target.checked) {
                      $(p).find('tbody input[type=checkbox]').forEach(box => {
                          box.checked = true;
                          phones.push(+box.value)
                          price += +box.dataset.price;
                      })
                      $(p).find('#phones_rent_total').html(price)
                  } else {
                      $(p).find('tbody input[type=checkbox]').forEach(box => {
                          box.checked = false
                      })
                      $(p).find('#phones_rent_total').html(price)
                  }
              });

              $(p).find('[name=phone]').on('click', check_event)

              $(p).find('.phones_more').on('click', (e) => {
                  mc.api.call('phones.stock', {
                      limit: 10,
                      offset: +e.target.dataset.offset
                  }).then(async (res) => {
                      if (res && res.items.length) {
                          $(p).find('[name=phone]').off('click', check_event)
                          e.target.dataset.offset = +e.target.dataset.offset + 10;
                          for (let i = 0; i < res.items.length; i++) {
                              res.items[i].private_phone = scripts.phoneClassify(res.items[i].phone)
                              $(p).find('tbody').append(await rent_item(res.items[i]))
                          }
                          $(p).find('[name=phone]').on('click', check_event)
                      } else {
                          $(e.target).remove()
                      }
                  })
              })

              $(p).find('button.rent').on('click', (e) => {
                  if (phones.length) {
                      mc.api.call('phones.rent', {phone: phones}).then(async res => {
                          if (res) {
                              mc.api.call('phones.my').then(res => {
                                  if (res) {
                                      $(p).remove();
                                      $('#phones .select')[0].updateSelect(res.items)
                                  } else {
                                      notify(mc.i18n('system.error'))
                                  }
                              })
                          } else {
                              notify(mc.i18n('system.error'))
                          }
                      })
                  }
              })
          })
      })

      return async function ($scope, $params) {
          incoming = mc.storage.get('incoming');

          let data = {
              id: $params.id ? $params.id : 'new',
              onselect: async (select) => {
                  if (select.value === 'any') {
                      incoming.phone = null;
                  } else {
                      incoming.phone = +select.value;
                  }
              },
              method: 'phones.my',
              params: {
                  limit: 10,
                  offset: 0
              },
              pattern: {
                  option: 'phone',
                  value: 'phone'
              },
              any: {option: incoming.phone ? incoming.phone : mc.i18n('incoming.any'), value: incoming.phone ? incoming.phone : 'any'},
              incoming: incoming
          }

          if (+incoming.id) {
              if (incoming.phones && incoming.phones.length) {
                  data.selected = incoming.phones
              }
          }

          $($scope).html(await view(data))
      }

  });
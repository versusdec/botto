define(["microcore", "scripts",
      "mst!/mailings/edit/common",
      "mst!/mailings/edit/phones/item",
      "mst!/mailings/edit/phones/rent",
      "mst!/mailings/edit/phones/rent_item",
      "notify", "popup"],
  function (mc, scripts, view,
            phone_item,
            phones_rent,
            rent_item,
            notify,
            popup) {

      let mailing;

      mc.events.on('mailings.name.change', name => {
          mailing.name = name;
      });

      mc.events.on('mailings.phone.remove', async ({btn, phone}) => {
          mailing.phones.forEach((e, i) => {
              if (+e === +phone) {
                  mailing.phones.splice(i, 1);
                  $('#phones .select')[0].updateSelect(mailing.phones)
                  /*$('#phones .select .options').find(`[data-value="${e}"]`)
                    .removeClass('disabled')*/
              }
          })
          $(btn).closest('tr').remove();
      });

      mc.events.on('mailings.phones.rent', async () => {
          let data = await mc.api.call('phones.stock', {limit: 10, offset: 0})
          data.items.forEach(item=> {
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
                              $('.table.phones').removeClass('hide')
                              $(p).remove();
                              for (let i = 0; i < phones.length; i++) {
                                  mailing.phones.push(+phones[i]);
                                  $('.table.phones tbody')
                                    .append(await phone_item({phone: phones[i]}))
                              }
                              $('#phones .select')[0].updateSelect(mailing.phones)
                          } else {
                              notify(mc.i18n('system.error'))
                          }
                      })
                  }
              })
          })
      })

      return async function ($scope, $params) {
          mailing = mc.storage.get('mailing');

          let data = {
              id: $params.id ? $params.id : 'new',
              onselect: async (select) => {
                  let phone = +select.value;
                  mailing.phones.push(phone)
                  $('.table.phones').removeClass('hide')
                  $('.table.phones tbody')
                    .append(await phone_item({
                        phone: phone
                    }))
                  $('#phones .select')[0].updateSelect(mailing.phones)
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
              mailing: mailing
          }

          if (+mailing.id) {
              if (mailing.phones && mailing.phones.length) {
                  data.selected = mailing.phones
              }
          }

          $($scope).html(await view(data))
      }

  });
define(['microcore', 'mst!layouts/components/payments/block', "app/modules/notify",
  "app/modules/popup",
  'mst!layouts/components/payments/popup',], function (mc, balance, notify, popup, withdraw_popup) {

  let user;
  let paymentsData = {
    type: 'yandex',
    /*options: [
      {
        option: 'ЮMoney',
        value: 'yandex'
      },
      {
        option: 'Карта',
        value: 'card'
      },
      {
        option: 'Р/с',
        value: 'rs'
      }
    ],
    type_change: (selected) => {
      paymentsData.type = selected.value
    }*/
  };

  function paymentsCall(data) {
    mc.api.call('partners.payments.withdraw', data).then((res) => {
      if (res) {
        notify('Ваша заявка принята')
      } else {
        notify('Произошла ошибка')
      }
    })
  }

  mc.events.on('partners.payments.popup', () => {
    popup(withdraw_popup, {user: user, data: paymentsData})
  });

  mc.events.on('partners.payments.withdraw', () => {
    let payload = {
      amount: parseInt($('[name=amount]').val()),
      user_id: user.id,
      type: paymentsData.type
    };

    console.log(payload);
    if (!payload.amount) {
      $('input[name=amount]').addClass('danger')[0].focus();
      return;
    } else
      $('input[name=amount]').removeClass('danger');
    if (payload.type === 'rs' && user.settings.company_card) {
      paymentsCall(payload)
    } else if (payload.type !== 'rs') {
      paymentsCall(payload)
    } else {
      notify('Произошла ошибка', 'Заполните карточку организации в личном кабинете')
    }

  });

  return async function ($scope, data) {
    user = await mc.api.call('users.me');

    switch (data.type) {
      case 'block':
        $($scope).append(await balance({balance: user.balance}))
        break;
      case 'button':
        $($scope).on('click', () => {
          mc.events.push('partners.payments.popup')
        })
    }
  }
});
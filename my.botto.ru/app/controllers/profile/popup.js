define(
  ["microcore", "mst!/profile/index", 'notify', 'confirm', "scripts"],
  function (mc, view, notify, confirm, scripts
  ) {
      let item = {}, user, topup;

      function setTimer(button, timeoutVar) {
          let now = new Date();
          let exp = new Date(JSON.parse(localStorage.getItem(timeoutVar)));
          let btn = $(button);
          if (exp && exp > now) {
              console.log(btn);
              if (btn)
                  btn[0].disabled = true;
              let timeout = parseInt((exp - now) / 1000);
              let m = parseInt(timeout / 60);
              let s = timeout % 60;
              let x = setInterval(function () {
                  s < 10 ? m < 10 ? btn.html('0' + m + ':0' + s) :
                      btn.html('0' + m + ':0' + s) :
                    m < 10 ? btn.html('0' + m + ':' + s) :
                      btn.html(m + ':' + s);
                  s--;
                  if (s === -1 && m !== 0) {
                      s = 59;
                      m--
                  } else if (s === -1 && m === 0) {
                      clearInterval(x);
                      mc.router.go(location.pathname)
                  }
                  if (s === 0 && m !== 0) {
                      s = 59;
                      m--;
                  }

                  /* if (m === 0 && s === -1) {
                     clearInterval(x);
                     mc.router.go(location.pathname)
                   }*/
              }, 1000);

          } else {
              btn[0].disabled = false;
          }
      }

      function setExpDate(timeoutVar, minutes) {
          let now = new Date();
          let exp = new Date();
          exp.setTime(now.getTime() + (minutes * 60000));
          localStorage.setItem(timeoutVar, JSON.stringify(exp.getTime()));
      }

      mc.events.on('profile.gender_change', (selected) => {
          item.gender = selected.value
      })

      mc.events.on('user.update.profile', async (btn) => {
          item.email = $('input[name=email]').val();
          item.name = $('input[name=name]').val();
          item.surname = $('input[name=surname]').val();
          item.second_name = $('input[name=second_name]').val();
          item.phone = $('input[name=phone]').val().replace(/[^0-9]/g, '') || null;

          if (!item.email.match(/\S+@\S+\.\S+/)) {
              return scripts.fieldError('#profile_popup input[name=email]');
          }

          if (topup) {
              if (item.name === '') {
                  return scripts.fieldError(('#profile_popup [name=name]'))
              }
              if (item.surname === '') {
                  return scripts.fieldError(('#profile_popup [name=surname]'))
              }
              if (item.second_name === '') {
                  return scripts.fieldError(('#profile_popup [name=second_name]'))
              }
              if (item.email === '') {
                  return scripts.fieldError(('#profile_popup [name=email]'))
              }
              if (!item.phone) {
                  return scripts.fieldError(('#profile_popup [name=phone]'))
              }
          }

          mc.api.call('users.update', item).then((res) => {
              if (res) {
                  $(btn).closest('.popup-wrapper').remove()
                  notify(mc.i18n('profile.updated'));
              } else {
                  notify(mc.i18n('system.error'));
              }
          })

      });

      mc.events.on('verify', (t) => {
          mc.api.call('users.verify', {type: t}).then(res => {
              if (res) {
                  switch (t) {
                      case 'email':
                          notify(mc.i18n('profile.verify.email'));
                          setExpDate('verify.email.timeout', 5);
                          setTimer('#v_email', 'verify.email.timeout');
                          break;
                      case 'phone':
                          $('a.btn.phone-ver').remove();
                          $('.phone-verify + div').removeClass('hide');
                          setExpDate('verify.phone.timeout', 3);
                          setTimer('#v_phone', 'verify.phone.timeout');
                          break;
                      default:
                          break;
                  }
              } else
                  notify(mc.i18n('system.error'))
          })
      });

      mc.events.on('verify.phone', (t) => {
          mc.api.call('users.verify', {code: $('[name=code]').val(), type: t}).then(res => {
              if (res) {
                  mc.api.call('users.update', {
                      phone: $('input[name=phone]').val().replace(/[^0-9]/g, '')
                  }).then(res => {
                      if (res) {
                          notify(mc.i18n('profile.verify.phone_verified'))
                      } else {
                          notify(mc.i18n('system.error'))
                      }
                  })
              } else
                  notify(mc.i18n('system.error'))
          })
      });

      mc.events.on('phone.change', (input) => {
          if (input.value.length > 21) {
              $('.phone-verify').removeClass('hide');
          } else {
              $('.phone-verify').addClass('hide');
          }
      });

      return function ($scope, $params) {
          setTimer('#v_email', 'verify.email.timeout')
          setTimer('#v_phone', 'verify.phone.timeout')
          item.gender = $params.gender || 'male'
          topup = $params.topup !== '';
          setTimeout(() => {
              $($scope).find('.select')[0].addOptions([
                  {option: mc.i18n('user.gender.female'), value: 'female'},
                  {option: mc.i18n('user.gender.male'), value: 'male'},
              ]);
          }, 300)
      }
  });
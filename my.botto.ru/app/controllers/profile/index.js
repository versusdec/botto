define(
  ["microcore", "mst!/profile/index", 'notify', 'confirm', 'scripts'],
  function (mc, view, notify, confirm, scripts
  ) {
      let item = {}, user;

      mc.events.on('ws:users.update', function (data) {
          if (location.pathname === '/profile')
              mc.router.go(location.pathname)
      })

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

      mc.events.on('notifications.check.all', ({btn, type}) => {
          let check = true;
          if (btn.dataset.uncheck)
              check = false;
          if (check) {
              $(`input[data-destination="${type}"]`).attr('checked', false)
              btn.dataset.uncheck = 'true';
          } else {
              $(`input[data-destination="${type}"]`).removeAttr('checked')
              delete btn.dataset.uncheck
          }
      });

      mc.events.on('sys:page.init:profile/index', () => {
          $('#profile .avatar img').attr('src', user.avatar ?
            require.config.api + user.avatar : '/img/ava.png');
          setTimer('#v_email', 'verify.email.timeout')
          setTimer('#v_phone', 'verify.phone.timeout')

          $('button[type=submit]').on('click', async (e) => {
              e.preventDefault();
              let logout = false;
              item.email = $('input[name=email]').val();
              item.name = $('input[name=name]').val();
              item.surname = $('input[name=surname]').val();
              item.second_name = $('input[name=second_name]').val();
              item.phone = $('input[name=phone]').val().replace(/[^0-9]/g, '');

              if (item.phone.length < 1) {
                  item.phone = null
              } else if (item.phone.length < 10) {
                  console.log(item.phone.length);
                  return scripts.fieldError('input[type=tel]', 0, mc.i18n('system.errors.phone'))
              } else {
                  $('#' + $('input[type=tel]')[0].error).remove()
              }

              if (!item.email.match(/\S+@\S+\.\S+/)) {
                  console.log(item.phone);
                  return mc.fieldError('input[name=email]', 0);
              }

              if ($('input[name=old]').val().length >= 1) {
                  let auth = await mc.api.call("auth.login", {
                      email: user.email,
                      password: $('input[name=old]').val()
                  });

                  if (auth) {
                      if ($('input[name=new]').val() === $('input[name=rep]').val()) {
                          item.password = $('input[name=rep]').val();
                          logout = true
                      } else {
                          notify(mc.i18n('auth.diff_password'));
                          return mc.fieldError('input[type=password]', 2)
                      }
                  } else {
                      return mc.fieldError('input[name=old]', 2)
                  }
              }
              let n = [];
              $('[data-event]').forEach(event => {
                  let d = [];
                  $(event).find('input').forEach(input => {
                      if (input.checked)
                          d.push(input.dataset.destination)
                  });
                  n.push({"event": event.dataset.event, "destinations": d})
              });
              item.notifications = n;

              mc.api.call('users.update', item).then((res) => {
                  if (res) {
                      notify(mc.i18n('profile.updated'));
                      logout ? mc.auth.logout() : mc.router.go('/profile')
                  } else {
                      notify(mc.i18n('system.error'));
                  }
              })
          })
      });

      mc.events.on('avatar.select', async () => {
          let fileInput = document.getElementById('fileinput')
          fileInput.click()
          /*let evt = document.createEvent('Event');
          evt.initEvent('click', true, true);
          document.getElementById('fileinput').dispatchEvent(evt);*/
      });

      mc.events.on('avatar.update', async (input) => {
          let data = new FormData();
          data.append('file', input.files[0]);

          let response = await fetch(`${require.config.api}/upload`, {
              method: 'POST',
              body: data
          }).then(res => res.json());

          mc.api.call('users.update', {id: item.id, avatar: response[0].path});
          $('.avatar img, img.avatar').attr('src', require.config.api + response[0].path)

      });

      mc.events.on('avatar.remove', async () => {
          confirm(mc.i18n('profile.avatar_confirm'), '', () => {
              mc.api.call('users.update', {id: item.id, avatar: null})
                .then(res => {
                    if (res)
                        $('.avatar img, img.avatar').attr('src', `/img/ava.png`);
                    else
                        notify(mc.i18n('system.error'));
                });
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

      return async function (params) {
          document.title = `${mc.i18n('profile.title')} | Botto Platform`;
          let data = {
              user: await mc.api.call('users.me')
          };

          item.id = data.user.id;
          user = data.user;
          data.genders = [
              {option: mc.i18n('user.gender.male'), value: 'male'},
              {option: mc.i18n('user.gender.female'), value: 'female'}
          ];
          data.gender_change = (selected) => {
              item.gender = selected.value
          };

          return view(data);
      }
  });
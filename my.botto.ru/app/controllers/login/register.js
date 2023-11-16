define(
  ["microcore", "mst!/login/register"],
  function (mc, view) {

      function preload(cb) {
          require([
              "mst!/layouts/main",
              "mst!/layouts/areas/footer",
              "mst!/layouts/areas/header",
              "mst!/layouts/areas/nav",
              "mst!/dashboard/index",
              "mst!/layouts/components/confirm",
              "mst!/layouts/components/popup",
              "mst!/layouts/components/notify",
              "app/modules/header",
              "app/modules/confirm",
              "app/modules/popup",
              "app/modules/notify",
              "app/controllers/dashboard/index"
          ], () => {
          })
      };

      function buildQueryParamsString(params = {}) {
          const query = []
          for (const p in params) {
              query.push(`${p}=${encodeURIComponent(params[p])}`)
          }
          return query.join('&')
      }

      function getCode() {
          const params = {
              client_id: '7623103',
              redirect_uri: `https://${location.host}/login`,
              scope: 4 + 4194304, // photos + email
              state: 'vk',
              display: 'page',
              response_type: 'code',
          };
          const oAuthUrl = `https://oauth.vk.com/authorize?${buildQueryParamsString(params)}`
          window.location.replace(oAuthUrl)
      }

      mc.events.on('register', (btn) => {
          if (!$('[name=email]').val().length || !$('[name=password]').val().length) {
              $('label + span.mdi input').addClass('error');
              setTimeout(() => {
                  $('label + span.mdi input').removeClass('error')
              }, 3000)
          } else {
              btn.setAttribute('disabled', true);
              const email = $('#login input[name="email"]').val().replaceAll(/\s/g, '')
              mc.api.call('auth.register', {
                  email: email,
                  password: $('#login input[name="password"]').val(),
                  language: localStorage.getItem('lang')
              }).then(async (res) => {
                  btn.removeAttribute('disabled')
                  if (res) {
                      if ($('[name=promo]').val().length) {
                          await mc.api.call('promocodes.activate', {code: $('[name=promo]').val()})
                      }
                      $('#login').addClass('open');
                      preload();
                      setTimeout(() => {
                          mc.router.go('/');
                          mc.events.push('profile.update.popup')
                      }, 2250)
                  } else {
                      $('.error').removeClass('invisible');
                      setTimeout(() => {
                          $('.error').addClass('invisible')
                      }, 3000)
                  }
              })
          }
      })

      mc.events.on('register.vk', function () {
          if ($('[name=promo]').val().length) {
              localStorage.setItem('_promocode', $('[name=promo]').val())
          }
          getCode();
      });

      mc.events.on('sys:page.init:login/register', (e) => {
          $('[name=password]').on('keyup', e => {
              if (e.key === 'Enter') {
                  mc.events.push('login')
              }
          })
      });

      return function (params) {
          document.title = `${mc.i18n('auth.title')} | Botto Platform`;
          if (params.code) {
              localStorage.setItem('_promocode', params.code)
          }
          return view({code: params.code ? params.code : ''});
      }
  });
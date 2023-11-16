define(
  ["microcore", "mst!/login/auth"],
  function (mc, view
  ) {
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
      }

      function buildQueryParamsString(params = {}) {
          const query = []
          for (const p in params) {
              query.push(`${p}=${encodeURIComponent(params[p])}`)
          }
          return query.join('&')
      }

      let authVK = (() => {
          return {
              getCode: function () {
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
              },
              login: function (code) {
                  mc.api.call('auth.vk', {code})
                    .then(res => {
                        if (res) {
                            processLoginResult(res)
                        } else {
                            mc.router.go('/login');
                            $('#login').removeClass('open').addClass('not_auth')
                        }
                    })
              }
          }
      })();

      function processLoginResult(res) {
          if (res) {
              if (localStorage.getItem('_promocode')) {
                  mc.api.call('promocodes.activate', {code: localStorage.getItem('_promocode')})
                    .then(() => {
                        localStorage.removeItem('_promocode')
                    })
              }
              $('#login').addClass('open')
              preload()
              setTimeout(() => {
                  mc.router.go('/');
              }, 2250)
          } else {
              $('.error').removeClass('invisible')
              setTimeout(() => {
                  $('.error').addClass('invisible')
              }, 3000)
          }
      }

      function processSocialAuth() {
          if (location.search) {
              const queryParams = new URLSearchParams(location.search);
              if (!queryParams.has('state')) {
                  return
              }

              const state = queryParams.get('state');

              if (state === 'vk') {
                  setTimeout(() => {
                      authVK.login(queryParams.get('code'))
                  }, 10)
              }

              return true
          }
      }

      mc.events.on('login.vk', function () {
          authVK.getCode()
      });

      mc.events.on('login', (btn) => {
          btn.setAttribute('disabled', true)
          mc.api.call('auth.login', {
              email: $('#login input[name="login"]').val(),
              password: $('#login input[name="password"]').val()
          }).then((res) => {
              processLoginResult(res)
              btn.removeAttribute('disabled')
          })
      });

      mc.events.on('sys:page.init:login/index', (e) => {
          $('[name=password]').on('keyup', e => {
              if (e.key === 'Enter') {
                  mc.events.push('login')
              }
          })
      })

      return function (params) {
          document.title = `${mc.i18n('auth.title')} | Botto Platform`;

          if (!processSocialAuth()) {
              return view();
          } else {
              setTimeout(() => {
                  $('#login').addClass('open')
              }, 10)
          }
      }
  });
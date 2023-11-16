define(
  ['miq',
      'microcore',
      'masked',
      'mst!404',
      'notify',

      'render',
  ],
  async function (
    $,
    mc,
    masked,
    page404,
    notify,
  ) {
      fetch('/phone-codes.json')
        .then(response => response.json())
        .then(codes => {
            mc.storage.set('phone_codes', codes)
        });

      window.$ = $;

      window.onfocus = async () => {
          let user = await mc.api.call('users.me');
          if ((!user || user.role === 'public') && (
              location.pathname !== '/login'
              && location.pathname.match(/registration/) === null
              && location.pathname !== '/password')
            && location.pathname.match(/recover/) === null
          ) {
              mc.auth.logout();
          }
      };

      function initWiki() {
          $('#wiki .mdi-close').on('click', () => {
              $('#wiki .block').addClass('hide');
              $('#wiki .open').removeClass('hide');
          })
          $('#wiki .open').on('click', () => {
              $('#wiki .open').addClass('hide');
              $('#wiki .block').removeClass('hide');
          })
      }

      mc.events.on('render404', async () => {
          const page = await page404();
          $(document.body).html(page)
      })

      mc.events.on('password.preview.toggle', btn => {
          $(btn).toggleClass('mdi-eye').toggleClass('mdi-eye-off')
          let input = $(btn).closest('.password').find('input')

          if (input.attr('type') === 'password') {
              input.attr('type', 'text')
          } else {
              input.attr('type', 'password')
          }
      })

      mc.events.on('routeChange', function () {
          if ([require.config.comm_sub_domain].includes(location.host) && location.pathname !== `/${mc.storage.get('project_id')}/404`) {
              mc.api.call('projects.get', {id: mc.storage.get('project_id')})
                .then(res => {
                    if (!res) {
                        mc.router.go(`/${mc.storage.get('project_id')}/404`)
                    }
                })
          }
          $(document.body).find('main')[0].scroll(0, 0)

          $('.tabs li a').on('click', function (e) {
              e.preventDefault();
              if ($(this).attr('href')) {
                  if (!$(e.target).closest('li').hasClass('disabled')) {
                      if ($(this).attr('href').substr(0, 5) == '#tab=') {
                          let tab = $(this).attr('href').substr(5)
                          let previous = $(this).closest('.tabs').find('.active a').attr('href').substr(5)

                          $(this).closest('.tabs').find('.active').removeClass('active')
                          $(this).closest('li').addClass('active')
                          $('#' + previous).addClass('hide')
                          $('#' + tab).removeClass('hide')
                      }
                  }
              }
              return false
          })

          if (location.hash.match('tab=.*?[^&]')) {
              $('.tabs a[href="' + location.hash + '"]')[0].click()
          }
          masked();

          if ($('#wiki').length) {
              initWiki()
          }

      });

      // mobile browsers address bar counts as vh fix
      function getVH() {
          let vh = window.innerHeight * 0.01;
          document.body.style.setProperty('--vh', `${vh}px`);
      }

      getVH();
      window.addEventListener('resize', () => {
          getVH()
      });


  }
);
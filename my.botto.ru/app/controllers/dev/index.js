define(
  ["microcore", "mst!/dev/index", "mst!/profile/popup", "chart", "popup", "notify", "scripts"],
  function (mc, view, profile, Chart, popup, notify, scripts
  ) {


      mc.events.on('dev.vibrate', () => {
          const patterns = [
              [125, 75, 125, 275, 200, 275, 125, 75, 125, 275, 200, 600, 200, 600],
              [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40, 500]
          ]
          window.navigator.vibrate(patterns[0])
      })

      mc.events.on('dev.test', () => {
          const h1 = [
              'hello motherfucker',
              'hello',
              'motherfucker',
              'motherfucker milk sucker',
              'motherfucker milk sucker ugly fucker',
          ]
          const p = [
              'motherfucker milk sucker',
              'motherfucker milk sucker ugly fucker',
              '',
              '',
              ''
          ]

          notify(h1[Math.floor(Math.random() * h1.length)], p[Math.floor(Math.random() * p.length)])
      })

      mc.events.on('popup.test', () => {
          /*const link = document.createElement('a')
          link.setAttribute('href', 'https://google.com')
          link.setAttribute('target', '_blank')
          link.click()
          */
          // var windowReference = window.open();
          location.href = 'https://google.com'
          // console.log(location)
          // windowReference.location = 'https://google.com.ua';
      })

      let body = '<table style="width: 600px; text-align: center;border-collapse: collapse;font-family: sans-serif;">\n' +
        '    <thead style="background: #15203D;height: 100px;">\n' +
        '    <tr>\n' +
        '        <td>\n' +
        '            <a href="https://botto.ru" target="_blank">\n' +
        '                <img height="50px" src="https://botto.ru/img/logo.png" alt="">\n' +
        '            </a>\n' +
        '        </td>\n' +
        '    </tr>\n' +
        '    </thead>\n' +
        '    <tbody style="text-align: center;background: #fff;color: #15203DFF">\n' +
        '    <tr>\n' +
        '        <td style="padding: 40px 40px 0;">\n' +
        '            <h2>\n' +
        '                Заголовок письма\n' +
        '            </h2>\n' +
        '        </td>\n' +
        '    </tr>\n' +
        '    <tr>\n' +
        '        <td>\n' +
        '            <p style="padding: 0 40px;line-height: 36px">\n' +
        '                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda atque cupiditate ea eum facere\n' +
        '                facilis fuga impedit, magnam, mollitia non nulla perferendis perspiciatis placeat quam qui sed sint,\n' +
        '                tempora voluptatibus!\n' +
        '            </p>\n' +
        '        </td>\n' +
        '    </tr>\n' +
        '    <tr>\n' +
        '        <td>\n' +
        '            <a href="https://my.botto.ru" style="padding: 7px 40px;background-color: #24ADED;color: #fff;\n' +
        '            display: inline-block;text-decoration: none;border-radius: 7px">Перейти</a>\n' +
        '        </td>\n' +
        '    </tr>\n' +
        '    <tr>\n' +
        '        <td style="padding: 40px;"></td>\n' +
        '    </tr>\n' +
        '    </tbody>\n' +
        '    <tfoot style="background-color: #15203D;color: #fff;font-size: 11px;">\n' +
        '    <tr>\n' +
        '        <td style="padding: 40px;">\n' +
        '            <p>\n' +
        '                если вы не хотите получать эти уведомления <br>\n' +
        '                вы можете <a href="https://my.botto.ru/" style="color: white">отписаться</a>\n' +
        '            </p>\n' +
        '            <p>\n' +
        '                © 2021 Botto Platform\n' +
        '            </p>\n' +
        '        </td>\n' +
        '    </tr>\n' +
        '    </tfoot>\n' +
        '</table>\n'


      mc.events.on('dev.send', () => {
          /*mc.api.call('system.send', {to: 'versusdec@gmail.com', subject: 'test', body: body}).then(res => {
              console.log(res);
          })*/
      })

      mc.events.on('dev.submit', () => {
          if ($('input[name=name]').val() === '') {
              console.log($('input[name=name]').closest('.columns'));
              scripts.fieldError('input[name=name]', false, '', $('input[name=name]').closest('.columns'), 'after')
          } else {
              $('#' + $('input[name=name]')[0].error).remove()
          }
      })

      return function (params) {
          document.title = `Botto Platform`;

          //console.log('yo');
          /*function zakruglyash(x, num, direction) {
              if (+x && +num)
                  var rest = +num % +x;
              else
                  return alert('ty invalid')
              if (direction) {
                  switch (direction) {
                      case 'vira':
                          return num - rest + x;
                      case 'mayna':
                          return num - rest;
                      default:
                          return alert('idi nahui')
                  }
              } else
                  return rest <= x / 2 ? num - rest : num - rest + x
          }

          console.log(zakruglyash(50, 575))*/
          return view({
              options: [{
                  option: 'option',
                  value: 'value'
              }]
          });
      }
  });
define(['microcore',
      "mst!/materials/edit/audio/index",
      "mst!/materials/edit/text/index",
      "mst!/materials/edit/link/index",
      "mst!/materials/edit/audio/preview",
      "notify", "scripts", "app/modules/materials"],
  function (mc, audio_view, text_view, link_view, preview, notify, scripts, materials_data) {

      let material;

      mc.events.on('materials.source.change', (select) => {
          $('.type-block').addClass('hide');
          $('#' + select.value).removeClass('hide');
          mc.storage.set('material.source', select.value);
          delete material.data.data;
          $('#file #preview, #tts #tts-audio').html('');
          $('#mic .player .mdi-close')[0].click();
      });

      mc.events.on('materials.file.upload', async file => {
          material.data.data = file[0];
          $('#preview').html(await preview({file: `${require.config.api}${file[0].path}`, name: file[0].name}))
      });

      mc.events.on('materials.normalize.change', async val => {
          material.normalize = val;
      });

      mc.events.on('material.tts_template-text.change', text => {
          material.data.data = {text: text, voice: $('[name=tts_template-voice]:checked')[0].value};
      });

      mc.events.on('tts.preview', async (btn) => {
          btn.setAttribute('disabled', true)
          let blob;
          let voice = $(`#tts`).find('input:checked')[0].value;
          let text = $(`textarea[name=tts-text]`)[0].value;
          let url = 'https://tts.voicetech.yandex.net/generate?' +
            'key=069b6659-984b-4c5f-880e-aaedcfd84102' +
            '&text=' + encodeURI(text) +
            '&format=wav' +
            '&lang=ru-Ru' +
            '&speaker=' + voice;

          try {
              blob = await fetch(url, {
                  method: 'GET'
              }).then(res => res.blob())
          } catch (e) {
              btn.removeAttribute('disabled');
              notify(mc.i18n('system.error'))
          }

          if (blob) {
              let data = new FormData();
              data.append('file', blob);
              let response = await fetch(`${require.config.api}/upload`, {
                  method: 'POST',
                  body: data
              }).then(res => res.json());
              if (response) {
                  material.data = {
                      type: 'file',
                      data: {
                          text: text,
                          voice: voice,
                          path: response[0].path
                      }
                  };
              } else {
                  notify(mc.i18n('system.error'))
              }

              $('#tts').find('#tts-audio').html(await preview({file: `${require.config.api}${material.data.data.path}`}))
          }
          btn.removeAttribute('disabled');
      })

      return async ($scope, $params) => {
          material = mc.storage.get('material')
          if (!material) {
              await materials_data($params).then(data => {
                  material = mc.storage.get('material')
              })
          }
      }
  });
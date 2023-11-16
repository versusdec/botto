define(['microcore',
      "mst!/materials/edit/audio/preview",
      "notify", "scripts", "app/modules/materials"],
  function (mc, preview, notify, scripts) {

      let material;

      mc.events.on('material.tts_template-text.change', text => {
          material.data.data = {text: text, voice: $('[name=tts_template-voice]:checked')[0].value};
      });

      mc.events.on('tts_template.preview', async (btn) => {
          btn.setAttribute('disabled', true)
          let blob;
          let voice = $(`#tts_template`).find('input:checked')[0].value;
          let text = $(`textarea[name=tts_template-text]`)[0].value;
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
              let audio = new Audio(URL.createObjectURL(blob));
              audio.play();
              $(audio).on('ended',()=>{
                  btn.removeAttribute('disabled');
              })
          } else {
              btn.removeAttribute('disabled');
          }
      })

      return async ($scope, $params) => {
          material = mc.storage.get('material');
          if (!material) {
              await materials_data($params).then(data=>{
                  material = mc.storage.get('material')
              })
          }
      }
  });
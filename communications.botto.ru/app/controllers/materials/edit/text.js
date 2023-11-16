define(['microcore',
      "notify", "scripts", "app/modules/materials"],
  function (mc, notify, scripts, materials_data) {

      let material;

      function smsCount(data) {
          /*const regexp = /[а-яё]/i;
          let divider = 153;
          let length = 160;
          if (regexp.test(text)) {
              divider = 67
              length = 70
          } else {
              divider = 153
              length = 160
          }
          let messages = Math.floor(text.length / length) + 1;
          // messages =
          console.log(text.length);
          console.log(messages);
          if (text.length >= (length * messages)) {
              messages = Math.floor(text.length / divider) + 1
          }
          $('sub span').html(messages)
          return messages*/
          $('[data-messages]').html(data.messages)
          $('[data-remaining]').html(data.remaining)
      }

      mc.events.on('material.text.change', text => {
          material.data.text = text;
      });

      mc.events.on('materials.text.check', input => {
          if (input.value.length < 480) {
              smsCount(scripts.SmsCounter.count(input.value));
          } else {
              input.value = input.value.substr(0, 479);
              smsCount(input.value)
          }
      });

      return async ($scope, $params) => {
          material = mc.storage.get('material');
          if (!material) {
              await materials_data($params).then(data=>{
                  material = mc.storage.get('material')
              })
          }
          if (+$params.id) {
              smsCount(scripts.SmsCounter.count(material.data.text))
          } else {
              smsCount(scripts.SmsCounter.count(''))
          }

      }
  });
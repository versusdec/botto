define(['microcore',
      "notify", "scripts", "app/modules/materials"],
  function (mc, notify, scripts, materials_data) {

      let material;

      mc.events.on('material.link.change', input => {
          if (input.attributes.name.value === 'utm_tags') {
              material.utm_tags[input.dataset.name] = input.value;
          } else {
              material[input.attributes.name.value] = input.value;
          }
      });

      mc.events.on('material.redirect.change', select => {
          material.redirect_type = select.value;
      });

      return async ($scope, $params) => {
          material = mc.storage.get('material');
          if (!material) {
              await materials_data($params).then(data=>{
                  material = mc.storage.get('material')
              })
          }
      }
  });
define(['microcore', 'mst!tracker/item', "confirm", "notify", "scripts", "popup", "mst!tracker/popup", "ol"],
  function (mc, item_view, confirm, notify, scripts, popup, details_view, ol) {
      let filter = {
          project_id: mc.storage.get('project_id'),
      }, page, scope, link, hash;

      mc.events.on('tracker.filter.range.change', (picker) => {
          hash[picker.name] = picker.value;
          if (picker.value === '')
              delete hash[picker.name]
      });

      mc.events.on('tracker.filter.link.change', select => {
          link = {value: select.value, option: select.option};
          /*mc.events.push('tracker.list');
          mc.events.push('tracker.stats');
          let hash_params = mc.router.hash();
          if (hash_params.page) {
              location.hash = 'page=1'
          }*/
      });

      mc.events.on('tracker.filter.apply', () => {
          mc.storage.set('tracker.link', {value: link.value, option: link.option})

          if (Object.keys(hash).length) {
              hash.page = 1;
              mc.router.go(mc.router.hash(hash))
          } else
              mc.router.go(location.pathname)
      })

      mc.events.on('tracker.filter.reset', () => {
          mc.storage.unset('tracker.link');
          link = false;
          mc.router.go(location.pathname)
      })

      mc.events.on('tracker.stats', () => {
          let data = {
              project_id: mc.storage.get('project_id')
          }

          if (mc.storage.get('tracker.link')) {
              data.tracker_id = mc.storage.get('tracker.link').value
          }

          mc.api.call('communications.tracker.log.stats', data).then(res => {
              for (let item in res) {
                  $(`[data-${item}]`).html(res[item])
              }
          })
      })

      mc.events.on('tracker.details', id => {
          mc.api.call('communications.tracker.log.get', {
              project_id: mc.storage.get('project_id'),
              id: +id
          }).then(res => {
              if (res) {
                  popup(details_view, res).then(popup => {

                      const iconFeature = new ol.Feature({
                          geometry: new ol.geom.Point(ol.proj.fromLonLat([res.longitude, res.latitude])),
                          name: res.ip
                      })
                      const iconStyle = new ol.style.Style({
                          image: new ol.style.Icon({
                              anchor: [0.5, 50],
                              anchorXUnits: 'fraction',
                              anchorYUnits: 'pixels',
                              src: 'https://botto.ru/img/icons/arrow.png',
                          }),
                      });
                      iconFeature.setStyle(iconStyle);

                      let map = new ol.Map({
                          target: 'map',
                          layers: [
                              new ol.layer.Tile({
                                  source: new ol.source.OSM()
                              }),
                              new ol.layer.Vector({
                                  source: new ol.source.Vector({
                                      features: [iconFeature],
                                  })
                              })
                          ],
                          view: new ol.View({
                              center: ol.proj.fromLonLat([res.longitude, res.latitude]),
                              zoom: 9
                          })
                      });
                      const element = document.getElementById('balloon');

                      const balloon = new ol.Overlay({
                          element: element,
                          positioning: 'bottom-center',
                          stopEvent: false,
                      });
                      map.addOverlay(balloon);

                      map.on('click', function (evt) {
                          const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
                              return feature;
                          });
                          if (feature) {
                              balloon.setPosition(evt.coordinate);
                          } else {
                              balloon.setPosition(0, 0);
                          }
                      });

                      map.on('pointermove', function (e) {
                          const pixel = map.getEventPixel(e.originalEvent);
                          const hit = map.hasFeatureAtPixel(pixel);
                          $(`#${map.getTarget()}`)[0].style.cursor = hit ? 'pointer' : '';
                      });
                      map.on('movestart', function () {
                          // $(element).popover('dispose');
                      });
                  })
              } else {
                  notify(mc.i18n('system.error'))
              }
          })
      })

      mc.events.on('tracker.list', async () => {
          if (mc.storage.get('tracker.link')) {
              filter.tracker_id = mc.storage.get('tracker.link').value
          } else {
              delete filter.tracker_id;
          }
          hash = mc.router.hash();
          page = parseInt(hash.page) || 1;
          filter.limit = parseInt(hash.limit) || 10;
          filter.offset = (page - 1) * filter.limit;
          hash.period_start ? filter.period_start = hash.period_start : void 0;
          hash.period_end ? filter.period_end = hash.period_end : void 0;

          let response = await mc.api.call(`communications.tracker.log.list`, filter);

          if (response && response.items && response.items.length) {

              $(scope).find('tbody').html('');
              for (let i in response.items) {
                  let item = response.items[i];
                  $(scope).find('tbody').append(await item_view(item))
              }

              mc.events.push('system:pagination.update', {
                  id: 'tracker',
                  total: response.total,
                  limit: response.limit,
                  current: filter.offset / filter.limit + 1
              })
          } else {
              if ($(scope).find('.loader').length)
                  $(scope).find('.loader').html(mc.i18n('table.empty'))
              else
                  $(scope).find('tbody').html(`<tr><td colspan="7"><div class="loader">${mc.i18n('table.empty')}</div></td></tr>`);

          }

      })

      return async ($scope, $params) => {
          // filter.status = 'active';
          link = false;
          scope = $scope
          mc.events.push('tracker.list')
      }
  });
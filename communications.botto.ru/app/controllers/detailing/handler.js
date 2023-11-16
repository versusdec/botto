define(['microcore', 'mst!detailing/calls/item', 'mst!detailing/sms/item', 'mst!detailing/calls/popup',
      "confirm", "notify", "popup", "scripts"],
  function (mc, call_view, sms_view, details_view, confirm, notify, popup, scripts) {
      let filter, page, scope, tab, type, hash = {};

      function filterReset() {
          hash = {};
          mc.storage.unset('detailing.filter');
          filter = {
              project_id: mc.storage.get('project_id'),
              direction: filter.direction,
              limit: parseInt(hash.limit) || 10,
              offset: (page - 1) * (parseInt(hash.limit) || 10)
          }
          mc.router.go(`/${mc.storage.get('project_id')}/detailing/${type}/${tab}/`)
      }

      mc.events.on('calls.filter.range.change', async (picker) => {
          filter[picker.name] = `${picker.value.getFullYear()}.${(picker.value.getMonth() + 1) < 10 ? '0' + (picker.value.getMonth() + 1)
            : picker.value.getMonth() + 1}.${picker.value.getDate() < 10 ? '0' + picker.value.getDate() : picker.value.getDate()
          } ${picker.name === 'period_start' ? '00:00:00' : '23:59:59'}`
          hash[picker.name] = filter[picker.name].split(' ')[0]
      })

      mc.events.on('calls.filter.type.change', (select) => {
          if (select.value === 'all') {
              delete hash.type;
              delete filter.type;
              delete hash.flag;
              delete filter.flag;
          } else {
              if (select.value !== 'lead' && select.value !== 'blacklisted') {
                  delete hash.flag
                  delete filter.flag
                  hash.type = select.value
                  filter.type = select.value
              } else {
                  delete hash.type
                  delete filter.type
                  hash.flag = select.value
                  filter.flag = select.value
              }
          }
          console.log(filter);
      })

      mc.events.on('sms.filter.value.change', ({value, type}) => {
          if (value === '') {
              delete filter[type]
          } else {
              filter[type] = value
          }
      })

      mc.events.on('sms.filter.type.change', async (select) => {
          if (select.value === 'all') {
              delete hash.type
          } else {
              hash.type = select.value
          }
      })

      mc.events.on('calls.filter', async () => {
          hash.page = 1;
          mc.storage.set('detailing.filter', filter)
          mc.router.go(mc.router.hash(hash))
          // mc.events.push('detailing.list')
      })

      mc.events.on('calls.filter.reset', async () => {
          filterReset();
      })

      mc.events.on('detailing.list', async () => {
          mc.storage.set('detailing.back_link', location.pathname + location.hash)
          let method = type === 'calls' ? 'communications.dialings.list' : 'communications.messages.list';
          if (filter.type && filter.type === 'all') {
              delete filter.type;
              delete filter.flag;
          }
          console.log(filter);
          let response = await mc.api.call(method, filter);
          if (response && response.items && response.items.length) {
              $(scope).find('tbody').html('');

              for (let i in response.items) {
                  let item = response.items[i];
                  item.private_phone = scripts.phoneClassify(item.phone)
                  let view = type === 'calls' ? await call_view(item) : await sms_view(item);
                  $(scope).find('tbody').append(view)
              }
          } else {
              if ($(scope).find('.loader').length)
                  $(scope).find('.loader').html(mc.i18n('table.empty'))
              else
                  $(scope).find('tbody').html(`<tr><td colspan="${type === 'calls' ? 9 : 6}"><div class="loader">${mc.i18n('table.empty')}</div></td></tr>`);
          }
          mc.events.push('system:pagination.update', {
              id: 'calls',
              total: response.total,
              limit: response.limit,
              current: filter.offset / filter.limit + 1
          })
          $('#calls-stats [data-total]').html(response.total);
      })

      mc.events.on('calls.details.open', (id) => {
          mc.api.call('communications.dialings.get', {
              project_id: filter.project_id,
              id: +id
          }).then(res => {
              if (res) {
                  console.log(res);
                  res.private_phone = scripts.phoneClassify(res.phone);
                  if (res.record === false || res.record === 'false') {
                      res.record = false
                  } else {
                      res.file = `${require.config.api}${res.record}`;
                      res.record = true;
                  }
                  let ivr = [];
                  if (res.ivr && res.ivr.length) {

                  }
                  popup(details_view, res)
              } else {
                  notify(mc.i18n('system.error'))
              }
          })
      })

      return async ($scope, $params) => {
          tab = $params.tab;
          type = $params.type;
          hash = mc.router.hash();
          page = parseInt(hash.page) || 1;
          filter = {
              ...filter,
              project_id: mc.storage.get('project_id'),
              direction: $params.tab,
              limit: parseInt(hash.limit) || 10,
              offset: (page - 1) * (parseInt(hash.limit) || 10),
              ...hash
          }
          delete filter.page
          if (hash.period_start) {
              filter.period_start = `${hash.period_start} 00:00:00`
          }
          if (hash.period_end) {
              filter.period_end = `${hash.period_end} 23:59:59`
          }
          console.log(filter);

          scope = $scope;
          mc.events.push('detailing.list')
      }
  });
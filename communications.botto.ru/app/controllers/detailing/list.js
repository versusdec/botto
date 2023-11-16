define(["microcore", "mst!/detailing/list"],
  function (mc, view) {

      return async function (params) {
          document.title = `${mc.i18n('detailing.title')} | Botto Platform`;
          let hash_params = mc.router.hash();

          let filter = mc.storage.get('detailing.filter') || {
              period_start: (hash_params && hash_params.period_start) ? hash_params.period_start.split('.')[2] + '.' +
                hash_params.period_start.split('.')[1] + '.' +
                hash_params.period_start.split('.')[0] : '',
              period_end: (hash_params && hash_params.period_end) ? hash_params.period_end.split('.')[2] + '.' +
                hash_params.period_end.split('.')[1] + '.' +
                hash_params.period_end.split('.')[0] : '',
          };
          // filter.type = hash_params.type || hash_params.flag || 'all';

          const type = params.type || 'calls';
          const calls_types = [
              {
                  option: mc.i18n('detailing.calls.filters.all'),
                  value: 'all'
              },
              {
                  option: mc.i18n('detailing.calls.filters.mailings'),
                  value: 'mailing'
              },
              {
                  option: mc.i18n('detailing.calls.filters.scenario'),
                  value: 'scenario'
              }, {
                  option: mc.i18n('detailing.calls.filters.manager'),
                  value: 'manager'
              }, {
                  option: mc.i18n('detailing.calls.filters.hook'),
                  value: 'hook'
              },
              {
                  option: mc.i18n('detailing.calls.filters.leads'),
                  value: 'lead'
              },
              {
                  option: mc.i18n('detailing.calls.filters.bl'),
                  value: 'blacklisted'
              }
          ]

          const sms_types = [
              {
                  option: mc.i18n('detailing.calls.filters.all'),
                  value: 'all'
              },
              {
                  option: mc.i18n('detailing.calls.filters.mailings'),
                  value: 'mailing'
              },
              {
                  option: mc.i18n('detailing.calls.filters.scenario'),
                  value: 'scenario'
              }, {
                  option: mc.i18n('detailing.calls.filters.manager'),
                  value: 'manager'
              }, {
                  option: mc.i18n('detailing.calls.filters.hook'),
                  value: 'hook'
              },
              {
                  option: 'API',
                  value: 'api'
              }
          ];

          let data = {
              tab: params.tab || 'outbound',
              type: type,
              filter: filter,
              options: type === 'calls' ? calls_types : sms_types,
              value: hash_params.type || hash_params.flag || 'all'
          }
          console.log(data);
          return view(data);
      }
  }
);
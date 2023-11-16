define(["microcore", "mst!mailings/analytics/info", "mst!layouts/view", "chart", "notify",
      "app/modules/export"],
  function (mc, view, page_view, Chart, notify) {
      let id, options = false, filter = {};

      mc.events.on('sys:page.init:mailings/analytics/info', function () {
          if (options) {
              const chart = new Chart(document.getElementById('chart'), options)
          }
      });

      mc.events.on('analytics.info.filter.apply', () => {
          if (Object.keys(filter).length) {
              mc.router.go(mc.router.hash(filter))
          } else
              mc.router.go(location.pathname)
      })

      mc.events.on('analytics.info.filter.range.change', (picker) => {
          filter[picker.name] = picker.value;
          if (picker.value === '')
              delete filter[picker.name]
      })

      return async function (params) {
          document.title = `${mc.i18n('mailings.analytics.title')} | Botto Platform`;
          filter = mc.router.hash();
          Object.entries(filter).forEach(item => {
              filter[item[0]] = item[1].replaceAll('%', ' ')
          })
          id = +params.id;

          let batch = await mc.api.batch({
                method: 'communications.mailings.stats',
                params: {
                    project_id: mc.storage.get('project_id'),
                    id: +params.id,
                    ...filter
                }
            },
            {
                method: 'communications.mailings.get',
                params: {
                    project_id: mc.storage.get('project_id'),
                    id: +params.id,
                    ...filter
                }
            }
          )
          let stats = batch[0], mailing = batch[1];


          if (!!!stats) {
              stats = {
                  calls: 0,
                  total: 0,
                  recalled: 0,
                  blacklisted: 0,
                  answered: 0,
                  not_answered: 0,
                  amd: 0,
                  leads: 0,
                  ppl: 0
              }
          } else {
              stats.not_answered = stats.calls - stats.answered
          }

          /* stats = {
               calls: 50,
               total: 50,
               recalled: 50,
               blacklisted: 50,
               answered: 50,
               amd: 50,
               leads: 50
           }*/
          let chart_colors = ['#56CCF2', '#EB5757', '#FFBB00', '#A09DC0', '#6FCF97'];
          let chart_data = {
              labels: [mc.i18n('mailings.analytics.calls.leads'),
                  mc.i18n('mailings.analytics.info.blacklisted'),
                  mc.i18n('mailings.analytics.info.amd'),
                  mc.i18n('mailings.analytics.info.recalled'),
                  mc.i18n('mailings.analytics.info.answered')],
              datasets: [
                  {
                      data: [stats.leads, stats.blacklisted, stats.amd, stats.recalled, stats.answered],
                      backgroundColor: chart_colors,
                  }
              ]
          };
          const getSuitableY = (y, yArray = [], direction) => {
              let result = y;
              yArray.forEach((existedY) => {
                  if (existedY - 40 < result && existedY + 40 > result) {
                      if (direction === "right") {
                          result = existedY + 40;
                      } else {
                          result = existedY - 40;
                      }
                  }
              });

              return result;
          };

          options = {
              type: 'doughnut',
              data: chart_data,
              plugins: [/*Chart.DataLabels,*/ {
                  afterDraw: (chart) => {
                      const ctx = chart.ctx;
                      ctx.save();
                      ctx.font = "10px 'Averta Std CY'";
                      const leftLabelCoordinates = [];
                      const rightLabelCoordinates = [];
                      const chartCenterPoint = {
                          x:
                            (chart.chartArea.right - chart.chartArea.left) / 2 +
                            chart.chartArea.left,
                          y:
                            (chart.chartArea.bottom - chart.chartArea.top) / 2 +
                            chart.chartArea.top
                      };
                      chart.config.data.labels.forEach((label, i) => {
                          const meta = chart.getDatasetMeta(0);
                          const arc = meta.data[i];
                          const dataset = chart.config.data.datasets[0];

                          // Prepare data to draw
                          // important point 1
                          const centerPoint = arc.getCenterPoint();
                          const model = arc;
                          chart.ctx.font = "12px sans-serif"
                          chart.ctx.backgroundColor = 'red'
                          let color = chart.config.data.datasets[0].backgroundColor[i];
                          let labelColor = '#15203D' //chart.config.data.datasets[0].backgroundColor[i];

                          const angle = Math.atan2(
                            centerPoint.y - chartCenterPoint.y,
                            centerPoint.x - chartCenterPoint.x
                          );
                          // important point 2, this point overlapsed with existed points
                          // so we will reduce y by 14 if it's on the right
                          // or add by 14 if it's on the left
                          const point2X =
                            chartCenterPoint.x + Math.cos(angle) * (model.outerRadius + 15);
                          let point2Y =
                            chartCenterPoint.y + Math.sin(angle) * (model.outerRadius + 15);

                          let suitableY;
                          if (point2X < chartCenterPoint.x) {
                              // on the left
                              suitableY = getSuitableY(point2Y, leftLabelCoordinates, "left");
                          } else {
                              // on the right

                              suitableY = getSuitableY(point2Y, rightLabelCoordinates, "right");
                          }

                          point2Y = suitableY;
                          let value = `${label}: ${dataset.data[i]}`;
                          let percent = (dataset.data[i] / (stats.calls / 100)) % 1 !== 0 ? (dataset.data[i] / (stats.calls / 100)).toFixed(1) + ' %' : dataset.data[i] / (stats.calls / 100) + ' %';
                          if (percent === 'NaN %')
                              percent = false
                          let edgePointX = point2X < chartCenterPoint.x ? 10 : chart.width - 10;

                          if (point2X < chartCenterPoint.x) {
                              leftLabelCoordinates.push(point2Y);
                          } else {
                              rightLabelCoordinates.push(point2Y);
                          }
                          //DRAW CODE
                          // first line: connect between arc's center point and outside point
                          ctx.strokeStyle = color;
                          ctx.beginPath();
                          ctx.moveTo(centerPoint.x, centerPoint.y);
                          ctx.lineTo(point2X, point2Y);
                          ctx.stroke();
                          // second line: connect between outside point and chart's edge
                          ctx.beginPath();
                          ctx.moveTo(point2X, point2Y);
                          ctx.lineTo(edgePointX, point2Y);
                          ctx.stroke();
                          //fill custom label
                          const labelAlignStyle =
                            edgePointX < chartCenterPoint.x ? "left" : "right";
                          const labelX = edgePointX;
                          const labelY = point2Y;
                          ctx.textAlign = labelAlignStyle;
                          ctx.textBaseline = "bottom";

                          ctx.fillStyle = labelColor;
                          ctx.fillText(value, labelX, labelY);
                          // console.log(percent);
                          percent ? ctx.fillText(percent, labelX, labelY + 15) : void 0;
                      });
                      ctx.restore();
                  }
              }],
              options: {
                  layout: {
                      padding: 30
                  },
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                      outerLabels: {
                          fontNormalSize: 14,
                          fontNormalColor: '#565d64',
                          fontBoldSize: 14,
                          fontBoldColor: '#2e2e2e',
                          debug: true,
                      },
                      legend: {
                          display: false,
                          position: 'bottom'
                      },
                      title: {
                          display: false
                      },
                      tooltip: {
                          // enabled: false,
                      },
                      datalabels: {
                          color: '#000000',
                          backgroundColor: chart_colors,
                          padding: 5,
                          display: 'auto',
                          borderRadius: 3,
                          anchor: 'start',
                          offset: 10,
                          clamp: true,
                          align: 'start',
                          formatter: function (value, context) {

                              let label = [context.chart.data.labels[context.dataIndex], [value]]
                              return label;
                          }
                      }
                  }
              },
          };
          (mailing.stats.ppl % 1) !== 0 ? mailing.stats.ppl = mailing.stats.ppl.toFixed(2) : void 0;
          let data = {
              project_id: mc.storage.get('project_id'),
              stats: stats,
              mailing: mailing,
              ...filter
          }

          return page_view({
              title: mc.i18n('mailings.analytics.title') + ` - ${mailing.name}`,
              back: `/${mc.storage.get('project_id')}/mailings/`,
              tabs: [
                  {
                      title: mc.i18n('mailings.analytics.info.title'),
                      active: true,
                      link: `/${mc.storage.get('project_id')}/mailings/stats/${params.type}/${params.id}/analytics/`
                  },
                  {
                      title: mc.i18n('mailings.analytics.calls.title'),
                      active: false,
                      link: `/${mc.storage.get('project_id')}/mailings/stats/${params.type}/${params.id}/analytics/calls/`
                  },
                  {
                      title: mc.i18n('mailings.analytics.materials.title'),
                      active: false,
                      link: `/${mc.storage.get('project_id')}/mailings/stats/${params.type}/${params.id}/analytics/materials/`
                  }
              ],
              content: await view(data)
          });
      }
  });
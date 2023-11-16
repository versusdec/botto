define(['microcore', 'mst!layouts/components/datepicker'], function (mc, datepicker_view) {
    return async (params) => {
        let data = params
        data.id = 'datepicker_' + Math.round(Math.random()*1000000);
        if (data.label && mc.i18n(data.label)) {
            data.label = mc.i18n(data.label)
        }
        data.onselect = function(date) {
            let $datepicker = $('#'+this.id).closest('.datepicker')
            $($datepicker.find('div')[0]).addClass('hide')

            $datepicker.find('input').val(date.toLocaleDateString())
            data.value = date
            if (typeof data.onchange == 'function') {
                data.onchange(data)
            } else if (typeof data.onchange == 'string') {
                mc.events.push(data.onchange, data)
            }
        }

        let wait_load = setInterval(() => {
            let $datepicker = $('#' + data.id)
            if ($datepicker.length) {
                clearInterval(wait_load)

                $(document).on('click', (e) => {
                    if (!$(e.target).closest('.datepicker, ul.calendar-list')) {
                        $($datepicker.find('div')[0]).addClass('hide')
                    }
                })

                $datepicker.find('input').on('focus', () => {
                    $('.datepicker > span > div').addClass('hide')
                    $datepicker.find('div.hide').removeClass('hide')
                }).on('keyup', function () {
                    if (this.value.match(/\d{1,2}\.\d{1,2}\.\d{4}/)) {
                        let date = this.value.split('.')
                        $datepicker.find('.calendar')[0].dispatchEvent(new CustomEvent('setDate', {detail: new Date(date[2], date[1]-1, date[0])}))
                    }
                })
            }
        }, 300)

        return await datepicker_view(data)
    }
});
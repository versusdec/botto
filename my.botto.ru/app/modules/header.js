define(['microcore'], function (mc) {

    const isNew = () => {
        let prev;
        return (current) => {
            let isNew = false;
            if (current > prev)
                isNew = true
            prev = current;
            return isNew
        }
    }
    const checkIfNew = isNew();

    mc.events.on('ws:notification', (notification) => {
        let $notifications = $('body > main > header .notifications');
        $notifications.find('.text').html(notification.text);
        $notifications.attr('href', notification.link);
        $notifications.css('display', 'block');

        mc.api.call('notifications.list', {status: "not_read", limit: 10}).then(res => {
            if (res) {
                let $bell = $('body > main > header .bell');
                const isNew = checkIfNew(res.length);
                if (isNew) {
                    $bell.addClass('animate').find('i').addClass(`mdi-numeric-${res.total < 10 ? res.total : '9-plus'}-circle`);
                    const animation = setTimeout(() => {
                        $bell.removeClass('animate');
                        return clearTimeout(animation)
                    }, 3600);
                } else {
                    $bell.find('i')[0].classList = `mdi mdi-numeric-${res.total < 10 ? res.total : '9-plus'}-circle`
                }

            }
        })
    })

    mc.events.on('notifications.test', function (num) {
        let $bell = $('body > main > header .bell');
        const isNew = checkIfNew(num);
        console.log(isNew);
        if (isNew) {
            $bell.addClass('animate').find('i').addClass(`mdi-numeric-${num < 10 ? num : '9-plus'}-circle`);
            const animation = setTimeout(() => {
                $bell.removeClass('animate');
                return clearTimeout(animation)
            }, 3600);
        } else {
            $bell.find('i')[0].classList = `mdi mdi-numeric-${num < 10 ? num : '9-plus'}-circle`
        }
    });


    mc.events.on('ws:users.balance', function (data) {
        $('.balance').html(data + ' ' + ___mc.i18n('currency'))
    })

    return function ($scope) {
        $($scope).find('.mdi-menu').on('click', function () {
            $(document).find('body')[0].classList.toggle('nav_minimized')
        })

        $($scope).find('.mdi-dots-horizontal').on('click', function () {
            $('body > nav').toggleClass('opened')
        })

        $('body > nav').find('.mdi-close').on('click', function () {
            $('body > nav').removeClass('opened')
        })

        if (!$($scope).hasClass('mobile')) {
            mc.api.batch(
              {method: "users.me"},
              {method: "notifications.list", params: {status: "not_read", limit: 1}}
            ).then(function (data) {
                let user = data[0]
                let notifications = data[1]

                if (user.avatar) {
                    $($scope).find('.avatar').attr('src', require.config.api + user.avatar)
                }
                $($scope).find('.balance').text(user.balance + ' ' + mc.i18n('currency'))
                $($scope).find('.email').text(user.email)
                $($scope).find('.name').html((user.name || '') + '&nbsp;' + (user.surname || ''))

                if (notifications) {
                    mc.events.push('ws:notification', notifications[0])
                }
            });
        }

    }
});
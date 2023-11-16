define(['microcore', 'mst!layouts/components/disclaimer'], function (mc, dis_view) {
    return async function (content) {
        let id = 'dis_' + Math.round(Math.random() * 1000000)

        let $dis = $(await dis_view({
            content: content, id: id
        }))

        $dis.find('.mdi-close').on('click', function () {
            $(document.body).find('.disclaimer#'+id).remove()
        })

        $(document.body).append($dis);

        setTimeout(function () {
            $(document.body).find('.disclaimer#' + id).css('bottom', '10px')
        }, 100)
    }
});
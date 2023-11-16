define(["microcore"], function (mc) {
    async function suggest(method, params, cb) {
        let data = await mc.api.call(method, params)

        let items = []

        if (data) {
            let arr = data.items ? data.item : data;
            for (let i in arr) {
                let item = arr[i]
                if (typeof cb == 'function') {
                    items.push(cb(item))
                } else {
                    items.push({
                        option: item.name,
                        value: item.id
                    })
                }

            }
        }

        return items
    }

    mc.events.on('regions.suggest', async (value) => {
        return await suggest('regions.suggest', {q: value})
    })

    mc.events.on('categories.suggest', async (value) => {
        return await suggest('categories.suggest', {q: value})
    })

    mc.events.on('sources.suggest', async (value) => {
        return await suggest('sources.suggest', {q: value})
    })

    mc.events.on('webmasters.suggest', async (value) => {
        return await suggest('users.suggest', {q: value, role: 'webmaster'}, function (item) {
            return {
                option: item.name + ' ' + item.surname + ' (' + item.email + ') - ' + item.status,
                value: item.id
            }
        })
    })

    mc.events.on('merchants.suggest', async (value) => {
        return await suggest('users.suggest', {q: value, role: 'merchant'}, function (item) {
            return {
                option: item.name + ' ' + item.surname + ' (' + item.email + ') - ' + item.status,
                value: item.id
            }
        })
    })

    mc.events.on('user.suggest', async (value) => {
        return await suggest('users.suggest', {q: value}, function (item) {
            return {
                option: item.name + ' ' + item.surname + ' (' + item.email + ') - ' + item.status,
                value: item.id
            }
        })
    })

    mc.events.on('projects.tags.suggest', async (value) => {
        return await suggest('projects.tags.suggest', {
            tag: value,
            status: 'active',
            project_id: mc.storage.get('project_id')
        }, function (item) {
            return {
                option: item.tag,
                value: item.id
            }
        })
    })

});
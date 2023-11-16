define(function () {
    function makeTree(ivr, nodes, pid) {

        for (let i in nodes[pid]) {
            ivr.nodes[i] = nodes[pid][i]
            if (nodes[i]) {
                ivr.nodes[i].childs = makeTree(ivr, nodes, i)
            }
        }

        return nodes[pid]
    }

    function settingsPrepare(node) {
        let filters = {}
        let actions = {}
        if (node.filters.length) {
            node.filters.forEach((filter, i) => {
                filter.id = node.id * 10000 + i
                filters[filter.id] = filter
            })
        }

        if (node.actions.length) {
            node.actions.forEach((action, i) => {
                action.id = node.id * 10000 + i
                actions[action.id] = action
            })
        }

        node.filters = {...filters}
        node.actions = {...actions}
        return node
    }

    return {
        toView: function (ivr) {
            ivr = JSON.parse(JSON.stringify(ivr))
            let nodes = {}
            ivr.last_id = 0;
            if (ivr.nodes.length) {
                ivr.nodes.forEach((node) => {
                    if (!nodes[node.pid]) {
                        nodes[node.pid] = {}
                    }
                    if (ivr.last_id < node.id) {
                        ivr.last_id = node.id
                    }

                    node = settingsPrepare(node)

                    nodes[node.pid][node.id] = node
                })
            }
            ivr.nodes = {}
            ivr.nodes = makeTree(ivr, nodes, 0)
            return ivr
        },
        toStorage: function (ivr) {
            ivr = JSON.parse(JSON.stringify(ivr))
            let nodes = {}
            if (ivr.nodes.length) {
                ivr.nodes.forEach((node) => {
                    node = settingsPrepare(node)
                    nodes[node.id] = node
                })
                ivr.nodes = nodes
            } else {
                ivr.nodes = []
            }
            return ivr
        },
        toSave: function (ivr) {
            ivr = JSON.parse(JSON.stringify(ivr))

            let nodes = []

            for (let id in ivr.nodes) {
                if (+id) {
                    let node = ivr.nodes[id]

                    let filters = []
                    let actions = []

                    if (Object.keys(node.filters).length) {
                        for (let filter_id in node.filters) {
                            let filter = node.filters[filter_id]
                            delete filter.id
                            filters.push(filter)
                        }
                    }

                    if (Object.keys(node.actions).length) {
                        for (let action_id in node.actions) {
                            let action = node.actions[action_id]
                            delete action.id
                            actions.push(action)
                        }
                    }
                    node.filters = filters
                    node.actions = actions
                    nodes.push(node)
                }
            }
            ivr.nodes = nodes
            delete ivr.mode
            return ivr
        }
    }
})
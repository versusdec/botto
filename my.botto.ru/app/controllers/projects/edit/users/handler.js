define(['microcore', 'mst!projects/edit/users/item', 'mst!projects/edit/users/grants', "/app/modules/popup", "/app/modules/notify", "/app/modules/confirm"], function (mc, item_view, grants, popup, notify, confirm) {

    const ID = () => {
        return '_' + Math.random().toString(36).substr(2, 9);
    };

    let project, _users;

    mc.events.on("projects.users.add", async function (data) {
        let permissions = await require(['json!/app/controllers/projects/edit/users/grants'])
        data.grants = permissions[0];
        data.tempID = ID();
        mc.events.push("projects.users.grants", data).then(() => {
            mc.events.push("projects.users.grants.update")
        });
        $('#invite input').val('')
        $('#invite button')[0].disabled = true
    });

    mc.events.on("projects.users.grants.update", (user) => {
        $('[type=checkbox]').removeAttr('checked');
        $('[type=checkbox]:not([value=access])').attr('disabled', 'disabled');
        if (user) {
            user.grants.communications.forEach(e => {
                e.grants.forEach(g => {
                    $(`[data-section=${e.section}]`).find(`[value="${g}"]`)[0].checked = true;
                    if (g === 'access')
                        $(`[data-section=${e.section}] input`).removeAttr('disabled')
                });
            })
        }
    });

    mc.events.on("projects.users.edit", async function ({id, tempID, btn}) {
        let permissions = await require(['json!/app/controllers/projects/edit/users/grants']);
        let grants_data = {};
        let data = {
            grants: permissions[0]
        };
        if (+id) {
            grants_data = _users[+id] ? _users[+id]
              : await mc.api.call('projects.users.get', {
                  project_id: project.id,
                  user_id: +id
              });
            data.id = grants_data.id
            data.email = grants_data.email;
        } else {
            grants_data = _users[tempID];
            data.tempID = grants_data.tempID;
            data.email = grants_data.email;
        }

        mc.events.push("projects.users.grants", data).then(() => {
            mc.events.push("projects.users.grants.update", grants_data)
        });
    });

    mc.events.on("projects.users.grants", async function (data) {
        popup(grants, data).then(function (grants_popup) {
            $(grants_popup).find('input[type=checkbox][value=access]').on('change', function (e, d) {
                if (e.target.checked) {
                    $(e.target).closest('tr').find('input[type=checkbox]').removeAttr('disabled')
                } else {
                    $(e.target).closest('tr').find('input[type=checkbox]').attr('disabled', 'disabled')
                    $(e.target).removeAttr('disabled')
                }
            });

            $(grants_popup).find('button').on('click', async function () {
                data.grants = {};
                $(grants_popup).find('input[type=checkbox]').each(function (index, e) {
                    let app = $(e).closest('table').attr('data-app');
                    if (e.checked) {
                        if (!data.grants[app])
                            data.grants[app] = [];
                        let section = $(e).closest('[data-section]').attr('data-section');
                        if (data.grants[app].find(x => x.section === section)) {
                            data.grants[app].find(x => {
                                if (x.section === section) {
                                    x.grants.push(e.value)
                                }
                            })
                        } else {
                            let s = {
                                section: section,
                                grants: []
                            };
                            s.grants.push(e.value);
                            data.grants[app].push(s)
                        }
                    }
                });

                if (data.id) {
                    data.user_id = data.id
                }

                _users[data.id ? data.id : data.tempID] = data;

                if ($('#users .loader').length) {
                    $('#users .loader').closest('td').remove();
                }
                $(`#users tbody [data-id="${data.id ? data.id : data.tempID}"]`).remove();
                if (!$('#users tbody tr').length) {
                    $('#users tbody').append('<tr></tr>')
                }
                console.log(data);
                $('#users tbody tr').before(await item_view(data));
                $(grants_popup).remove();
            })
        })
    });

    mc.events.on('projects.users.remove', ({id, tempID, btn}) => {
        confirm(mc.i18n('projects.edit.tabs.users.confirm'), '', () => {
            if (+id) {
                _users[+id] = {
                    delete: true,
                    user_id: +id
                }
            } else
                delete _users[tempID];
            $(btn).closest('tr').remove()
        })
    });

    mc.events.on("projects.users.list", function () {
        mc.api.call("projects.users.list", {
            project_id: project.id
        }).then(async function (project_users) {
            if (project_users.items) {
                $('#users table > tbody').html('')
                for (let i in project_users.items) {
                    let item = project_users.items[i]
                    $('#users table > tbody').append(await item_view(item))
                }
            } else {
                $('#users table > tbody .loader').text(mc.i18n('table.empty'))
            }
        })

    });

    return function ($scope, $params) {
        project = mc.storage.get('project')
        const email_validator = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        mc.storage.set('project.users', {})
        _users = mc.storage.get('project.users')

        $($scope).find('#users input[type=email]').on('keyup', function () {
            let is_valid = false;
            if (this.value !== '') {
                if (email_validator.test(this.value)) {
                    is_valid = true
                } else {
                    $(this).addClass('error')
                }
            } else {
                $(this).removeClass('error')
            }
            if (is_valid) {
                $(this).removeClass('error');
                $(this).closest('div').find('button').removeAttr('disabled')
            } else {
                $(this).closest('div').find('button').attr('disabled', 'disabled')
            }
        });
        if (project.id)
            mc.events.push('projects.users.list')
        else
            $($scope).find('.loader').text(mc.i18n('table.empty'))
    }
});
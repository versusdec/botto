define(['microcore'], (mc) => {
    return value => value !== undefined ? mc.i18n(`status.${value}`) || value : ''
})
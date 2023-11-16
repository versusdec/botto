define(['microcore'], (mc) => {
    return (value) => {
        if (value) {
            value = '+' + value.toString();
            if (value.length >= 11) {
                let data = '+';
                let codes = mc.storage.get('phone_codes')
                let masks = [];
                let notFound = true;
                let i = 4;
                let chars = 0;

                do {
                    codes.find(code => {
                        if (code.mask.includes(value.substr(0, i))) {
                            masks.push(code.mask)
                        }
                    })
                    if (masks.length) {
                        notFound = false
                    } else
                        i--
                } while (notFound)

                for (let i = 1; i < masks[0].length; i++) {
                    if (isNaN(masks[0][i]) || masks[0][i] === ' ') {
                        // console.log(masks[0][i] + ' - ' + i)
                        data += masks[0][i]
                        chars++;
                    } else {
                        data += value[i - chars]
                    }
                }
                /*let data = '+' + value.substr(0, 1) + ' (' + value.substr(1, 3) + ') '
                  + value.substr(4, 3) + ' - '
                  + value.substr(7, 2) + ' - '
                  + value.substr(9, 2)*/

                return data.length > 10 ? data : value
            }
        }
    }
})
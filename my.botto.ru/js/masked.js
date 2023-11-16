define("masked", ['microcore'], async function (mc) {
  "use strict"
  let mask = '+9 (999) 999 - 99 - 99';

  String.prototype.isSymbol = function () {
    return !!this.match(/(?![Ã])(?![Á])[_\W]/)
  }

  String.prototype.isLowerCaseLetter = function () {
    return !!this.match(/[a-z]/)
  }

  String.prototype.isUpperCaseLetter = function () {
    return !!this.match(/[A-Z]/)
  }

  String.prototype.isLetter = function () {
    return !!this.match(/[a-z\A-Z]/)
  }

  function _getMaskFields() {
    return Array.from(document.querySelectorAll('input[type="tel"]'))
  }

  function _getMasks(maskFields) {
    return maskFields.map(input => input.getAttribute("mask"))
  }

  function _shouldThisInvalidDigitBeHere(digit) {
    return digit === mask
  }

  let maskFields = _getMaskFields()
  let masks = _getMasks(maskFields)
  _setupMaskEvents(maskFields, masks)

// Rebuilding a mask if you change the mask attr dynamically
  function rebuildMasks() {
    maskFields = _getMaskFields()
    masks = _getMasks(maskFields)
    _setupMaskEvents(maskFields, masks)
  }

// Constructor function

  async function _setupMaskEvents(maskFields) {
    let codes = mc.storage.get('phone_codes')
    let masks = [];

    function validate(field) {
      mask = masks[0];
      _fullyValidateChange(field)
    }

    function _getMask(field, value, key) {
      if (value.length) {
        if (value.substr(0, 1) !== '+')
          value = '+' + value
        let temp = [];
        codes.find(code => {
          if (code.mask.includes(value)) {
            temp.push(code.mask)
          }
        })
        if (temp.length) {
          masks = temp
          // console.log(masks);
        } else {
          validate(field)
        }
      } else {
        // mask = '+9 (999) 999 - 99 - 99';
        // rebuildMasks()
      }
    }

    maskFields.forEach((field, index) => {
      field.addEventListener('input', (event) => {
        switch (event.inputType) {
          case "deleteContentForward":
            _validateBackspaceButton(field, "delete")
            break

          case "deleteContentBackward":
            _validateBackspaceButton(field)
            break

          case "insertFromDrop":
            _fullyValidateChange(field, event)
            break;
        }
      })

      field.addEventListener('keyup', (event) => _getMask(field, field.value, event.key));
      // field.addEventListener('keyup', (event) => _fullyValidateChange(field, event));
      // field.addEventListener('keypress', (event) => _validateMask(field, event));
      // field.addEventListener('change', (event) => _fullyValidateChange(field, event));
      // field.addEventListener('paste', (event) => _onAfterPaste(event))
    })
  }

  function _validateMask(field, event) {
    let lastDigitPosition = field.value.length
    let splitMask = mask.split('')

    try {
      if (!_validateDigit(splitMask, lastDigitPosition, event.key, field))
        event.preventDefault()
    } catch (e) {
      event.preventDefault()
    }
  }

  function _fullyValidateChange(field, event) {

    _addSymbols(field)
    fullyValidateMask(field, event)
  }

  function fullyValidateMask(field, event) {
    let validatedMask = ''
    let finalSymbols = _getFinalMaskSymbols(mask)

    try {

      field.value.split('').forEach((digit, index) => {

        if (_validateDigit(mask.split(''), index, digit, field, true))
          return validatedMask = validatedMask.concat(digit)

        if (_shouldThisInvalidDigitBeHere(digit, mask[index]))
          return validatedMask = validatedMask.concat(digit)

        // throw 'invalid input'

      })

    } catch (e) {
      // console.log(e)
      return field.value = validatedMask + finalSymbols.join('')
    }
  }

// Function used to catch any symbols a mask might have at the end (such as AAA---)
  function _getFinalMaskSymbols() {
    let finalSymbols = []
    let reverseSplitMask = mask.split('').reverse()
    try {
      reverseSplitMask.forEach(digit => {
        if (digit.isSymbol()) finalSymbols.push(digit)
        else throw "Reached a non-symbolic value"
      })
    } catch (e) {
    }
    return finalSymbols
  }

// Will add every symbol the mask should have
  function _addSymbols(field) {
    if (field.value.length == 0) return field.value
    let splitMask = mask.split('')
    let splitValue = field.value.split('')

    try {
      splitMask.forEach((digit, index) => {
        if (index > splitValue.length) throw "mask is bigger than input value"
        if (digit.isSymbol() && splitValue[index] != digit)
          splitValue = _insertSymbol(splitValue.join(''), index, digit).split('')
      })
    } catch (e) {
    }
    field.value = splitValue.join('')
  }

// Function used to insert symbol at specific position
  function _insertSymbol(fieldValue, index, symbol) {
    let splitValue = fieldValue.split('')
    let firstHalf = fieldValue.substr(0, index)
    let secondHalf = splitValue.splice(index).join('')
    return firstHalf + symbol + secondHalf
  }

//Function to make backspace unable to delete a symbol at the middle of the field
  function _validateBackspaceButton(field, deletionType = "backspace") {
    /*let caretPosition = _getCaretPos(field)
    let deletedCharacter = mask[caretPosition]
    if (deletedCharacter.isSymbol() && field.value.split('')[caretPosition]) {
      field.value = _insertSymbol(field.value, caretPosition, deletedCharacter)

      switch (deletionType) {
        case "backspace":
          _setCaretPosition(field, caretPosition)
          break

        case "delete":
          _setCaretPosition(field, caretPosition + 1)
          break
      }

    }*/
  }

// Will validate a specific digit of the mask
  function _validateDigit(splitMask, lastDigitPosition, key, field, isFullValidation = false) {
    let digitMask = splitMask[lastDigitPosition]
    if (key === ' ')
      return false
    if (digitMask.isSymbol()) {
      if (!isFullValidation) {
        field.value = _concatSymbols(field, splitMask, lastDigitPosition)
        return _validateDigit(splitMask, field.value.length, key, field)
      }
      return _validateDigit(splitMask, (lastDigitPosition + 1), key, field, true)
    }

    if (+digitMask || digitMask == "0")
      return _numericValidation(digitMask, key, field)

    if (digitMask.isUpperCaseLetter() && key.isUpperCaseLetter())
      return true

    if (digitMask.isLowerCaseLetter() && key.isLowerCaseLetter())
      return true

    if (digitMask == "Á" && key.isLetter())
      return true

    if (digitMask == "Ã")
      return true

  }

  function _concatSymbols(field, splitMask, lastDigitPosition) {
    let symbols = ''
    for (let i = lastDigitPosition; i < splitMask.length; i++)
      if (splitMask[i].isSymbol()) symbols = symbols.concat(splitMask[i])
      else break

    return field.value.concat(symbols)
  }

  function _setCaretPosition(field, caretPos) {
    if (field.createTextRange) {
      let range = field.createTextRange()
      range.move('character', caretPos)
      range.select()
    } else if (field.selectionStart) {
      field.focus()
      field.setSelectionRange(caretPos, caretPos)
    } else field.focus()
  }

  function _getCaretPos(field) {
    let range, bookmark, caret_pos
    if (document.selection && document.selection.createRange) {
      range = document.selection.createRange()
      bookmark = range.getBookmark()
      caret_pos = bookmark.charCodeAt(2) - 2
    } else if (field.setSelectionRange)
      caret_pos = field.selectionStart

    return caret_pos
  }

  function _numericValidation(digitMask, key, field) {
    if (field.hasAttribute("inverted-numbers"))
      if (+key >= digitMask)
        return true
      else return false

    else if (+key <= digitMask)
      return true

    else return false
  }

  function _onAfterPaste(event) {
    if (!field.hasAttribute("blockpasting")) {
      field.value = field.value + (event.clipboardData || window.clipboardData).getData('text')
      _fullyValidateChange(field, mask, event)
    }
    event.preventDefault()
  }

  return rebuildMasks;
})
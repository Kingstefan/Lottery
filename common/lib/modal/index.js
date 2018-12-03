import Tip from './tip'

window.MsgBox = {
    tip(msg) {
        const instance = new Tip(msg)

        return instance.show(msg)
    },
    alert(msg) {
        alert(msg)
    },
    confirm(msg) {
        confirm(msg)
    }
}

export default window.MsgBox

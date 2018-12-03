import './index.scss'

const CMP_NAME = 'tip.modal.cmp'
const CMP_CLASS = 'cmp-modal-tip'
const CMP_SELECTOR = `.${CMP_CLASS}`

const template = (message = '') => {
    return `
        <div class="${CMP_CLASS}">
            <div class="cmp-tip-content">
                <span>${message}</span>
            </div>    
        </div> 
    `
}

class Tip {
    constructor(props) {

    }

    ready(message){
        if($(CMP_SELECTOR).length === 0){
            $(document.body).append(template(message))
        } else {
            $(CMP_SELECTOR).find('.cmp-tip-content span').text(message)
        }

        this.$tipContainer = $(CMP_SELECTOR)
    }

    hide(){
        this.$tipContainer.fadeOut(150)
    }

    show(message){
        let timerId

        this.ready(message)
        this.$tipContainer.fadeIn(150)

        timerId = setTimeout(() => {
           this.hide()
        }, 1200)

        return () => {
            window.clearTimeout(timerId)
        }
    }

    destory(){
        this.$tipContainer.remove()
    }
}

export default Tip

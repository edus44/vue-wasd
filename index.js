
import keycode from 'keycode'
import EventEmitter from 'eventemitter3'

/**
 * Wasd Mixin to listen to lifecycle hooks
 * @type {Object}
 */
const wasdMixin = {

    /**
     * Initialize events preset at $options.wasd
     * @return {void}
     */
    created(){
        if (typeof this.$options.wasd == 'object'){
            for(let evName in this.$options.wasd){
                this.$wasd(evName,this.$options.wasd[evName])
            }
        }
    },

    /**
     * Remove listeners saved in _wasdListeners
     * @return {void}
     */
    beforeDestroy(){
        if (this._wasdListeners && this._wasdListeners.length){
            for(let i in this._wasdListeners){
                this._wasdBus.removeListener(this._wasdListeners[i][0],this._wasdListeners[i][1])
            }
        }
    }
}

/**
 * Listen to specific key event and
 * save the listener for latter removing
 * 
 * @param  {String}   evName Key event name with optional suffix (~Press or ~Release)
 * @param  {Function} fn     Bound function, context is forced to vm
 * @return {void}
 */
function wasdBind(evName,fn){
    fn = fn.bind(this)
    this._wasdBus.on(evName,fn)

    if (!this._wasdListeners) this._wasdListeners = []

    this._wasdListeners.push([evName,fn])
}


/**
 * Start listening to window key events
 * @param  {EventEmitter} bus
 * @return {void}
 */
function attachGlobalListener(bus){
    let pressed = {}

    window.addEventListener('keydown',(e)=>{
        let k = keycode(e.keyCode)
        bus.emit(k+'')
        if (!pressed[k]){
            pressed[k] = Date.now()
            bus.emit(k+'Press')
        }
    })
    
    window.addEventListener('keyup',(e)=>{
        let k = keycode(e.keyCode)
        bus.emit(k+'Release',Date.now()-pressed[k])
        delete pressed[k]
    })
}

/**
 * Plugin install
 * @param  {Vue} Vue 
 * @return {void}
 */
export default Vue => {

    // Avoid multiple installs
    if (Vue.prototype._wasdBus) return

    Vue.prototype._wasdBus = new EventEmitter() // Internal event bus
    Vue.prototype.$wasd = wasdBind
    Vue.mixin(wasdMixin)

    attachGlobalListener(Vue.prototype._wasdBus)
}
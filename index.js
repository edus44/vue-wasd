
import keycode from 'keycode'
import EventEmitter from 'eventemitter3'

function WasdMixinFactory(bus){
    return {
        created:bindHook(bus,'on'),
        beforeDestroy:bindHook(bus,'removeListener')
    }
}

function bindHook(bus,fn){
    return function(){
        if (typeof this.$options.wasd == 'object'){
            for(let evName in this.$options.wasd){
                bus[fn](evName,this.$options.wasd[evName])
            }
        }
    }
}


export default Vue => {

    let bus = new EventEmitter()
    let pressed = {}

    Vue.mixin(WasdMixinFactory(bus))

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
/**
 * EXPERIMENTAL base component for React that is part of my "minimum viable shim" for this toy app
 *
 * At minimum I want a do-nothing base class that still let's the app work. Let's get that working first.
 *
 * This class uses a constructor trick described and illustrated at https://github.com/dgroomes/javascript-playground/blob/2ce79736bbb88f65a1fc36bd67a482d46c0d1333/src/proxied-car.js#L4
 */
class BaseComponent extends React.Component {
    constructor() {
        super();
        console.log(`[BaseComponent] Hello!`)
        let handler = {
            get: function(target, prop, receiver) {
                if (prop === "render") {
                    console.log('[BaseComponent] "render" was called. TODO instrument this')
                }
                return Reflect.get(...arguments)
            }
        }
        return new Proxy(this, handler)
    }
}

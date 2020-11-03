/**
 * EXPERIMENTAL base component for React that is part of my "minimum viable shim" for this toy app
 *
 * At minimum I want a do-nothing base class that still let's the app work. Let's get that working first.
 *
 * This class uses a constructor trick described and illustrated at https://github.com/dgroomes/javascript-playground/blob/2ce79736bbb88f65a1fc36bd67a482d46c0d1333/src/proxied-car.js#L4
 *
 * Can we also re-assign React.Component to this so that our app's components don't even have to change their "class ... extends"
 * to use this and can just continue to use React.Component?
 */
class BaseComponent extends React.Component {
    constructor() {
        super();
        console.log(`[BaseComponent] Hello!`)
        let renderInvocationCount = 0
        let handler = {
            get: function(target, prop, receiver) {
                if (prop === "render") {
                    let targetType = target.constructor.name
                    renderInvocationCount++
                    console.log(`[BaseComponent/${targetType}] "render" was called (${renderInvocationCount}). TODO instrument this`)
                }
                return Reflect.get(...arguments)
            }
        }
        return new Proxy(this, handler)
    }
}

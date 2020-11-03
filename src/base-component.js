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
        let renderAccessCount = 0
        let renderInvocationCount = 0
        let handler = {
            get: function(target, prop, receiver) {
                let resolvedProp = Reflect.get(...arguments)
                if (prop === "render") {
                    let targetType = target.constructor.name
                    console.log(`[BaseComponent/${targetType}] "render" was accessed (${renderAccessCount}).`)
                    return function instrumentedRender() {
                        console.log(`[BaseComponent/${targetType}] "instrumentedRender" was invoked (${renderInvocationCount}). TODO instrument this`)
                        renderInvocationCount++
                        return resolvedProp.bind(receiver)(...arguments) // whoa! this is some out-of-control framework code!
                    }
                } else {
                    return resolvedProp
                }

            }
        }
        return new Proxy(this, handler)
    }
}

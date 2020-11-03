/**
 * Base component for React that is part of my "minimum viable shim" for this toy app
 *
 * This class uses a constructor trick described and illustrated at https://github.com/dgroomes/javascript-playground/blob/2ce79736bbb88f65a1fc36bd67a482d46c0d1333/src/proxied-car.js#L4
 *
 * TODO Can we also re-assign React.Component to this so that our app's components don't even have to change their "class ... extends"
 * to use this and can just continue to use React.Component?
 *
 * TODO push the calls to "tetherComponents" into this base class instead of in the component classes themselves via `componentDidUpdate`
 */
class BaseComponent extends React.Component {
    constructor() {
        super();
        console.log(`[BaseComponent] Hello!`)
        let renderAccessCount = 0
        let renderInvocationCount = 0
        let metaData = {
            type: this.constructor.name,
            hasRendered: false,
            hasTethered: false
        }

        let handler = {
            get: function(target, prop, receiver) {
                let resolvedProp = Reflect.get(...arguments)
                if (prop === "render") {
                    let targetType = target.constructor.name
                    renderAccessCount++
                    console.log(`[BaseComponent/${targetType}] "render" was accessed (${renderAccessCount}).`)
                    return function instrumentedRender() {
                        renderInvocationCount++
                        let preamble = `[BaseComponent/${targetType}]`
                        console.log(`${preamble}: "instrumentedRender" was invoked (${renderInvocationCount}). TODO instrument this`)
                        let result = resolvedProp.bind(receiver)(...arguments) // whoa! this is some out-of-control framework code!
                        metaData.hasRendered = true
                        console.log(`${preamble}: "render" completed`)
                        return result
                    }
                } else {
                    return resolvedProp
                }
            }
        }

        let proxy = new Proxy(this, handler);
        window.reactComponents.set(proxy, metaData)
        return proxy
    }
}

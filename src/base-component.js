/**
 * This is a base component for React that is part of my "minimum viable shim" for this toy app. This class does the
 * following:
 *
 * 1) This class initializes a meta data reference available globally via `window.reactComponents`. This meta data is used
 *    in the shim's lifecycle-related logic.
 * 2) This class instruments sub-classes to automatically call "tetherElements" when either of these React lifecycle
 *    methods are called on the component: "componentDidUpdate", "componentDidMount". It does this by using a constructor
 *    trick described and illustrated at https://github.com/dgroomes/javascript-playground/blob/2ce79736bbb88f65a1fc36bd67a482d46c0d1333/src/proxied-car.js#L4
 *    and using a Proxy to instrument the target property with a pointcut/aspect around it.
 */
class BaseComponent extends React.Component {
    constructor() {
        super();

        let metaData = {
            type: this.constructor.name,
            hasTethered: false
        }

        let handler = {
            get: function (target, prop, receiver) {
                let targetType = target.constructor.name
                let preamble = `[BaseComponent/${targetType}]: `

                let resolvedProp = Reflect.get(...arguments)

                if (["componentDidUpdate", "componentDidMount"].includes(prop)) {
                    console.log(`${preamble}"${prop}" was accessed. Instrumenting a pointcut/aspect around it`)
                    return function instrumented() {
                        console.log(`${preamble}an instrumented version of "${prop}" was invoked.`)
                        tetherElements(receiver)

                        if (resolvedProp !== undefined) {
                            return resolvedProp.bind(receiver)(...arguments)  // whoa! this is some out-of-control framework code!
                        } else {
                            return undefined
                        }
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

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

        /**
         * The methods that we want to instrument on the underlying React.Component parent class.
         * The key is the method name. The value is a boolean indicating whether or not to call "tetherElements"
         * before invoking the method.
         */
        let instrumentedMethods = {
            componentDidUpdate: true,
            componentDidMount: true,
            render: false
        }

        let handler = {
            get: function (target, prop, receiver) {
                let targetType = target.constructor.name
                let typePreamble = targetType
                let typePreambleId = addLogPreamble(targetType)

                let resolvedProp = Reflect.get(...arguments)

                let result
                if (instrumentedMethods.hasOwnProperty(prop)) {
                    let shouldTether = instrumentedMethods[prop]
                    myLogDebug(`"${prop}" was accessed. Instrumenting a pointcut/aspect around it`)

                    result = function instrumented() {
                        let typePreambleId = addLogPreamble(typePreamble)
                        let propPreambleId = addLogPreamble(prop)
                        myLogDebug(`an instrumented version of "${prop}" was invoked.`)

                        if (shouldTether) {
                            tetherElements(receiver)
                        }

                        let result
                        if (resolvedProp !== undefined) {
                            result = resolvedProp.bind(receiver)(...arguments)  // whoa! this is some out-of-control framework code!
                        } else {
                            result = undefined
                        }
                        removeLogPreamble(propPreambleId)
                        removeLogPreamble(typePreambleId)
                        return result
                    }
                } else {
                    result = resolvedProp
                }

                removeLogPreamble(typePreambleId)
                return result
            }
        }

        let proxy = new Proxy(this, handler);
        window.reactComponents.set(proxy, metaData)
        return proxy
    }
}

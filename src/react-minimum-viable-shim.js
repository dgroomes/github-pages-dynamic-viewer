// WORK IN PROGRESS
//
// This is the minimum viable shim code I need to re-implement the React API. What makes this a "minimum viable shim" is
// that I only need to re-implement enough of the React API so that my app can work. Because it is a toy app, it only
// uses a small part of React's features, and so I can omit all of those features in the shim's implementation. In other
// words, this shim is designed only for my own use case and is *not re-usable* by any other project. It is an exercise
// for my own learning and it does serve as a working example of how to factor out a library dependency in a
// non-invasive way to an existing codebase.

/*
 * ID generator for tracking React-created and manually-created (or, "my-created") elements.
 */
window.reactCreatedElementId = 0
window.myCreatedElementId = 0
/*
 * Groups of elements tracked in this variable will be tethered to the DOM after the React lifecycle is done. This is a
 * bridging mechanism between React and the frameworky vanilla JS written in this shim.
 */
window.untetheredElements = []
/*
 * Keeping track of metadata across all React components globally
 */
window.reactComponents = new Map()

// Re-define React.createElement
// Facade the original implementation with our own myCreateElement function
let originalReactCreateElement = React.createElement
myLog(`Re-assigning the React.createElement to a custom facade`)
React.createElement = myCreateElement

/**
 * Create an HTML element. This is a facade to React.createElement in some cases and in other cases will use vanilla JS
 * to create the element using the DOM APIs and my own frameworky JS code. Eventually all React code will be
 * removed and it will be pure vanilla JS.
 *
 * Referenced material:
 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters
 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
 * - https://indepth.dev/inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react/
 * - https://stackoverflow.com/a/39165137
 *
 * This is a work-in-progress effort. For some elements, this method uses React to create the element, but for other
 * elements it will use my own frameworky JS code to create an "untethered" element and attach it to a parent element
 * via a callback that gets executed after React is done with its lifecycle. Why so complicated? It's complicated because
 * I am trying to implement this with the constraint that the source code of the `SourceBrowser` class can remain
 * untouched (as much as feasible). In other words, this is a proof-of-concept to show how you might execute a gradual
 * refactoring of a medium to large React application to *gradually remove all React code*. The only code change that is
 * needed in the application's custom components is to replace the `extends React.Component` with `extends BaseComponent`.
 * In a perfect world, even that would not be necessary, but I don't know how to get around it.
 *
 * Cases supported: anchor tags (`<a>`), list item tags (`<li>`), unordered list tags (`<ul>`) and partial support for
 * content division tags (`<div>`)
 *
 * @return either the React-created element or the vanilla JS-created element
 */
function myCreateElement(tagName, options, ...otherArgs) {
    let tagNameToString = typeof tagName === 'function' ? `(function) ${tagName.name}` : tagName
    let tagPreamble = `myCreateElement:${tagNameToString}`;
    let elId = options?.id
    if (elId !== undefined) {
        tagPreamble += ":" + elId
    }
    let myCreateElementPreambleId = addLogPreamble(tagPreamble)
    let useReact = true
    let el
    if (tagName === 'a') {
        useReact = false
        let href = options.href;
        el = document.createElement('a')
        el.href = href;
    }

    // Now we're getting more complicated than when we just had to deal with the 'a' tag. The 'a' element is a
    // "leaf node" and will not have elements inside of it (at least, in the case of this app). But, the 'li' element
    // will have elements inside of it (again, in the case of this app) so we have to coordinate the creation and
    // appending of the 'li' element's child elements with the creation and appending of the 'li' element itself. I'm
    // getting confused!
    if (tagName === 'li') {
        useReact = false
        el = document.createElement('li');
    }

    if (tagName === 'ul') {
        useReact = false
        el = document.createElement('ul')
    }

    // NOT FULLY IMPLEMENTED
    //
    // Now, onto the really hard one, the 'div' tag! The div tag is so generic: it can be inside of other elements and
    // it can contain its own arbitrarily large collection of child elements. It's not as closed-loop as 'a' and 'li'.
    //
    // How do we possibly do this? Well, let's cheat and isolate the creation of 'div' tags to only those that opt-in.
    // We will look for the field 'opt-in' in the 'options' argument.
    if (tagName === 'div' && options !== null && options["opt-in"]) {
        useReact = false
        el = document.createElement('div')
    }

    // The common code for the attaching of elements created *without* React.
    //
    // This code needs to be updated and fully made to use the new "return value based parent/child association" mechanism
    if (!useReact) {
        let myCreatedElementId = window.myCreatedElementId
        window.myCreatedElementId++
        el.setAttribute("data-my-created-element-id", myCreatedElementId)
        let idPreambleId = addLogPreamble(`myCreatedElementId=${myCreatedElementId}`)
        myLog("Created element *without* React.")

        // Adorn the created element with additional attributes defined in 'options'
        if (options?.id) el.id = options.id

        if (otherArgs.length > 0) {
            myLog(`Detected that this is a parent node (${tagName}). Tethering the child elements now.`)
            // If any of the child elements are actually an array of elements, then they need to be flattened
            let children = otherArgs.flat()
            for (let i = 0; i < children.length; i++) {
                let child = children[i]
                // We want to tether any children elements (specified by the "otherArgs" argument) to this element but we
                // are unable to tether React elements because React elements aren't real elements yet. I don't think this
                // toy app has this problem as of right now, but I will write some explicit warning logging to help me in
                // the future if I run into this problem.
                if (React.isValidElement(child)) {
                    myLogWarn(`Detected a React element while executing the tethering process. React elements can't be attached to DOM as is. Skipping it. (TODO enhance the tethering process to accommodate React elements).`)
                } else {
                    if (child instanceof Node) {
                        el.appendChild(child)
                    } else {
                        el.innerText += child
                    }
                }
            }
        }
        removeLogPreamble(idPreambleId)
        removeLogPreamble(myCreateElementPreambleId)
        return el
    }

    if (options == null) {
        options = {}
    }
    let reactCreatedElementId = window.reactCreatedElementId
    window.reactCreatedElementId++
    let idPreambleId = addLogPreamble(`reactCreatedElementId=${reactCreatedElementId}`)
    myLog(`Creating an element using React.`)
    options['data-react-created-element-id'] = reactCreatedElementId

    // Intercept any incoming "otherArgs" that are illegal arguments to `React.createElement`. Record them as untethered
    // elements so that they will be later tethered to the DOM.
    let legalArgs = []
    let untetheredElements = []

    function isLegalNonArrayElement(arg) {
        return typeof arg === "string" || React.isValidElement(arg)
    }

    for (let i = 0; i < otherArgs.length; i++) {
        let arg = otherArgs[i]
        if (arg.constructor === Array) {
            let nestedLegalArgs = []
            let nestedUntetheredElements = []
            arg.forEach(nestedArg => {
                if (isLegalNonArrayElement(nestedArg)) {
                    nestedLegalArgs.push(nestedArg)
                } else {
                    myLog(`Detected illegal argument (${nestedArg.tagName}) within an Array in the request to 'React.createElement' for '${tagNameToString}'. Filtering it out and instead recording it as an untethered element so that it can later be tethered to this element ('${tagNameToString}') after React is done doing it's thing.`)
                    nestedUntetheredElements.push(nestedArg)
                }
            })
            if (nestedLegalArgs.length > 0) {
                legalArgs.push(nestedLegalArgs)
            }
            if (nestedUntetheredElements.length > 0) {
                untetheredElements.push(nestedUntetheredElements)
            }
        } else if (isLegalNonArrayElement(arg)) {
            legalArgs.push(arg)
        } else {
            myLog(`Detected illegal argument (${arg.tagName}) in the request to 'React.createElement' for '${tagNameToString}'. Filtering it out and instead recording it as an untethered element so that it can later be tethered to this element ('${tagNameToString}') after React is done doing it's thing.`)
            untetheredElements.push(arg)
        }
    }

    if (untetheredElements.length > 0) {
        window.untetheredElements.push({
            elements: untetheredElements,
            parentReactCreatedElementId: reactCreatedElementId
        })
    }

    removeLogPreamble(idPreambleId)
    removeLogPreamble(myCreateElementPreambleId)
    return originalReactCreateElement(tagName, options, ...legalArgs)
}

/**
 * Tether the groups of untethered elements
 */
function tetherElements(component) {
    let componentType = component.constructor.name
    let preamble = "tetherElements"
    let preambleId = addLogPreamble(preamble)

    let metaData = window.reactComponents.get(component);
    if (metaData === undefined) {
        myLogError(`Failed to find the meta data for the component`)
    } else {
        myLog(`This component's meta data: ${JSON.stringify(metaData, null, 2)}`)
        if (metaData.hasTethered) {
            myLog(`This component has already executed the tethering process. Skipping it.`)
            removeLogPreamble(preambleId)
            return
        }
    }

    if (window.untetheredElements.length === 0) {
        myLog(`There are no elements to tether`)
        removeLogPreamble(preambleId)
        return
    }

    for (let i = 0; i < window.untetheredElements.length; i++) {
        let {elements, parentReactCreatedElementId} = window.untetheredElements[i]
        myLog(`Tethering untethered elements (${elements.length})`)
        let parent = document.querySelector(`[data-react-created-element-id="${parentReactCreatedElementId}"]`)
        if (parent === null) {
            myLogError(`Something went wrong. Did not find an element for id ${parentReactCreatedElementId}. So, the untethered elements will remain untethered (sad).`)
            removeLogPreamble(preambleId)
            return;
        }

        /*
         * To handle the case where a sub-component of the component is being tethered, we must identify the
         * sub-component and identify its "hasTethered" status before tethering.
         */
        let targetComponent = findReactAncestor(parent);
        if (targetComponent === null) {
            myLogError(`Something went wrong. Did not find an ancestor React component for the given DOM element`)
            removeLogPreamble(preambleId)
            return;
        }
        let targetComponentMetaData
        if (targetComponent === component) {
            myLog(`The target component is the same as the overall component`)
            targetComponentMetaData = metaData
        } else {
            targetComponentMetaData = window.reactComponents.get(targetComponent)
        }

        if (targetComponentMetaData.hasTethered) {
            myLog(`This component has already executed the tethering process. Skipping it.`)
            continue
        }

        // If any of the untethered elements are actually an array of untethered elements, then they need to be flattened
        elements = elements.flat()

        while (elements.length > 0) {
            let child = elements.pop()
            myLog(`Tethering untethered element '${child.tagName}' to '${parent.tagName}`)
            parent.appendChild(child);
        }
    }

    // All groups of elements should have been successfully tethered to the DOM at this point. So, zero out the
    // "untethered elements" reference
    window.untetheredElements = []

    // Mark this component as initialized ("hasTethered = true")
    metaData.hasTethered = true

    removeLogPreamble(preambleId)
}

/**
 * Copied from https://stackoverflow.com/questions/29321742/react-getting-a-component-from-a-dom-element-for-debugging/39165137#39165137
 *
 * Find a React component that is an ancestor of a DOM node. It will look through parent elements  up until it finds one.
 */
function findReactAncestor(dom, traverseUp = 0) {
    const key = Object.keys(dom).find(key=>key.startsWith("__reactInternalInstance$"));
    const domFiber = dom[key];
    if (domFiber == null) return null;

    // react 16+
    const GetCompFiber = fiber=>{
        //return fiber._debugOwner; // this also works, but is __DEV__ only
        let parentFiber = fiber.return;
        while (typeof parentFiber.type == "string") {
            parentFiber = parentFiber.return;
        }
        return parentFiber;
    };
    let compFiber = GetCompFiber(domFiber);
    for (let i = 0; i < traverseUp; i++) {
        compFiber = GetCompFiber(compFiber);
    }
    return compFiber.stateNode;
}

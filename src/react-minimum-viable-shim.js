// WORK IN PROGRESS
//
// This is the minimum viable shim code I need to remove the React library from this application (or rather, this
// isn't much of an application as it is a simple web page that uses a bit of React features).

window.indexCounter = 0
window.untetheredElements = []
window.untetheredElements2 = null // these elements are designated to be tethered after the React lifecycle is done. Still, this untethered stuff needs to be consolidated more

// Re-define React.createElement
// Facade the original implementation with our own myCreateElement function
let originalReactCreateElement = React.createElement
console.log(`The original React.createElement function:\n ${originalReactCreateElement}`)
console.log(`Re-assigning the React.createElement to a custom facade`)
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
 *
 * This is a work-in-progress effort. For some elements, this method use React to create the element, but for other
 * elements it will use my own frameworky JS code to create an "untethered" element and attach it to a parent element
 * via a callback that gets executed after React is done with its lifecycle. Why so complicated? It's complicated because
 * I am trying to implement this with the constraint that the source code of the `SourceBrowser` class can remain
 * untouched (as much as feasible). In other words, this is a proof-of-concept to show how you might execute a gradual
 * refactoring of a medium to large React application to *gradually remove all React code*. Unfortunately, I did have to
 * add some code into the SourceBrowser class in its 'componentDidUpdate' function, but if I could research more I think
 * there must be some global way I could hook into React to wire in my own frameworky code, but I don't have enough time
 * to research that right now.
 *
 * Cases supported: anchor tags (`<a>`), list item tags (`<li>`)
 *
 * @return either the React-created element or the vanilla JS-created element
 */
function myCreateElement(tagName, options, ...otherArgs) {
    let useReact = true
    let isAParentNode
    let el
    if (tagName === 'a') {
        useReact = false
        isAParentNode = false
        let content = otherArgs[0];
        let href = options.href;
        console.log(`Creating an element ('a') *without* React. content='${content} href=${href}'`)
        el = document.createElement('a')
        el.href = href;
        el.innerHTML = content;
    }

    // Now we're getting more complicated than when we just had to deal with the 'a' tag. The 'a' element is a
    // "leaf node" and will not have elements inside of it (at least, in the case of this app). But, the 'li' element
    // will have elements inside of it (again, in the case of this app) so we have to coordinate the creation and
    // appending of the 'li' element's child elements with the creation and appending of the 'li' element itself. I'm
    // getting confused!
    //
    // How does the lifecycle work? Well, when the execution gets here, we have already created the 'a' element and
    // referenced it via the 'window.untetheredElement' variable. So, we have to attach the 'a' element and nullify the
    // window.untetheredElement reference. Now, the 'a' element does not need processing anymore and will be carried to
    // the DOM via it's parent 'li' element. It's hitching a free ride! Additionally we have another challenge: managing
    // how to attach a *collection* of untethered elements. After all, 'li' elements are list items and so we have to
    // attach many of them to a common shared parent element. The singular 'window.untetheredElement' mechanism won't
    // accommodate this. So, let's introduce a 'window.untetheredElements' array variable.
    if (tagName === 'li') {
        useReact = false
        isAParentNode = otherArgs.length > 0 // I think this needs to be extended to also detect that the the otherArgs are 'undefined' which would indicate that the otherArgs were originally `myCreateElement` invocations (which returns undefined). AND I think we need to keep track of "how *many* children" are there and later tether that many from the "untethered stack"
        console.log("Creating an element ('li') *without* React.")
        el = document.createElement('li');
    }

    // WORK IN PROGRESS
    if (false && tagName === 'ul') {
        useReact = false
        isAParentNode = otherArgs.length > 0 // although... by definition this is a "parent node" right? Of course when there happen to be no children than it is not a parent, but by design a "unordered list" element is supposed to contain children
        console.log("Creating an element ('ul') *without* React.")
        el = document.createElement('ul')
    }

    // Now, onto the really hard one, the 'div' tag! The div tag is so generic: it can be inside of other elements and
    // it can contain its own arbitrarily large collection of child elements. It's not as closed-loop as 'a' and 'li'.
    //
    // How do we possibly do this? Well, let's cheat and isolate the creation of 'div' tags to only those that opt-in.
    // We will look for the field 'opt-in' in the 'options' argument.
    //
    // NOT YET IMPLEMENTED. Skipping this with a 'false' check because this doesn't work yet. I need to restructure the
    // 'untethered' model so it is more consolidated and easy to understand.
    //
    // UPDATE: double woops, we should implement 'ul' defore 'div' because it is the closest ancestor to 'li'. I jumped
    // ahead on accident and didn't even realize it.
    if (false && tagName === 'div' && options !== null && options["opt-in"]) {
        useReact = true
        console.log("Creating an element ('div') *without* React.")
        el = document.createElement('div')
        if (window.untetheredElements.length > 0) {
            el.append(...window.untetheredElements)
        }
        window.untetheredElements = [el]
    }

    // The common code for the attaching of elements created *without* React.
    //
    // This code needs to be updated and fully made to use the new "return value based parent/child association" mechanism
    if (!useReact) {
        let numberOfUntetheredElements = window.untetheredElements.length;
        let untetheredElementsExist = numberOfUntetheredElements > 0;

        if (isAParentNode && untetheredElementsExist) {
            console.log(`Detected that this is a parent node (${tagName}) and that there exist untethered elements (${numberOfUntetheredElements}). Tethering the child elements now.`)
            // We want to tether any children elements (specified by the "otherArgs" argument) to this element but we
            // are unable to tether React elements because React elements aren't real elements yet. I don't think this
            // toy app has this problem as of right now, but I will write some explicit warning logging to help me in
            // the future if I run into this problem.
            for (let i = 0; i < otherArgs.length; i++) {
                let child = otherArgs[i]
                if (React.isValidElement(child)) {
                    console.warn(`Detected a React element while executing the tethering process. React elements can't be attached to DOM as is. Skipping it. (TODO enhance the tethering process to accommodate React elements).`)
                } else {
                    // First, remove the child from "untethered" list so that it won't be doubly applied later.
                    // Next, append the child
                    let idx = window.untetheredElements.indexOf(child)
                    window.untetheredElements.splice(idx, 1)
                    el.appendChild(child)
                }
            }
        } else if (isAParentNode && !untetheredElementsExist) {
            console.log(`Detected that this is a parent node (${tagName}) but did not find any untethered elements to tether to it. This can happen, for example, if the children elements are based on a piece of state that happens to be empty.`)
        } else if (!isAParentNode && untetheredElementsExist) {
            console.log(`Detected that this node  (${tagName}) is probably in a sibling hierarchy because there exist untethered elements but this is not a parent node.`) // this "if" conditional check isn't quite robust I think
        }
        window.untetheredElements.push(el)
        return el
    }

    if (options == null) {
        options = {}
    }
    let index = `${++window.indexCounter}`
    let tagNameToString = typeof tagName === 'function' ? `(function) ${tagName.name}` : tagName
    console.log(`Creating an element ('${tagNameToString}') using React. Assigning 'data-index' attribute: '${index}'`)
    options['data-index'] = index

    let untetheredElements = window.untetheredElements
    window.untetheredElements = []
    if (untetheredElements.length > 0) {
        console.log(`Recording the untethered elements (${untetheredElements.length}) to later be tethered to this element ('${tagNameToString}') after React is done doing it's thing.`)
        window.untetheredElements2 = {
            elements: untetheredElements,
            parentElementIndex: index
        }
    }

    // Intercept any incoming otherArgs that are illegal arguments to `React.createElement`. What should we do with
    // them? I don't know exactly. We'll log them for now.
    let legalArgs = []

    function isLegalNonArrayElement(arg) {
        return typeof arg === "string" || React.isValidElement(arg)
    }

    for (let i = 0; i < otherArgs.length; i++) {
        let arg = otherArgs[i]
        if (arg.constructor === Array) {
            let nestedLegalArgs = []
            arg.forEach(nestedArg => {
                if (isLegalNonArrayElement(nestedArg)) {
                    nestedLegalArgs.push(nestedArg)
                } else {
                    console.warn(`Detected illegal argument (${nestedArg.tagName}) within an Array in the request to 'React.createElement. Filtering it out.`)
                }
            })
            legalArgs.push(nestedLegalArgs)
        } else if (isLegalNonArrayElement(arg)) {
            legalArgs.push(arg)
        } else {
            console.warn(`Detected illegal argument (${arg.tagName}) in the request to 'React.createElement'. Filtering it out.`)
        }
    }
    return originalReactCreateElement(tagName, options, ...legalArgs)
}

/**
 * Tether the untethered elements
 */
function tetherElements() {
    if (window.untetheredElements2 === null) {
        console.log("There are no elements to tether")
        return
    }

    let {elements, parentElementIndex} = window.untetheredElements2
    window.untetheredElements2 = null
    console.log(`Tethering untethered elements (${elements.length})`)
    let parentEl = document.querySelector(`[data-index="${parentElementIndex}"]`)
    if (parentEl == null) {
        console.error(`Something went wrong. Did not find an element for id ${elementId}. So, the untethered elements will remain untethered (sad).`)
        return;
    }
    parentEl.innerHTML = ''; // the inner HTML often already contains content (and I don't totally know why, look at the logs) so clear it.

    while (elements.length > 0) {
        let el = elements.pop()
        console.log(`Tethering untethered element '${el.tagName}' to '${parentEl.tagName}`)
        parentEl.appendChild(el);
    }
}

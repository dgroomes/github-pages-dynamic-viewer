// WORK IN PROGRESS
//
// This is the minimum viable shim code I need to remove the React library from this application (or rather, this
// isn't much of an application as it is a simple web page that uses a bit of React features).

window.indexCounter = 0
window.untetheredElements = []
window.untetheredElements2 = null // these elements are designated to be tethered after the React lifecycle is done. Still, this untethered stuff needs to be consolidated more

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
 * UPDATE: there is a fundamental design change that needs to be made with regard to the "parent element identification".
 * Currently, this code makes the assumption that when an element is created by React, then all existing untethered
 * elements should be the children of that new React element. But this is not true. React's `createElement` method takes
 * a varargs list of React elements. So, this code actually makes the mistake of (incorrectly) identifying what should
 * be *sibling* elements as the parent element.
 */
function myCreateElement(tagName, options, ...otherArgs) {
    if (tagName === 'a') {
        let content = otherArgs[0];
        let href = options.href;
        console.log(`Creating an element ('a') *without* React. content='${content} href=${href}'`)
        let el = document.createElement('a')
        el.href = href;
        el.innerHTML = content;
        window.untetheredElements.push(el)
        return;
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
        console.log("Creating an element ('li') *without* React.")
        let el = document.createElement('li');
        let child = window.untetheredElements.pop();
        el.appendChild(child);
        window.untetheredElements.push(el)
        return;
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
        console.log("Creating an element ('div') *without* React.")
        let el = document.createElement('div')
        if (window.untetheredElements.length > 0) {
            el.append(...window.untetheredElements)
        }
        window.untetheredElements = [el]
        return;
    }

    if (options == null) {
        options = {}
    }
    let index = `${++window.indexCounter}`
    console.log(`Creating an element ('${tagName}') using React. Assigning 'data-index' attribute: '${index}'`)
    options['data-index'] = index

    let untetheredElements = window.untetheredElements
    window.untetheredElements = []
    if (untetheredElements.length > 0) {
        console.log(`Recording the untethered elements (${untetheredElements.length}) to later be tethered after React is done doing it's thing.`)
        window.untetheredElements2 = {
            elements: untetheredElements,
            parentElementIndex: index
        }
    }
    return React.createElement(tagName, options, ...otherArgs)
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
'use strict';

window.elementIdCounter = 1;
window.untetheredElement = null;
window.postReactElementCreationCallbacks = []

/**
 * Create an HTML element. This is a facade to React.createElement in some cases and in other cases will use vanilla JS
 * to create the element using the DOM APIs, callbacks and my own frameworky JS code. Eventually all React code will be
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
 * Cases supported:
 * - For requests to create anchor tags (`<a>`), the DOM API `Document.createElement` will be used
 *   in a callback that gets executed after the React application lifecycle finished
 */
function myCreateElement(tagName, options, ...otherArgs) {
    if (tagName === 'a') {
        console.log("Creating an element ('a') *without* React.")
        let el = document.createElement('a')
        el.href = options.href;
        el.innerHTML = otherArgs[0];
        window.untetheredElement = el;
        return;
    }

    if (options == null) {
        options = {}
    }
    let elementId = `globally-unique-id-${window.elementIdCounter++}`;
    console.log(`Creating an element ('${tagName}') using React. Assigning id: '${elementId}'`)
    options['id'] = elementId;
    let untetheredElement = window.untetheredElement;
    if (untetheredElement != null) {
        console.log("There is an untethered element. It should probably be tethered to the element that is being created now. So, we will register a callback to push the untethered element to this element *after* React is done doing it's thing.")
        window.postReactElementCreationCallbacks.push(() => {
            let reactCreatedElement = document.getElementById(elementId)
            if (reactCreatedElement == null) {
                console.log(`Something went wrong. Did not find an element for id ${elementId}. So, the untethered element will remain untethered (sad).`)
                return;
            }
            reactCreatedElement.innerHTML = ''; // the inner HTML often already contains content (and I don't totally know why, look at the logs) so clear it.
            reactCreatedElement.appendChild(untetheredElement);
        })
        window.untetheredElement = null;
    }
    return React.createElement(tagName, options, ...otherArgs)
}

class App extends React.PureComponent {

    constructor(props) {
        super(props);
    }

    render() {
        return myCreateElement('div', null, myCreateElement(SourceBrowser, null));
    }
}

ReactDOM.render(myCreateElement(App, null), document.getElementById("app"))
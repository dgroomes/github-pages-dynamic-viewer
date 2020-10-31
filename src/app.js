'use strict';

window.elementIdCounter = 1;

/**
 * Create an HTML element. This is a facade to React.createElement in some cases and in other cases will use vanilla JS
 * to create the element using the DOM APIs. Eventually all React code will be removed and it will be pure vanilla JS.
 *
 * I am using fancy features of JS here: "rest parameters" and the "spread" syntax. See:
 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters
 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
 *
 * This is a work-in-progress effort. For simple elements, this method will use the DOM APIs to create an element, but
 * will use React to create elements with more sophisticated requirements. Cases supported:
 * - (UPDATE: not sure if this is going to work) NOT YET IMPLEMENTED For requests to create anchor tags (`<a>`), the DOM API `Document.createElement` will be used
 *
 * UPDATE: not sure if it's going to work like I though. Here's another idea. Can we have some "recursive React DOM
 * trees and post-construct callback strategy" where we assign a unique id to all HTML (either React-created element or
 * `Document.createElement`-created or not, either way!) and then push a callback to create the DOM? And the "DOM creation"
 * callback will be generic, meanign it can be implemented in React or vanilla JS?
 */
function myCreateElement(tagName, options, ...otherArgs) {
    if (options == null) {
        options = {}
    }
    let elementId = `globally-unique-id-${window.elementIdCounter++}`;
    console.log(`Creating an element ('${tagName}') using React. Assigning id: '${elementId}'`)
    options['id'] = elementId;
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
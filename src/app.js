'use strict';

/**
 * Create an HTML element. This is just a proxy to React.createElement. Eventually, I will change out the implementation
 * detail of this method to stop using React and instead use vanilla JS.
 *
 * I am using fancy features of JS here: "rest parameters" and the "spread" syntax. See:
 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters
 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
 */
function myCreateElement(tagName, options, ...otherArgs) {
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
'use strict';

class App extends React.PureComponent {

    constructor(props) {
        super(props);
    }

    render() {
        return myCreateElement('div', null, myCreateElement(SourceBrowser, null));
    }
}

ReactDOM.render(myCreateElement(App, null), document.getElementById("app"))
class App extends React.PureComponent {

    constructor(props) {
        super(props);
    }

    render() {
        return React.createElement('div', null, React.createElement(SourceBrowser, null));
    }
}

ReactDOM.render(React.createElement(App, null), document.getElementById("app"))

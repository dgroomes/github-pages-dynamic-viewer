/**
 * A read-only view of the app's configuration.
 */
class ConfigurationListing extends BaseComponent {

    constructor(props) {
        super(props);
        this.state = {
            config: window.config
        }
        this.render = this.render.bind(this);
    }

    componentDidMount() {
        /**
         * I don't think 'componentDidMount' is quite the perfect way to execute our vanilla JS manipulate-the-dom-by-hand
         * code but it is effective. So, invoke our frameworky code to tether the untethered elements.
         *
         * This is unfortunate. Can we factor this out to a global place? Similar to what we did when we replaced the
         * definition of React.createElement?
         *
         * TODO push this into BaseComponent
         */
        tetherElements(this)
    }

    render() {
        let configurationElements = Object.entries(this.state.config).map(([key, value], _idx) => {
            let content = `${key}: ${value}`
            return React.createElement('li', { "key": key }, content)
        })

        return React.createElement('div', null,
            React.createElement('h3', null, "Configuration"),
            React.createElement('ul', null, configurationElements))
    }
}

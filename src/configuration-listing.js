/**
 * A read-only view of the app's configuration.
 */
class ConfigurationListing extends BaseComponent {

    constructor(props) {
        super(props);
        this.state = {
            config: window.config
        }
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

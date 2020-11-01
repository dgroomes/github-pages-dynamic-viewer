/**
 * A read-only view of the app's configuration.
 */
class ConfigurationListing extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            config: window.config
        }
    }

    render() {
        let configurationElements = Object.entries(window.config).map(([key, value], _idx) => {
            let content = `${key}: ${value}`
            return React.createElement('p', { "key": key }, content)
        })

        return React.createElement('div', null,
            React.createElement('h3', null, "Configuration"),
            configurationElements)
    }
}

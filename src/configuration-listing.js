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

    // EXPERIMENTAL- PROTOTYPE- only code. This shouldn't actually be used long term.
    initialized = false

    componentDidMount() {
    // componentDidUpdate() {
        if (this.initialized) {
            console.warn(`[ConfigurationListing] was already initialized. Will not tether elements again`)
        } else {
            console.log('[ConfigurationListing] tethering elements')
            tetherElements()
            this.initialized = true
        }
    }

    render() {
        let configurationElements = Object.entries(window.config).map(([key, value], _idx) => {
            let content = `${key}: ${value}`
            return React.createElement('li', { "key": key }, content)
        })

        return React.createElement('div', null,
            React.createElement('h3', null, "Configuration"),
            React.createElement('ul', null, configurationElements))
    }
}

/**
 * This is a base component for React that is part of my "minimum viable shim" for this toy app.
 *
 * This class initializes a meta data reference available globally via `window.reactComponents`. This meta data is used
 * in the shim's lifecycle-related logic.
 */
class BaseComponent extends React.Component {
    constructor() {
        super();

        let metaData = {
            type: this.constructor.name,
            hasTethered: false
        }
        window.reactComponents.set(this, metaData)
    }
}

/**
 * This is a base component for React that is part of my "minimum viable shim" for this toy app.
 *
 * This class initializes a meta data reference available globally via `window.reactComponents`. This meta data is used
 * in the shim's lifecycle-related logic.
 *
 * TODO Can we re-assign React.Component to this so that our app's components don't even have to change their "class ... extends"
 *   to use this and can just continue to use React.Component?
 *
 * TODO push the calls to "tetherComponents" into this base class instead of in the component classes themselves via `componentDidUpdate`
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

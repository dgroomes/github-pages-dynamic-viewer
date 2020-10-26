/**
 * A content browser for the source code in the GitHub repository.
 *
 * Shows a directory listing on the left-hand side of the page that includes all ".md" files in the git repo. The files
 * can be navigated to by clicking on them. The contents of all files show on the right-hand side (NOT YET IMPLEMENTED).
 */
class SourceBrowser extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            pageName: window.config.loadingMessage,
            pageContent: window.config.loadingMessage,
            directoryListing: []
        };
        // According to https://reactjs.org/docs/handling-events.html
        //     "This binding is necessary to make `this` work in the callback"
        //
        // But why? And what is the idiomatic alternative (with hooks and without hooks)?
        this.loadDocument = this.loadDocument.bind(this);
    }

    /**
     * Use the GitHub API to list the contents of the repo in a directory listing format.
     * See https://stackoverflow.com/a/53218452
     *
     * And filter for only Markdown files (i.e. files ending in ".md")
     *
     * @return Promise which resolves to the directory listing files
     */
    loadDirectoryListing() {
        let user = window.config.user;
        let repo = window.config.repo;
        let origin = this.githubApiOrigin()
        let url = `${origin}/repos/${user}/${repo}/contents/`;

        return fetch(url)
            .then(response => response.json())
            .then(json => {
                let dirListingMdFiles = json.filter(file => /.+\.md$/.test(file.name))
                this.setState({directoryListing: dirListingMdFiles})
                console.log(`Directory listing loaded with ${dirListingMdFiles.length} files after filtering`);
                return dirListingMdFiles;
            });
    }

    /**
     * Helper function to determine the origin to use for the GitHub Content API.
     *
     * If the current page is detected to be hosted locally, then use the current origin. Else, the page must be hosted by
     * GitHub Pages and so the method returns the GitHub API subdomain 'https:api.github.com'.
     * @return origin to use to make the GitHub Content API requests
     */
    githubApiOrigin() {
        let currentUrl = new URL(window.location);
        let detectedLocal = ['127.0.0.1', 'localhost'].includes(currentUrl.hostname);
        if (detectedLocal) {
            return currentUrl.origin
        } else {
            console.log("Detected the page is NOT hosted locally. The page must be hosted on GitHub")
            return 'https://api.github.com';
        }
    }

    /**
     * Load a document:
     *  1. Load the document source file from the root of the repo
     *  2. Handle unsuccessful responses
     *  3. Convert the Markdown source to HTML using marked.js
     *  4. Add the HTML to the SourceBrowser component
     */
    loadDocument(documentName) {
        return fetch(documentName)
            .then(response => {
                if (response.status === 404) {
                    return `(404) Document '${documentName}' was not found`
                } else if (!response.ok) {
                    throw new Error(`Network response was not okay. status=${status}`)
                } else {
                    return response.text();
                }
            })
            .then(markown => {
                let html = marked(markown);
                this.setState({pageName: documentName, pageContent: html})
            })
            .catch(err => {
                this.setState({pageName: documentName, pageContent: "❌ Something went wrong. Failed to load document."})
            });
    }

    /**
     * "User-mode" initialization stuff that happens after the React initialization stuff happens. Loads the directory
     * listing, and then loads all documents given by the directory listing.
     */
    componentDidMount() {
        this.loadDirectoryListing()
            .then(dirListingFiles => {
                console.log("Loading all documents...");
                let promises = dirListingFiles.map(markdownDocument => this.loadDocument(markdownDocument.path));
                Promise.all(promises).then(values => {
                    console.log("All documents have loaded.")
                });
            });
    }

    render() {
        return <div>
            <div id="sidebar">
                <h1 id="page-name">{this.state.pageName}</h1>
                <div id="directory-listing">
                    <ul>{this.state.directoryListing.map(file => {
                        // NOTE: React really wants list items to have a key. So, assigning 'path' to the key because it
                        // is a unique identifier (rather, a key!).
                        return <li key={file.path}><a href={"#" + file.path}>{file.name}</a></li>;
                    })}</ul>
                </div>
            </div>
            {/* Danger! "dangerouslySetInnerHTML" */}
            <div id="page-content" dangerouslySetInnerHTML={{__html: this.state.pageContent}}
                 className="markdown-body"/>
            <hr/>
        </div>;
    }
}
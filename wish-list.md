# Wish List

General clean ups, TODOs and things I wish to implement for this project:

* Replace all dependencies with vanilla JavaScript (this project is designed to offer a "zero-dependencies" tool)
   * DONE Remove babel
     * DONE Step one of removing babel is to remove our JSX source code. See [React without JSX](https://reactjs.org/docs/react-without-jsx.html) 
   * IN PROGRESS Remove React
   * Remove Marked.js. Instead, we can use GitHub's API to render the markdown
* DONE Load all documents
* DONE draw all documents to the screen (instead of replacing the previous content with the next doc's content)
* Fix up the hash management stuff. This is a bit open-ended. How to make hashes work? I want to be able to click the
  name of a doc from the lefthand nav and have the browser navigate to that fragment. This is just a browser feature. No
  javascript involved.
* The directory listing does not descend into directories? It just loads documents that are in the top-level?
* Support Chrome
* Support Safari
* Support Edge
* DONE Fix the styling on the sidebar
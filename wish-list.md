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
* DONE Exercise the `myCreateElement` to make `<li>` elements *without* child elements. Will it work out-of-the-box? I don't
  think it will. But this functionality needs to work because its design will be used as the basis for handling `<div>`
  elements and beyond in `myCreateElement`. I will use the new "ConfigurationListing" component to create `<li>` 
  elements without their own child elements. The `<li>` elements will just be text.
    * DONE Part of this effort will require a small remodeling of the "untethered elements" reference. There can exist
      multiple groups of untethered elements (meaning, groups of elements where each group should have a different parent)
      at the same time. So, we must keep track of all of these groups at the same time. The "window.untetheredElements"
      must be an array and not a singular object.
* DONE Re-write the "parent element identification" and tethering logic to be robust. 
* De-react `<ul>` element creation
* OBSOLETED Solve the "how many expected children are there?" problem
  * We've gotten pretty far by returning void in the `myCreateElement` function, but I think model fundamentally doesn't
    work. It would solve our problems if we could make this function actually return the elements that were created.
    We wouldn't need this "untethered elements" reference. But, React complains when we return anything except a React
    element from here... Can we re-define the React.createElement function? Is that possible?
  * UPDATE: This problem will *not* be solved. Instead we succesfully prototyped a solution to re-define `React.createElement`
    with a facade function which will let us easily associate parent elements to children elements using the return
    value from `myCreateElement` function. This is convenient and will make for much easier to understand code. Next steps
    are to re-implement the existing framework to do "parent/child association via return value"
* DONE Re-implement the "parent/child association" code to use the return value from `myCreateElement`
  * note: I think the "untethered element" tracking can be mostly removed. At least, the tracking of untethered elements
    can be delayed to the last moment, when the "legal elements" check happens before calling the original
    `React.createElement` function. 
  * note: unfortunately, the array handling code is a little convoluted. It's a neat feature of React, but it requires extra
    handling in the framework. In my case I chose to duplicate the handling code for non-arrays with the handling code
    for arrays instead of getting too abstract and frameworky. "Non-frameworky" is the whole spirit of this application
    after all because we are trying to remove the framework (React)!

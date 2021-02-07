# Wish List

General clean ups, TODOs and things I wish to implement for this project:

* Replace all dependencies with vanilla JavaScript (this project is designed to offer a "zero-dependencies" tool)
   * DONE Remove babel
     * DONE Step one of removing babel is to remove our JSX source code. See [React without JSX](https://reactjs.org/docs/react-without-jsx.html) 
   * IN PROGRESS Remove React
   * Remove Marked.js. Instead, we can use GitHub's API to render the markdown
* Fix up the hash management stuff. This is a bit open-ended. How to make hashes work? I want to be able to click the
  name of a doc from the lefthand nav and have the browser navigate to that fragment. This is just a browser feature. No
  javascript involved.
* The directory listing does not descend into directories? It just loads documents that are in the top-level?
* Support Chrome
* Support Safari
* Support Edge
* The page has two `h3` elements so why do the logs show that 10 elements are being created? It seems like the logs repeat
  in a certain pattern 5 times (hence 10=2*5). What's going on? The logs are so noisy it's hard to read.
* De-react the `h3` tag
* De-react the `div` tag
* IN PROGRESS Defect. The opted-in div tag ("directory-listing") is duplicated in the DOM. There should only be one.  
* Can we re-assign React.Component to the BaseComponent so that our app's components don't even have to change their `class ... extends`
  to use it and can just continue to use React.Component?
     
### Finished *Wish List* items

* DONE Load all documents
* DONE draw all documents to the screen (instead of replacing the previous content with the next doc's content)
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
* DONE De-react `<ul>` element creation
* DONE Implementing requires addressing another problem: the clearing of existing content via the overly invasive
  `parentEl.innerHTML = '';` assignment in the shim. That assignment was always a shortcoming but now it is revealing
  itself as a real problem because it causes the `h3` "Configuration" heading to be deleted. How to solve this? This
  is the heavy-hitting stuff and it would require us to actually re-implement React's virtual DOM diffing and other
  state management things. I think for this toy app, the essential requirements of the app actually does not need
  state management. Can we afford to kind of "squash" the lifecycle of the application to just an "initialization phase"
  where it paints the DOM for the first time with all the data (the markdown directory listing and the document content)
  and just be done with it? Locking in the initialization to just that would eliminate the problem of duplicating elements
  in the DOM and thus free us from the virtual DOM diffing stuff (in theory)
    * Design idea: can we keep track of all React components globally and track an "initialized flag"? Answer: yes
    * Design idea #2: in `React.createElement` (or the facade) do we have access to the component instance? Is it
      equal to the `this` reference? If so, we have any easy view of the overall state and can reference our
      "initialization/tethering" states. UPDATE: now I'm confused but curious; at runtime, `this` is equal to React's
      global context thing when the execution is inside `myCreateElement`. I really don't get that. How does that work?
      Shouldn't `this` be equal to either the component itself (if you go up one frame in the call stack, `this` does indeed
      become the Component instance, for example SourceBrowser) or `window`? I'm bewildered. UPDATE: Oh it should be obvious,
      when I invoke `React.createElement` of course the `this` is `React`. I must have been thinking in terms of Java and `static`
      methods where there is no `this` but `React` *is* indeed an object and therefore a `this`.
    * Design idea 2b:
      1. DOES NOT WORK (in JavaScript classes, you need to use `this` to reference instance properties so I would have to change the React API for `React.createElement` to `this.React.createElement` which I won't do) Hackery to get `this` to reference the instances. Prototype a `MyReactComponent` base class that sets an instance
         field named `React` which should shadow the actual `React`. This will probably be a problem and so actually
         make the field be a [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
         to the real React.
      2. Implement a kind of "gate" strategy where on any calls to `render`, we will set a `hasRendered` flag for the component
         which we should be able to do if we get `this` working. Then, on calls to `tetherElements` we will check the
         parent element and traverse to its owning React component (using <https://stackoverflow.com/a/39165137>) and check
         a flag called `hasTethered`. If false, then do the tethering and then set the flag to true. If true, then skip.
         This should ensure that a particular instance of a React component only ever initializes once, which of course
         is not at all what React is about but it does satisfy our own toy app, and thus our "requirements".
    * DONE Design idea #3: Can we proxy the `render` method and add our own pointcut? That's all we really want, so we can
      add code to only actually execute it once. ANSWER: yes we can! See `base-component.js`.
        * Do the "gate" thing described in "Design idea 2b.2"          
* DONE Push the calls to "tetherComponents" into BaseComponent using the "constructor trick + Proxy" mechanism I discovered in the
  prototype branch instead of in the component classes themselves via `componentDidUpdate`
* DONE define a small logging framework (yikes!) to help me understand what the heck this code is doing. Ironically, the
  code becomes even more complex now...
* FIXED Defect. From the logs, the `div` tag with ID "directory-listing" is getting created with the shim and with React. This
  should never happen. Why is it happening?
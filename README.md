
# Sticky Events Listener

Events listeners for `position: sticky`, without an onscroll listener.

### Installation

```
npm i sticky-events-listener --save
```

### Credit
This is essentially a fork from [Ryan Walters original Sticky Events](https://github.com/ryanwalters/sticky-events). All I've done is refactor the code to work as a
standalone ES6 Class. With only a couple minor tweaks.

### Requires
ES6 Support
Relies on `position: sticky` and `IntersectionObserver` support.

### Usage

When you declare the initial Sticky Events class, there are two optional parameters you can pass in.

First, is an object of elements that you know to be sticky.
The event handler will callback when the sticky state updates.
The selector class will automatically be added to each elements if it isn't already defined.

Second, is an object of options that be be configured at your discretion. The defaults are as follows:

```
events : {
  change  : 'sticky-change',
  stuck   : 'sticky-stuck',
  unstuck : 'sticky-unstuck'
},
sentinels : {
  sentinel : 'sticky-sentinel',
  top      : 'sticky-top-sentinel',
  bottom   : 'sticky-bottom-sentinel'
},
selector : '.sticky',
container : document
```

There are some checks that will permit you to pass in the options as the first parameters instead of the elements.
So you can do any of the following:

```
const sticky = new StickyEvents(stickyElements);
```

```
const sticky = new StickyEvents(stickyElements, {...});
```

```
const sticky = new StickyEvents({...});
```

### Example

The following examples assume you are using jQuery. However, the core class can be used independently from jQuery.

```js
let stickyElements = $('search-bar, nav');

const sticky = new StickyEvents(stickyElements);

stickyElements.each((index, element) => {

  let ele = $(element);

  ele.on(sticky.change, (event) => {
   console.log(element.nodeName.toLowerCase(), event.detail.isSicky)
  });

  ele.on(sticky.stuck, (event) => {
    ele.addClass('stuck').removeClass('unstuck')
  });

  ele.on(sticky.unstuck, (event) => {
    ele.addClass('unstuck').removeClass('stuck')
  });
});
```

class StickyEvents {

  constructor(elements, options) {

    let defaults = {
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
    };

    if (typeof elements == 'object' && typeof options == 'undefined' && Object.keys(defaults).some(r => Object.keys(elements).indexOf(r) >= 0)) {
      options = elements;
    }

    const {events, sentinels, selector, container} = Object.assign({}, defaults, typeof options === 'object' && options);

    // Add selector class if any elements were passed
    if ( typeof elements !== 'undefined' && elements.length ) {
      for (var i = 0; i < elements.length; i++) {
        elements[i].classList.add(selector.replace(/#|\./g,''));
      }
    }

    this.change    = events.change;
    this.stuck     = events.stuck;
    this.unstuck   = events.unstuck;
    this.sentinels = sentinels;
    this.selector  = selector;

    this.observeStickyEvents(container);
  }

  /**
   * Initialize the intersection observers on `.sticky` elements within the specified container.
   * Container defaults to `document`.
   *
   * @export
   * @param {Element|HTMLDocument|Document} container
   */

  observeStickyEvents() {

    var container = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;

    if (window.self !== window.top) {
      return;
    }

    window.requestAnimationFrame(() => {
      this.observeHeaders(container);
      this.observeFooters(container);
    });
  }

  /**
   * Sets up an intersection observer to notify `document` when elements with the `this.sentinels.top` become
   * visible/hidden at the top of the sticky container.
   *
   * @param {Element|HTMLDocument} container
   */

  observeHeaders(container) {
    var observer = new IntersectionObserver((records) => {
      records.forEach((record) => {
        var boundingClientRect = record.boundingClientRect,
            rootBounds = record.rootBounds;

        var stickyParent = record.target.parentElement;
        var stickyTarget = stickyParent.querySelector(this.selector);

        stickyParent.style.position = 'relative';

        if (boundingClientRect.bottom >= rootBounds.top && boundingClientRect.bottom < rootBounds.bottom) {
          this.fire(false, stickyTarget);
        } else if (boundingClientRect.bottom < rootBounds.top) {
          this.fire(true, stickyTarget);
        }
      });
    }, Object.assign({
      threshold: [0]
    }, !(container instanceof HTMLDocument) && {
      root: container
    }));


    var sentinels = this.addSentinels(container, this.sentinels.top);

    sentinels.forEach((sentinel) => {
      return observer.observe(sentinel);
    });
  }

  /**
   * Sets up an intersection observer to notify `document` when elements with the `this.sentinels.bottom` become
   * visible/hidden at the bottom of the sticky container.
   *
   * @param {Element|HTMLDocument} container
   */

  observeFooters(container) {
    var observer = new IntersectionObserver((records) => {
      records.forEach((record) => {
        var boundingClientRect = record.boundingClientRect,
            rootBounds = record.rootBounds;

        var stickyTarget = record.target.parentElement.querySelector(this.selector);

        if (boundingClientRect.top < rootBounds.top && boundingClientRect.bottom < rootBounds.bottom) {
          this.fire(false, stickyTarget);
        } else if (boundingClientRect.bottom > rootBounds.top && this.isSticking(stickyTarget)) {
          this.fire(true, stickyTarget);
        }
      });
    }, Object.assign({
      threshold: [1]
    }, !(container instanceof HTMLDocument) && {
      root: container
    }));

    // Add the bottom sentinels to each section and attach an observer.

    var sentinels = this.addSentinels(container, this.sentinels.bottom);

    sentinels.forEach((sentinel) => {
      return observer.observe(sentinel);
    });
  }

  /**
   * Dispatch the following events:
   * - `sticky-change`
   * - `sticky-stuck` or `sticky-unstuck`
   *
   * @param {Boolean} isSticky
   * @param {Element} stickyTarget
   */

  fire(isSticky, stickyTarget) {
    stickyTarget.dispatchEvent(new CustomEvent(this.change, { detail: { isSticky: isSticky } }));
    stickyTarget.dispatchEvent(new CustomEvent(isSticky ? this.stuck : this.unstuck));
  }

  /**
   * Add sticky sentinels
   *
   * @param {Element|HTMLDocument} container
   * @param {String} className
   * @returns {Array<Element>}
   */

  addSentinels(container, className) {

    return Array.from(container.querySelectorAll(this.selector)).map((stickyElement) => {
      var sentinel = document.createElement('div');
      var stickyParent = stickyElement.parentElement;

      sentinel.classList.add(this.sentinels.sentinel, className);

      switch (className) {
        case this.sentinels.top:
          {
            stickyParent.insertBefore(sentinel, stickyElement);

            Object.assign(sentinel.style, this.getSentinelPosition(stickyElement, sentinel, className));

            break;
          }

        case this.sentinels.bottom:
          {
            stickyParent.appendChild(sentinel);

            Object.assign(sentinel.style, this.getSentinelPosition(stickyElement, sentinel, className));

            break;
          }
      }

      return sentinel;
    });
  }

  /**
   * Determine the position of the sentinel
   *
   * @param {Element|Node} stickyElement
   * @param {Element|Node} sentinel
   * @param {String} className
   * @returns {Object}
   */

  getSentinelPosition(stickyElement, sentinel, className) {
    var stickyStyle = window.getComputedStyle(stickyElement);
    var parentStyle = window.getComputedStyle(stickyElement.parentElement);

    switch (className) {
      case this.sentinels.top:
        return {
          top: 'calc(' + stickyStyle.getPropertyValue('top') + ' * -1)',
          height: 0
        };

      case this.sentinels.bottom:
        var parentPadding = parseInt(parentStyle.paddingTop);

        return {
          bottom: stickyStyle.top,
          height: stickyElement.getBoundingClientRect().height + parentPadding + 'px'
        };
    }
  }

  /**
   * Determine if the sticky element is currently sticking in the browser
   *
   * @param {Element} stickyElement
   * @returns {boolean}
   */

  isSticking(stickyElement) {
    var topSentinel = stickyElement.previousElementSibling;

    var stickyOffset = stickyElement.getBoundingClientRect().top;
    var topSentinelOffset = topSentinel.getBoundingClientRect().top;
    var difference = Math.round(Math.abs(stickyOffset - topSentinelOffset));

    var topSentinelTopPosition = Math.abs(parseInt(window.getComputedStyle(topSentinel).getPropertyValue('top')));

    return difference !== topSentinelTopPosition;
  }

}

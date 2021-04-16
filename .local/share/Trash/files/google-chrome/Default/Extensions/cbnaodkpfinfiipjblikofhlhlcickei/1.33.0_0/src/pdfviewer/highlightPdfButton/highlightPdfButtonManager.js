var HighlightPdfButtonManager = function (window, button) {
  /** Idle time in ms before the UI is hidden. */
  this._HIDE_TIMEOUT = 2000;
  /** Time in ms after force hide before toolbar is shown again. */
  this._FORCE_HIDE_TIMEOUT = 1000;
  /**
   * Velocity required in a mousemove to reveal the UI (pixels/ms). This is
   * intended to be high enough that a fast flick of the mouse is required to
   * reach it.
   */
  this._SHOW_VELOCITY = 10;
  /** Distance from the top of the screen required to reveal the toolbars. */
  this._TOP_TOOLBAR_REVEAL_DISTANCE = 100;
  /** Distance from the bottom-right of the screen required to reveal toolbars. */
  this._SIDE_TOOLBAR_REVEAL_DISTANCE_RIGHT = 150;
  this._SIDE_TOOLBAR_REVEAL_DISTANCE_BOTTOM = 250;
  this._SIDE_TOOLBAR_DISTANCE_RIGHT_START = 83;
  this._SIDE_TOOLBAR_DISTANCE_RIGHT_END = 49;
  this._SIDE_TOOLBAR_DISTANCE_BOTTOM_START = 190;
  this._SIDE_TOOLBAR_DISTANCE_BOTTOM_END = 155;

  this._window = window;
  this._button = button;
  this._buttonTimeout = null;
  this.isMouseNearTopToolbar_ = false;
  this.isMouseNearSideToolbar_ = false;

  this._sideToolbarAllowedOnly = false;
  this._sideToolbarAllowedOnlyTimer = null;

  this._keyboardNavigationActive = false;

  this._lastMovementTimestamp = null;

  // Setup the keyboard event listener.
  this._bindEvents();
  this._hideButtonAfterTimeout();
};

HighlightPdfButtonManager.prototype = {
  /* Check the directionality of the page.
   * @return {boolean} True if Chrome is running an RTL UI.
   */
  _isRTL: function () {
    return document.documentElement.dir == "rtl";
  },

  _isMouseNearTopToolbar: function (e) {
    return e.target !== this._button && e.y < this._TOP_TOOLBAR_REVEAL_DISTANCE;
  },

  _isMouseNearSideToolbar: function (e, window) {
    var atSide = e.x > window.innerWidth - this._SIDE_TOOLBAR_REVEAL_DISTANCE_RIGHT;
    if (this._isRTL()) atSide = e.x < this._SIDE_TOOLBAR_REVEAL_DISTANCE_RIGHT;
    var atBottom = e.y > window.innerHeight - this._SIDE_TOOLBAR_REVEAL_DISTANCE_BOTTOM;
    return atSide && atBottom;
  },

  _isMouseOnFitToScreen: function (e, window) {
    var atSide =
      e.x > window.innerWidth - this._SIDE_TOOLBAR_DISTANCE_RIGHT_START &&
      e.x < window.innerWidth - this._SIDE_TOOLBAR_DISTANCE_RIGHT_END;
    if (this._isRTL())
      atSide = e.x < this._SIDE_TOOLBAR_DISTANCE_RIGHT_START && e.x > this._SIDE_TOOLBAR_DISTANCE_RIGHT_END;

    var atBottom =
      e.y > window.innerHeight - this._SIDE_TOOLBAR_DISTANCE_BOTTOM_START &&
      e.y < window.innerHeight - this._SIDE_TOOLBAR_DISTANCE_BOTTOM_END;
    return atSide && atBottom;
  },

  /**
   * Whether a mousemove event is high enough velocity to reveal the toolbars.
   * @param {MouseEvent} e Event to test.
   * @return {boolean} true if the event is a high velocity mousemove, false
   * otherwise.
   * @private
   */
  _isHighVelocityMouseMove: function (e) {
    if (e.type == "mousemove") {
      if (this._lastMovementTimestamp == null) {
        this._lastMovementTimestamp = this._getCurrentTimestamp();
      } else {
        var movement = Math.sqrt(e.movementX * e.movementX + e.movementY * e.movementY);
        var newTime = this._getCurrentTimestamp();
        var interval = newTime - this._lastMovementTimestamp;
        this._lastMovementTimestamp = newTime;

        if (interval != 0) return movement / interval > this._SHOW_VELOCITY;
      }
    }
    return false;
  },

  /**
   * Wrapper around Date.now() to make it easily replaceable for testing.
   * @return {int}
   * @private
   */
  _getCurrentTimestamp: function () {
    return Date.now();
  },

  /**
   * Display both UI toolbars.
   */
  _showButton: function () {
    this._button.show();
  },

  /**
   * Show toolbars and mark that navigation is being performed with
   * tab/shift-tab. This disables toolbar hiding until the mouse is moved or
   * escape is pressed.
   */
  _showButtonForKeyboardNavigation: function () {
    this._keyboardNavigationActive = true;
    this._showButton();
  },

  /**
   * Hide toolbars after a delay, regardless of the position of the mouse.
   * Intended to be called when the mouse has moved out of the parent window.
   */
  _hideToolbarsForMouseOut: function () {
    this.isMouseNearTopToolbar_ = false;
    this.isMouseNearSideToolbar_ = false;
    this._hideButtonAfterTimeout();
  },

  /**
   * Check if the toolbars are able to be closed, and close them if they are.
   * Toolbars may be kept open based on mouse/keyboard activity and active
   * elements.
   */
  _hideButton: function () {
    if (this.isMouseNearSideToolbar_ || this.isMouseNearTopToolbar_) return;

    // FIXME
    // if (this.toolbar_ && this.toolbar_.shouldKeepOpen())
    //   return;

    if (this._keyboardNavigationActive) return;

    this._button.hide();
  },

  /**
   * Hide the toolbar after the HIDE_TIMEOUT has elapsed.
   */
  _hideButtonAfterTimeout: function () {
    if (this._buttonTimeout) this._window.clearTimeout(this._buttonTimeout);
    this._buttonTimeout = this._window.setTimeout(this._hideButton.bind(this), this._HIDE_TIMEOUT);
  },

  /**
   * Hide the 'topmost' layer of toolbars. Hides any dropdowns that are open, or
   * hides the basic toolbars otherwise.
   */
  _hideSingleToolbarLayer: function () {
    // TODO
    // if (!this.toolbar_ || !this.toolbar_.hideDropdowns()) {
    //   this._keyboardNavigationActive = false;
    //   this._hideButton();
    // }
  },

  /**
   * Hide the top toolbar and keep it hidden until both:
   * - The mouse is moved away from the right side of the screen
   * - 1 second has passed.
   *
   * The top toolbar can be immediately re-opened by moving the mouse to the top
   * of the screen.
   */
  _forceHideTopToolbar: function () {
    // TODO
    console.warn("...FORCE TOOL BAR");
    // if (!this.toolbar_)
    //   return;
    // this.toolbar_.hide();
    this._sideToolbarAllowedOnly = true;
    this._sideToolbarAllowedOnlyTimer = this._window.setTimeout(
      function () {
        this._sideToolbarAllowedOnlyTimer = null;
      }.bind(this),
      this._FORCE_HIDE_TIMEOUT
    );
  },

  /**
   * Whether keydown events should currently be ignored. Events are ignored when
   * an editable element has focus, to allow for proper editing controls.
   * @param {HTMLElement} activeElement The currently selected DOM node.
   * @return {boolean} True if keydown events should be ignored.
   */
  _shouldIgnoreKeyEvents: function (activeElement) {
    // FIXME cannot get inputarea
    while (activeElement.shadowRoot != null && activeElement.shadowRoot.activeElement != null) {
      activeElement = activeElement.shadowRoot.activeElement;
    }

    return activeElement.isContentEditable || activeElement.tagName == "INPUT" || activeElement.tagName == "TEXTAREA";
  },

  _handleMouseClick: function (e) {
    this.isMouseOnFitToScreen_ = this._isMouseOnFitToScreen(e, this._window);
    if (this.isMouseOnFitToScreen_) this._hideButton();
  },

  _handleMouseMove: function (e) {
    this.isMouseNearTopToolbar_ = this._isMouseNearTopToolbar(e);
    this.isMouseNearSideToolbar_ = this._isMouseNearSideToolbar(e, this._window);

    this._keyboardNavigationActive = false;
    var touchInteractionActive = e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents;

    // Allow the top toolbar to be shown if the mouse moves away from the side
    // toolbar (as long as the timeout has elapsed).
    if (!this.isMouseNearSideToolbar_ && !this._sideToolbarAllowedOnlyTimer) this._sideToolbarAllowedOnly = false;

    // Allow the top toolbar to be shown if the mouse moves to the top edge.
    if (this.isMouseNearTopToolbar_) this._sideToolbarAllowedOnly = false;

    // Tapping the screen with toolbars open tries to close them. // TODO
    // if (touchInteractionActive && this.zoomToolbar_.isVisible()) {
    //   this._hideButton();
    //   return;
    // }

    // Show the toolbars if the mouse is near the top or bottom-right of the
    // screen, if the mouse moved fast, or if the touchscreen was tapped.
    if (
      this.isMouseNearTopToolbar_ ||
      this.isMouseNearSideToolbar_ ||
      this._isHighVelocityMouseMove(e) ||
      touchInteractionActive
    ) {
      if (this._sideToolbarAllowedOnly) console.warn("SHOW ZOOM BAR!!!");
      else this._showButton();
    }
    this._hideButtonAfterTimeout();
  },

  _handleKeyEvent: function (e) {
    if (this._shouldIgnoreKeyEvents(document.activeElement) || e.defaultPrevented) return;

    this._hideButtonAfterTimeout(e);

    switch (e.keyCode) {
      case 9: // Tab key.
        this._showButtonForKeyboardNavigation();
        return;
      case 27: // Escape key.
        // TODO
        // if (!this.isPrintPreview_) {
        this._hideButton();
        return;
      // }
      // break;  // Ensure escape falls through to the print-preview handler.
      case 71: // 'g' key.
        if ((e.ctrlKey || e.metaKey) && e.altKey) {
          this._showButton();
        }
        return;
    }

    // Give print preview a chance to handle the key event.
    // if (!fromScriptingAPI && this.isPrintPreview_) {
    // this.sendScriptingMessage_({
    //   type: 'sendKeyEvent',
    //   keyEvent: SerializeKeyEvent(e)
    // });
    // } else { // TODO
    // Show toolbars as a fallback.
    if (!(e.shiftKey || e.ctrlKey || e.altKey)) this._showButton();
    // }
  },

  _handleMouseEvent: function (e) {
    if (e.type == "mousemove") this._handleMouseMove(e);
    else if (e.type == "mouseout") this._hideToolbarsForMouseOut();
    // else if (e.type == 'mouseclick')
    //   this._handleMouseClick(e);
  },

  _bindEvents: function () {
    document.addEventListener("keydown", this._handleKeyEvent.bind(this));
    document.addEventListener("mousemove", this._handleMouseEvent.bind(this));
    document.addEventListener("mouseout", this._handleMouseEvent.bind(this));
    // document.addEventListener('click', this._handleMouseEvent.bind(this)); //TODO
  },
};

// TODO
// resize listener
// fit to page
// loading state
// input text area

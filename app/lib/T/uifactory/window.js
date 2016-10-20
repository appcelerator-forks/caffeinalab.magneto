/**
 * @module  uifactory/window
 * @author  Flavio De Stefano <flavio.destefano@caffeinalab.com>
 */

var UIUtil = require('T/uiutil');

module.exports = function(args) {
	_.defaults(args, {

		/**
		 * **(Android only)** Set the property `displayHomeAsUp` and the relative close listener.
		 * @property {Boolean} [displayHomeAsUp=false]
		 */
		displayHomeAsUp: false,

		/**
		 * **(Android only)** Disable the hardware back button (do nothing on click)
		 * @property {Boolean} [backButtonDisabled=false]
		 */
		backButtonDisabled: false,

		/**
		 * View {@link #setDeferredBackgroundImage}
		 * @property {String} [deferredBackgroundImage=null]
		 */
		deferredBackgroundImage: null,

		/**
		 * View {@link #setBackgroundCoverImage}
		 * @property {String} [backgroundCoverImage=null]
		 */
		backgroundCoverImage: null,

		/**
		 * View {@link #setActivityProperties}
		 * @property {Object} [activityProperties=null]
		 */
		activityProperties: null,

		/**
		 * View {@link #setActionBarProperties}
		 * @property {Object} [actionBarProperties=null]
		 */
		actionBarProperties: null,

		/**
		 * @property {Object} [rightNavButton=null]
		 * View {@link #setRightNavButton}
		 */
		rightNavButton: null,

		/**
		 * View {@link #addActivityButton}
		 * @property {Array} [activityButtons=null]
		 */
		activityButtons: null,

		/**
		 * View {@link #setActivityButton}
		 * @property {Object} [activityButton=null]
		 */
		activityButton: null,

		/**
		 * Set an handler that kill the entire app when back button is closed
		 * @property {Boolean} [exitOnBack=null]
		 */
		exitOnBack: null

	});

	var $this = Ti.UI.createWindow(args);

	$this.opened = false;
	var onOpenFuncs = [];
	function onOpen(callback) {
		if ($this.opened === true) {
			callback();
			return;
		}
		onOpenFuncs.push(callback);
	}

	$this.addEventListener('open', function() {
		$this.opened = true;
		_.each(onOpenFuncs, function(openFunc){
			openFunc();
		});
	});

	/**
	 * When large images are requested, it's useful to set `deferredBackgroundImage` to set the background on window open.
	 * @method setDeferredBackgroundImage
	 * @param {String} val
	 */
	$this.setDeferredBackgroundImage = function(val) {
		onOpen(function() {
			$this.backgroundImage = val;
		});
	};

	/**
	 * @method  setBackgroundCoverImage
	 * @param {String} url
	 */
	$this.setBackgroundCoverImage = function(url) {
		UIUtil.setBackgroundCoverForView($this, url, function(file) {
			$this.backgroundImage = file;
		});
	};

	/**
	 * Fade in this window
	 * @method  fadeIn
	 */
	$this.fadeIn = function() {
		$this.opacity = 0;
		$this.open();
		$this.animate({
			opacity: 1,
			duration: 300
		});
	};

	/**
	 * Fade in this window
	 * @method  fadeOut
	 */
	$this.fadeOut = function() {
		setTimeout(function() { $this.close(); }, 300);
		$this.animate({
			opacity: 0,
			duration: 300
		});
	};

	if (OS_ANDROID) {

		/**
		 * Set the properties for the Activity
		 * @method setActivityProperties
		 * @param {Object} props
		 */
		$this.setActivityProperties = function(props) {
			_.each(props, function(v, k) {
				$this.activity[k] = v;
			});
		};

		/**
		 * Set the properties for the ActionBar
		 * @method  setActionBarProperties
		 * @param {Object}   props
		 * @param {Function} callback
		 */
		$this.setActionBarProperties = function(props, callback) {
			onOpen(function(){
				if ($this.activity.actionBar == null) return;

				_.each(props, function(v, k) {
					$this.activity.actionBar[k] = v;
				});
				if (_.isFunction(callback)) callback($this.activity.actionBar);
			});
		};


		var activityButtons = [];

		$this.setActivityProperties({
			onCreateOptionsMenu: function(e) {
				_.each(activityButtons, function(btn) {
					var menuItem = e.menu.add({
						title: btn.title || '',
						icon: btn.icon || btn.image || '',
						actionView: btn.actionView,
						showAsAction: btn.showAsAction != null ? btn.showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS
					});
					menuItem.addEventListener('click', function(){
						if (_.isFunction(btn.click)) btn.click();
						if (_.isFunction(btn.fireEvent)) btn.fireEvent('click');
					});
				});
			}
		});


		/**
		 * **Android specific**
		 * @method  addActivityButton
		 * @param {Object} opt
		 */
		$this.addActivityButton = function(opt) {
			if (opt != null) {
				while (opt && opt.children && opt.children[0]) opt = opt.children[0]; // hack for Alloy, just ignore it
				activityButtons.push(opt);
			}
			if (_.isFunction($this.activity.invalidateOptionsMenu)) $this.activity.invalidateOptionsMenu();
		};

		/**
		 * **Android specific**
		 * @method  setActivityButton
		 * @param {Object} opt
		 */
		$this.setActivityButton = function(opt) {
			activityButtons = [];
			$this.addActivityButton(opt);
		};

 		/**
 		 * @method setRightNavButton
 		 * @see {@link setActivityButton}
 		 */
		$this.setRightNavButton = $this.setActivityButton;


		/**
		 * Auto-process the titles
		 * @method  processTitles
		 */
		$this.processTitles = function () {
			$this.setActionBarProperties({
				title: ($this.title && $this.subtitle) ? $this.title : ($this.subtitle === false ? $this.title : Ti.App.name),
				subtitle: ($this.title && $this.subtitle) ? $this.subtitle : ($this.subtitle === false ? null : ($this.title || null))
			});
		};

		/**
		 * **Android fix**
		 * @method setTitle
		 * @param {String} value
		 */
		$this.setTitle = function(value) {
			$this.title = value;
			$this.processTitles();
		};

		/**
		 * **Android fix**
		 * @method  setSubtitle
		 * @param {String} value
		 */
		$this.setSubtitle = function(value) {
			$this.subtitle = value;
			$this.processTitles();
		};

	}


	//////////////////////
	// Parse arguments //
	//////////////////////

	if (args.deferredBackgroundImage != null) $this.setDeferredBackgroundImage(args.deferredBackgroundImage);
	if (args.backgroundCoverImage != null) $this.setBackgroundCoverImage(args.backgroundCoverImage);

	if (OS_ANDROID) {

		$this.processTitles();
		if (_.isFunction($this.activity.invalidateOptionsMenu)) {
			$this.activity.invalidateOptionsMenu();
		}

		if (args.displayHomeAsUp === true && args.exitOnClose !== true) {
			$this.setActionBarProperties({
				displayHomeAsUp: true,
				onHomeIconItemSelected: function() {
					$this.close();
				}
			});
		}

		if (args.backButtonDisabled === true) {
			$this.addEventListener('androidback', function() {
				return false;
			});
		}

		if (args.exitOnBack === true) {
			$this.addEventListener('androidback', function() {
				Ti.Android.currentActivity.finish();
			});
		}

		if (args.activityProperties != null) $this.setActivityProperties(args.activityProperties);
		if (args.actionBarProperties != null) $this.setActionBarProperties(args.actionBarProperties);
		if (args.rightNavButton != null) $this.setRightNavButton(args.rightNavButton);
		if (args.activityButtons != null) _.each(args.activityButtons, function(val) { $this.addActivityButton(val); });
		if (args.activityButton != null) $this.setActivityButton(args.activityButton);
	}

	return $this;
};
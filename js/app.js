/**
 * MAIN APP Javascript file
 *
 * @author Gurtam
 * @copyright 2002-2014 Gurtam
 * @license https://opensource.org/licenses/MIT MIT
 */
!function(window, $, _, Backbone) {
	'use strict';

	var playSound = function (context) {
		context.play();
	};
	var hiddenOSM = true;

	var title = decodeURIComponent(APP_CONFIG.alias || "Chatterbox");
	$("header .app-name").html(title);
	document.title = title;

	var console = window.console || {}, APP = window.APP = {};
	APP.MVC = {Model: {}, View: {}, Collection: {}, Router: {}};
	/**
	 * Global variables
	 * @type {Object}
	 *       @const document cached DOM element 'document'
	 *       @const root cached DOM element 'html'
	 *       {Object} show
	 *       		{boolean} units whether to show units
	 *       		{boolean} drivers whether to show drivers
	 *       		{boolean} zones_library whether to show geofences
	 */
	APP.globals = {
		document: $(document.body),
		root: $('html'),
		default_coordinates: {
			x: -0.128005000000030120,
			y: 51.508129
		},
		show: {
			avl_unit: false,
			drivers: false,
			zones_library: false
		},
		lastSendMessage: null,
		lastSendCmd: null
	};
	/**
	 * Configuration variables, some of them are used in localization
	 * @type {Object}
	 *       @const L10n object with localization strings
	 *              @type {Object}
	 *       @const chat_cmd_msg command name to send message
	 *       @const chat_cmd_coords command name to send coordinates
	 *       @const chat_cookie_baloon cookie name for map tooltip
	 *       @const chat_cookie_enterkey cookie name which save (true / false) type of submit message (with / without "Enter" - key)
	 *       @const chat_cookie_models cookie name for models, which we'll need to add in start screen and into "Latest" section
	 *       @const chat_cookie_resources cookie name which save (true / false) type of resources status (show or hide)
	 *       @const default_city default city for map, it is show if user doesn't fill appropriate field in CMS settings
	 *       @const markerIconUrl image path to marker icon for map
	 *       @const markerShadowUrl image path to marker shadow icon for map
	 *       @const icon_size used for units / driver / resource / marker icon
	 *       @const icon_size_big used the same as @icon_size but a little bit bigger
	 *       @const no_image image path to image which used when original icon for units / driver / resource / marker icon is absent
	 *       @const no_photo image path to image which used in start screen, it's replace original image message
	 *       @const geo_polyline image path to empty icon for geofences which type of polyline
	 *       @const geo_polygon image path to empty icon for geofences which type of polygon
	 *       @const geo_circle image path to empty icon for geofences which type of circle
	 *       @const sounds object with some constants
	 *              @type {Object}
	 *              @const available type of availability (on /off)
	 *              @const incomingName sound name (without extension) for incoming message
	 *              @const outgoingName the same as @incomingName but for outgoing message
	 *       @const duration time duration for call function checking changes approachability
	 *       @const format time formatting object
	 *              @type {Object}
	 *              @const date format for date
	 *              @const time format for time
	 *              @const wd format for first day of week
	 *       @const tmpl object with template constants
	 *              @type {Object}
	 *              @const smsCounter ID for sms counter
	 *              @const itemsSearch ID for units / drivers search input
	 *              @const map ID for section which contains map & map button visibility
	 *              @const mapOverview ID for section which contains only map
	 *              @const msgsTemplate ID for messages template
	 *              @const msgTemplate ID for only single message template
	 *              @const msgsContainer ID for messages section
	 *              @const msgsControls ID for messages controls
	 *              @const msgsFilters ID for messages filters
	 *              @const msgForm ID for message submit form
	 *              @const msgCounter ID for messages counter in submit form
	 *              @const msgButton ID for message submit button in form
	 *              @const msgTextarea ID for message textarea field in submit form
	 *              @const msgsSearch ID for messages search input
	 *              @const listItemsTemplate ID for units / drivers / resources list template
	 *              @const listItemTemplate ID for only single item template in @listItemsTemplate list
	 *              @const itemsContainer ID for units / drivers & "Latest" sections
	 *              @const itemsOtherContainer ID for all units / drivers section
	 *              @const itemsLatestContainer ID for "Latest" section only
	 *              @const resources ID for resources section include search input & map section
	 *              @const resourcesContainer ID for resources list section
	 *              @const xmlItemsTemplate ID for messages list template for export
	 *              @const xmlItemTemplate ID for only single message template in @xmlItemsTemplate list
	 *              @const tooptip classname for tooltips
	 *              @const cbSubmitType ID for type send checkbox (with / without "Enter" - key)
	 *              @const splashItemTemplate ID for only single item template in start screen
	 *              @const splashContainer ID for start screen
	 *              @const splashItemsContainer ID for items in start screen
	 *              @const info ID for information message template
	 */
	APP.config = {
		L10n: {},
		chat_cmd_msg: {
			tcp: '__app__chatterbox_msg_tcp',
			gsm: '__app__chatterbox_msg_gsm',
			vrt: '__app__chatterbox_msg_virt',
			udp: '__app__chatterbox_msg_udp'
		},
		chat_cmd_coords: {
			tcp: '__app__chatterbox_coords_tcp',
			gsm: '__app__chatterbox_coords_gsm',
			vrt: '__app__chatterbox_coords_vrt',
			udp: '__app__chatterbox_coords_udp'
		},
		chat_cmd_coords_regexp: /^[0-9]+\.[0-9]+; [0-9]+\.[0-9]+$/,
		chat_cookie_baloon: 'app_chatterbox_baloon',
		chat_cookie_enterkey: 'app_chatterbox_enterkey',
		chat_cookie_models: 'app_chatterbox_models',
		chat_cookie_resources: 'app_chatterbox_resources',
		default_city: 'London',
		markerIconUrl: './img/marker-icon.png',
		markerShadowUrl: './img/marker-shadow.png',
		icon_size: 16,
		icon_size_big: 32,
		no_image: './img/no_image.png',
		no_photo: './img/no_photo.png',
		geo_polyline: './img/geo_polyline.png',
		geo_polygon: './img/geo_polygon.png',
		geo_circle: './img/geo_circle.png',
		sounds: {
			available: true,
			incomingName: 'incoming',
			outgoingName: 'outgoing'
		},
		duration: 600000,
		format: {
			date: 'dd/MM/yyyy',
			time: 'HH:mm'
		},
		tmpl: {
			mainContainer: '#container',
			smsCounter: '#sms-available',
			itemsSearch: '#items-search',
			resourcesSearch: '#resources-search',
			btnRightPanel: '#btn-right-panel',
			map: '#map-section',
			mapOverview: '#map-overview',
			msgsTemplate: '#msgs-tpl',
			msgTemplate: '#msg-tpl',
			msgsContainer: '#msgs-section',
			msgsControls: '#msgs-controls',
			msgsFilters: '#msgs-filter',
			msgForm: '#msg-form',
			msgCounter: '#msg-counter',
			msgButton: '#msg-button',
			msgTextarea: '#msg-body',
			msgsSearch: '#msgs-search',
			listItemsTemplate: '#items-tpl',
			listItemTemplate: '#item-tpl',
			itemsContainer: '#items-section',
			itemsOtherContainer: '#items-section-other',
			itemsLatestContainer: '#items-section-latest',
			resources: '#resources',
			resourcesContainer: '#resources-section',
			xmlItemsTemplate: '#xml-items-tpl',
			xmlItemTemplate: '#xml-item-tpl',
			tooptip: '.tooltip',
			cbSubmitType: '#cb-submit-type',
			splashItemTemplate: '#splash-tpl',
			splashContainer: '#splash',
			splashItemsContainer: '#splash-items',
			info: '#information-tpl'
		}
	};
	/**
	 * Units / drivers / resources common model
	 * @type {Model}
	 * @const defaults default attribute for model
	 *        @type {Object}
	 *        @const name model name
	 *        @const icon model icon image path
	 *        @const number model number which show count of new unread message (for units / drivers only)
	 *        @const coordinates resource coordinates (geofences only)
	 *        @const status used for some reasons in model
	 */
	APP.MVC.Model.listItem = Backbone.Model.extend({defaults: {name: 'Item', icon: APP.config.no_photo, number: 0, coordinates: null, status: '', iconLoad: 'not-loaded'}});
	/**
	 * Message model
	 * @type {Model}
	 * @const defaults default attribute for model
	 *        @type {Object}
	 *        @const name model name
	 *        @const status can be only 2 type: delivered / not-delivered
	 */
	APP.MVC.Model.Msg = Backbone.Model.extend({defaults: {name: 'Message', status: 'delivered'}});
	/**
	 * Start screen item model
	 * @type {Model}
	 * @const defaults default attribute for model
	 *        @type {Object}
	 *        @const name model name
	 */
	APP.MVC.Model.Splash = Backbone.Model.extend({defaults: {name: 'Splash message'}});
	/**
	 * Collection of units models
	 * @type {Collection}
	 */
	APP.MVC.Collection.Units = new Backbone.Collection();
	/**
	 * Comparator for show models in alphabetic order
	 * @param  {Model} model unit model from @APP.MVC.Collection.Units collection
	 * @return {Model}
	 */
	APP.MVC.Collection.Units.comparator = function(model) {return model.get('name').toString().toLowerCase();};
	/**
	 * Collection of drivers models
	 * @type {Collection}
	 */
	APP.MVC.Collection.Drivers = new Backbone.Collection();
	/**
	 * Comparator for show models in alphabetic order
	 * @param  {Model} model unit model from @APP.MVC.Collection.Drivers collection
	 * @return {Model}
	 */
	APP.MVC.Collection.Drivers.comparator = function(model) {return model.get('name').toString().toLowerCase();};
	/**
	 * Collection of latest models (units / drivers)
	 * @type {Collection}
	 */
	APP.MVC.Collection.Latest = new Backbone.Collection();
	/**
	 * Collection of start items models (units / drivers)
	 * @type {Collection}
	 */
	APP.MVC.Collection.Splash = new Backbone.Collection();
	/**
	 * Collection of geofences models
	 * @type {Collection}
	 */
	APP.MVC.Collection.Geofences = new Backbone.Collection();
	/**
	 * Comparator for show models in alphabetic order
	 * @param  {Model} model unit model from @APP.MVC.Collection.Geofences collection
	 * @return {Model}
	 */
	APP.MVC.Collection.Geofences.comparator = function(model) {return model.get('name').toString().toLowerCase();};
	/**
	 * Search common view
	 * @type {View}
	 * @const events
	 * @method initialize
	 *        @param {Object} options
	 * @method onSearch called when user trigger "keypress" event
	 *        @param {Object} e event object
	 * @method onSearchChange called when user trigger "keyup" event
	 *        @param {Object} e event object
	 */
	APP.MVC.View.Search = Backbone.View.extend({
		events: {'keypress': 'onSearch', 'keyup': 'onSearchChange'},
		initialize: function(options) {
			var self = this;
			self.options = options;
			self.delay = (function() {
				var timer;
				return function(callback, ms) {
					clearTimeout(timer);
					timer = setTimeout(callback, ms);
				}
			})();
		},
		onSearch: function(e) {
			var self = this;
			/* we'll wait 500ms and call search function */
			self.delay(function() {self.search(self.$el.val().toString().toLowerCase());}, 500);
		},
		onSearchChange: function(e) {
			var self = this;
			/* we'll call onSearch function when user click "Esc" or "Backspace" button */
			if ((e.which === 8) || (e.which === 27) || (e.keyCode === 8) || (e.keyCode === 27)) self.onSearch(e);
		}
	});
	/**
	 * Search units / drivers view
	 * @type {View}
	 * @const el ID / classname for search units / drivers search input
	 * @method search
	 *        @param {String} string which we'll need to look for
	 */
	APP.MVC.View.itemsSearch = APP.MVC.View.Search.extend({
		el: APP.config.tmpl.itemsSearch,
		search: function(string) {
			/* We'll look for in next collections: APP.MVC.Collection.Units, APP.MVC.Collection.Drivers, APP.MVC.Collection.Latest */
			$.each([APP.MVC.Collection.Units, APP.MVC.Collection.Drivers, APP.MVC.Collection.Latest], function(index, collection) {
				if (collection.length === 0) return; // we don't need to look for in empty collection
				if (string.length === 0) collection.each(function(model) {if (model.has('hidden')) model.unset('hidden');}); // we'll show all models in collection
				if ($.trim(string).length < 1) return; // we don't need to look for string with 1 useful symbol
				collection.each(function(model) {
					if (model.get('name').toString().toLowerCase().indexOf(string) === -1) model.set('hidden', true); // if we can't find necessary string in model name - we'll hide it
					else if (model.has('hidden')) model.unset('hidden'); // vice versa - if model was hidden - we'll show it
				});
			});
		}
	});
	/**
	 * Search resources view
	 * @type {View}
	 * @const el ID / classname for resource search input
	 * @method search
	 *        @param {String} string which we'll need to look for
	 */
	APP.MVC.View.resourcesSearch = APP.MVC.View.Search.extend({
		el: APP.config.tmpl.resourcesSearch,
		search: function(string) {
			if ($.trim(string).length < 1) return false; // we don't need to look for string with 1 useful symbol
			/* Search addresses by string using GurtamMaps (http://sdk.wialon.com/api/index.html#wialon.util.Gis) */
			wialon.util.Gis.searchByString(string, 0x800, 10, function(code, data) {
				if (code || !(data.length && data[0].items.length)) {APP.Chat.message({message: __('Not found'), obj: wialon.core.Errors.getErrorText(code)}); return;} // we'll show error message, in console we can find out more useful information
				var coordinates = data[0].items[0]; // we'll cache necessary coordinates
				if (_.isUndefined(APP.MAP)) APP.MAP = new APP.MVC.View.Map(); // if APP.MAP instance isn't created before - we'll create it now
				APP.MAP.clean().marker = new L.marker([coordinates.y, coordinates.x], {clickable: true, draggable: true, riseOnHover: true, icon: APP.MAP.markerIcon}).addTo(APP.MAP.map); // we'll add marker in our map
				if ($(APP.config.tmpl.mapOverview).is(':hidden')) APP.MAP.toggle(); // if map area is hidden so we'll show it
				APP.MAP.map.fitBounds([APP.MAP.marker.getLatLng()]); // pan to marker
				APP.MAP.marker.on('dblclick', APP.MAP.dblclick); // we'll bind events on double click on this marker
				/* checking if we'll need to show popup (stored in cookie) */
				if (!APP.Chat.cookie.get(APP.config.chat_cookie_baloon +'_'+ APP.globals.userID)) APP.MAP.marker.bindPopup(__('Drag to change<br />Double click to send'), {maxWidth: 150}).openPopup().on('popupclose', function(e) {
					var date = new Date();
					date.setTime(date.getTime() + (365 * 24 * 3600 * 1000));
					APP.Chat.cookie.set(APP.config.chat_cookie_baloon +'_'+ APP.globals.userID, true, date);
				});
			});
		}
	});
	/**
	 * Search messages view
	 * @type {View}
	 * @const el ID / classname for messages search input
	 * @method search
	 *        @param {String} string which we'll need to look for
	 * @method switch
	 *        @param {Boolean} prev sets when we'll need to look for previous message in founded messages
	 */
	APP.MVC.View.msgsSearch = APP.MVC.View.Search.extend({
		el: APP.config.tmpl.msgsSearch,
		search: function(string) {
			var self = this,
				collection = self.options.collection; // we'll look for only in collection which set in options
			self.$el.parent().removeClass('not-found');
			self.flistIndex = -1;
			$(APP.config.tmpl.msgsContainer).find('.founded').removeClass('flistIndex');
			self.flist = null;
			if (_.isUndefined(collection) || (collection.length === 0)) return false; // we don't need to look for in empty collection
			if (string.length === 0) collection.each(function(model) {if (model.has('founded')) model.unset('founded');});
			if ($.trim(string).length < 1) return false; // we don't need to look for string with 1 useful symbol
			collection.each(function(model) {
				/* we don't need to search in image & service messages - so we'll skip it */
				if ((model.get('flag') === 2) || (model.get('flag') === 5) || (model.get('message').toString().replace(/(<([^>]+)>)/ig, '').toLowerCase().indexOf(string) === -1)) {if (model.has('founded')) model.unset('founded');}
				else model.set('founded', true);
			});
			self.flist = $(APP.config.tmpl.msgsContainer).find('.founded');
			if (_.isNull(self.flist) || !_.size(self.flist)) self.$el.parent().addClass('not-found');
			else self.switch();
		},
		switch: function(prev) {
			var self = this;
			if (!(_.isUndefined(self.flist) || _.isNull(self.flist) || !_.size(self.flist))) {
				var count = _.size(self.flist);
				if (_.isUndefined(self.flistIndex)) self.flistIndex = 0;
				else if (prev) {
					if (self.flistIndex === 0) self.flistIndex = count - 1;
					else self.flistIndex--;
				} else {
					if (self.flistIndex === (count - 1)) self.flistIndex = 0;
					else self.flistIndex++;
				}
				$(APP.config.tmpl.msgsContainer).find('.founded').removeClass('flistIndex');
				APP.Msgs.scrollTo(0).scrollTo(self.flist.eq(self.flistIndex).addClass('flistIndex').position().top - 20);
			}
		}
	});
	/**
	 * Item view in units / drivers / resources list
	 * @type {View}
	 * @const tagName
	 * @const template
	 * @method initialize
	 * @method render
	 */
	APP.MVC.View.listItem = Backbone.View.extend({
		tagName: 'li',
		template: $(APP.config.tmpl.listItemTemplate).html(),
		initialize: function() {
			var self = this;
			self.model.on({'change': self.render, 'loadIcon': self.loadIcon}, self);
		},
		render: function() {
			var self = this;
			if (!self.model.has('shortened_name')) self.model.set('shortened_name', APP.Chat.shortenTitle(self.model.get('name'), 12), {silent: true});
			self.$el.html(_.template(self.template, self.model.toJSON()).replace(/\s\s+/g, ''));
			if (self.model.has('iconLoad') && self.model.get('iconLoad') !== 'not-loaded') {
				self.$el.find('.icon').css('background-image', 'url('+ self.model.get('icon') +')');
			}
			return self;
		},
		loadIcon: function() {
			var self = this;
			if (self.model.has('iconLoad') && self.model.get('iconLoad') !== 'not-loaded') {
				return self;
			}
			var $this = self.$el.find('.icon'),
				$list, position;
			if (self.model.collection === APP.MVC.Collection.Latest) {
				$list = $(APP.config.tmpl.itemsLatestContainer);
			}	else if ((self.model.collection === APP.MVC.Collection.Units) || (self.model.collection === APP.MVC.Collection.Drivers)) {
				$list = $(APP.config.tmpl.itemsOtherContainer);
			}
			else {
				$list = $(APP.config.tmpl.resourcesContainer);
			}
			position = self.$el.offset().top - $list.offset().top;
			if (self.$el.offset().top && $list.width() > 0 && (position >= 0) && (position <= $list.height() * 2)) { // * 2 mean preload icons that soon been shown
				var iconSrc = $this.data('icon');
				self.model.set('iconLoad', 'loading', {silent: true});
				$('<img />')
					.load(function() {
						$this.css('background-image', 'url('+ iconSrc +')');
						self.model.set('iconLoad', 'loaded', {silent: true});
					})
					.attr('src' , iconSrc);
			}
			return self;
		}
	});
	/**
	 * Units / drivers / resources list view
	 * @type {View}
	 * @const tagName
	 * @const template
	 * @method initialize
	 * @method update called when model adds, removes or collection resets in general
	 * @method toggle called when we'll need to show / hide list of units, drivers or resources
	 *        @param {Object} e event object
	 */
	APP.MVC.View.listItems = Backbone.View.extend({
		tagName: 'div',
		template: $(APP.config.tmpl.listItemsTemplate).html(),
		events: {'click h3 a': 'toggle'},
		initialize: function() {
			var self = this;
			_.bindAll(self, 'render', 'update', 'resize', 'renderListItem', 'toggle', 'scroll');
			self.render().collection.on('add remove reset', self.update, self);
			self.$el.parent().on('scroll', self.scroll);

		},
		update: function() {
			var self = this,
				$list = self.$el.find('.list').empty();
			self.collection.each(function(item, index) {$list.append(self.renderListItem(item))});
			if (APP.Latest) APP.Latest.resize();
			setTimeout(self.scroll, 500);
			return self;
		},
		toggle: function(e) {
			if (e) APP.Chat.preventDefault(e);
			var self = this;
			self.$el.find('h3').toggleClass('closed');
			if (self.collection === APP.Geofences.collection) {
				APP.Geofences.resize();
			}
			else if (APP.Latest) APP.Latest.resize();
			return self;
		},
		scroll: function(e) {
			if (e) APP.Chat.preventDefault(e);
			var self = this;
			_.delay(function(){
				$.each(self.collection.models, function() {this.trigger('loadIcon')});
			}, 500);
			return self;
		}
	});
	/**
	 * Only unit or driver item  view in list
	 * @type {View}
	 * @const events
	 * @method initialize
	 * @method render called when model created or changed
	 * @method getHwCommands function which we'll call to detect available commands
	 *        @return {Object} return deferred object (done or fail)
	 * @method checkPossibility function which we'll call to detect possibility changes for unit / driver
	 *        @param {Boolean} changedPhones sets when we detected phone changes
	 *        @return {Object} return deferred object (done or fail)
	 * @method updatePossibility function which we'll call when possibility changed or for first use only
	 *        @param {Boolean} changedPhones sets when we detected phone changes
	 *        @param {Boolean} onlyOnce sets when we'll need function only for first use
	 *        @return {Object} this for chaining only
	 * @method updateCounters function which we'll call when we got new message or vice versa we read all new message
	 *        @return {Object} this for chaining only
	 * @method getEvent function which we'll call when we got new event (from "messageRegistered" listener)
	 *        @param {Object} e event object
	 *        @return {Object} this for chaining only
	 * @method messages function which we'll call when we need to show messages for this unit / driver
	 *        @param {Object} e event object
	 *        @return {Object} this for chaining only
	 */
	APP.MVC.View.Item = APP.MVC.View.listItem.extend({
		events: {'click a': 'messages'},
		initialize: function() {
			var self = this;
			_.bindAll(self, 'messages', 'getEvent', 'onChangeLastMessage', 'updateCounters');
			if (self.model.collection !== APP.MVC.Collection.Latest) {
				var item = (self.model.get('mtype') === 'units') ? APP.globals.session.getItem(self.model.id) : APP.globals.session.getItem(self.model.get('rid'));
				if (!_.isNull(item)){
					self.model.set('eventID', item.addListener('messageRegistered', self.getEvent)); // we'll listen this unit / driver's resource for "messageRegistered" event
					self.model.set('eventIDChangeLastMessage', item.addListener('changeLastMessage', self.onChangeLastMessage));
				}
				self.once = true;
			}
			/* we'll bind necessary events to call corresponding functions */
			self.model.on({'change': self.render, 'change:possibility': $.proxy(self.updatePossibility, self, false, true), 'splash': self.messages, 'loadIcon': self.loadIcon}, self);

		},
		render: function() {
			var self = this;
			if (self.model.collection === APP.MVC.Collection.Latest) {
				if ( self.model.get('mtype') !== 'drivers' ) {
					var item = APP.globals.session.getItem(self.model.id);
					var cmds = item.getCommands();

					var hasGPRS = function(unit, cmds) {
						if (!cmds)
							return 0;
						for (var i = 0; i < cmds.length; i++) {
							if (cmds[i].t.indexOf("tcp") != -1 || cmds[i].t.indexOf("udp") != -1)
								return 1;
						}
						return 0;
					};

					var gprs =  item.getNetConn() || hasGPRS(item, cmds);
				}
				if ( self.model.has('possibility') ) {
					if ( self.model.get('possibility').vrt ) {
						if ( !gprs ) {
							self.$el.addClass('unit-offline');
						} else{
							self.$el.removeClass('unit-offline');
						}
					}
					self.$el.removeClass('unavailable');
				} else {
					self.$el.addClass('unavailable');
				}
			} else if (!(self.model.has('possibilityInit') && self.model.has('timerID'))) {
				$.when(self.checkPossibility()).done(function() {if (!self.model.has('possibility')) self.updatePossibility()});
			}
			if (self.model.has('hidden')) {self.$el.addClass('hidden'); return self;}
			if (!self.model.has('shortened_name')) self.model.set('shortened_name', APP.Chat.shortenTitle(self.model.get('name'), 12), {silent: true});
			if (self.model.has('status')) self.$el.addClass(self.model.get('status'));
			if (self.model.has('number') && self.model.get('number') === 0) self.$el.removeClass('new');
			self.$el.removeClass('hidden').html(_.template(self.template, self.model.toJSON()).replace(/\s\s+/g, ''));
			if (self.model.has('iconLoad') && self.model.get('iconLoad') !== 'not-loaded') {
				self.$el.find('.icon').css('background-image', 'url('+ self.model.get('icon') +')');
			}
			return self;
		},
		getHwCommands: function() {
			var self = this;
			return $.Deferred(function(dfd) {
				if (self.model.get('mtype') === 'units') {
					var item = APP.globals.session.getItem(self.model.id);
					if (_.isNull(item)) {
						self.model.set('possibilityInit', {gsm: [], tcp: [], vrt: []}, {silent: true});
						dfd.resolve();
					} else {
						APP.globals.session.getHwCommands(0, self.model.id, function (code, data) {
							if (code === 0) {
								data = {};
								var cmds = item.getCommands();
								if (_.size(cmds)) {
									data = {gsm: [], tcp: [], vrt: []};
									_.each(cmds, function(cmd) {
										_.each(cmd.t.split(','), function(type) {data[type].push(cmd.c)});
									});
								}
							}
							self.model.set('possibilityInit', $.extend(true, {gsm: [], tcp: []}, data), {silent: true});
							dfd.resolve();
						});
					}
				} else {
					self.model.set('possibilityInit', {gsm: true}, {silent: true});
					dfd.resolve();
				}
			}).promise();
		},
		updateMessageType: function( possibilities, online ) {
			if(APP.Msgs && APP.Msgs.options && APP.Msgs.options.typeMsg ) {
				if ( !online ) {
					APP.Msgs.options.typeMsg = 'vrt';
				} else if (possibilities.vrt && possibilities.vrt.length)
					APP.Msgs.options.typeMsg = 'vrt';
				else if (possibilities.tcp && possibilities.tcp.length)
					APP.Msgs.options.typeMsg = 'tcp';
				else if (possibilities.udp && possibilities.udp.length)
					APP.Msgs.options.typeMsg = 'udp';
				else
					APP.Msgs.options.typeMsg = 'vrt';
			}
		},
		checkPossibility: function(changedPhones) {
			var self = this;
			return $.Deferred(function(dfd) {
				self.storedCmds = function(type) {
					var item = APP.globals.session.getItem(self.model.id);
					if (_.isNull(item)) delete self.possibility[type];
					else {
						var cmds = item.getCommands();
						if (_.size(cmds)) {
							var founded = false;
							_.each(cmds, function(cmd) {
								if ($.inArray(type, cmd.t.split(',')) !== -1) {
									if ((cmd.c === 'driver_msg') || (cmd.c === 'custom_msg')) {
										founded = true;
										return false;
									}
								}
							});
							if (!founded) delete self.possibility[type];
						} else {delete self.possibility[type];}
					}
				};
				self.checkCustomMsg = function(type) {
					if ( self.model.get('disable') ) {
						return;
					}
					APP.Chat.cmd.check({
						cmd: 'custom_msg',
						type: type,
						success: function(cmd) {
							if (_.isUndefined(cmd)) {
								APP.Chat.cmd.create({
									cmd: 'custom_msg',
									type: type,
									error: function() {
										self.storedCmds(type);
										self.model.set('disable', true);
									}
								}, self.model.id);
							}
						},
						error: function() {
							self.storedCmds(type);
							self.model.set('disable', true);
						}
					}, self.model.id);
				};
				self.checkCmd = function(type) {
					if ( self.model.get('disable') ) {
						return;
					}
					if ($.inArray('driver_msg', self.possibilityInit[type]) !== -1) {
						APP.Chat.cmd.check({
							type: type,
							success: function(cmd) {
								if (_.isUndefined(cmd)) {
									APP.Chat.cmd.create({
										type: type,
										error: function() {
											self.checkCustomMsg(type);
											self.model.set('disable', true);
										}
									}, self.model.id);
								}
							},
							error: function() {
								self.checkCustomMsg(type);
								self.model.set('disable', true);
							}
						}, self.model.id);
					} else self.checkCustomMsg(type);
				};
				self.possibilityFunc = function() {
					var item;
					self.possibilityInit = _.clone( self.model.get('possibilityInit') );
					self.possibility = {gsm: true, tcp: true, vrt: true, udp: true};
					if (self.model.get('mtype') === 'units') {
						var lastMsg;
						item = APP.globals.session.getItem(self.model.id);
						lastMsg = item && item.getLastMessage();
						var cmds = item.getCommands();

						var hasGPRS = function(unit, cmds) {
							if (!cmds)
								return 0;
							for (var i = 0; i < cmds.length; i++) {
								if (cmds[i].t.indexOf("tcp") != -1 || cmds[i].t.indexOf("udp") != -1)
									return 1;
							}
							return 0;
						};

						var data = {gsm: [], tcp: [], vrt: [], udp: []};
						var gprs = item.getNetConn() || hasGPRS(item, cmds);
						var prevPossibilityInit = self.possibilityInit;
						if (gprs && _.size(cmds)) {
							_.each(cmds, function(cmd) {
								_.each(cmd.t.split(','), function(type) {if(data[type]) data[type].push(cmd.c);});
							});
							self.possibilityInit = data;
						}
						if ( !data.gsm.length && ( self.possibilityInit.gsm.length || prevPossibilityInit.gsm.length ) ) {
							self.possibilityInit.gsm = _.filter( self.possibilityInit.gsm, function( cmd ) {
								return ~['custom_msg', 'driver_msg'].indexOf( cmd );
							} );
							var _gsm = _.filter( prevPossibilityInit.gsm, function( cmd ) {
								return ~['custom_msg', 'driver_msg'].indexOf( cmd );
							} );

							if ( _gsm.length && !self.possibilityInit.gsm.length ) {
								self.possibilityInit.gsm = _gsm;
							}
						}

						self.hasGPRS = gprs;

						/* if this unit doesn't have "driver_msg" or "custom_msg" in command "tcp" definition, or we can't execute commands, or latest message is so old - then we'll delete type "tcp" from possibility of this unit */
						if((
							!gprs && (!self.possibilityInit.tcp || !self.possibilityInit.tcp.length
							|| !(($.inArray('driver_msg', self.possibilityInit.tcp) !== -1) || ($.inArray('custom_msg', self.possibilityInit.tcp) !== -1))
							|| !(lastMsg && lastMsg.t + Math.ceil(APP.config.duration / 1000) > APP.globals.session.getServerTime()))
						)){
							delete self.possibility.tcp;
						} else if ( gprs && (!self.possibilityInit.tcp || !self.possibilityInit.tcp.length) ){
							delete self.possibility.tcp;
						}

						if((
							!gprs || (!self.possibilityInit.udp || !self.possibilityInit.udp.length
							|| !(($.inArray('driver_msg', self.possibilityInit.udp) !== -1) || ($.inArray('custom_msg', self.possibilityInit.udp) !== -1))
						) ) ){
							delete self.possibility.udp;
						} else {
							self.checkCmd('udp');
						}

						if(!self.possibilityInit.gsm || !self.possibilityInit.gsm.length
							|| !(($.inArray('driver_msg', self.possibilityInit.gsm) !== -1) || ($.inArray('custom_msg', self.possibilityInit.gsm) !== -1))
							|| !self.model.get('phones').length
						){
							delete self.possibility.gsm;
						}else
							self.checkCmd('gsm');

						if((
							!self.possibilityInit.vrt || !self.possibilityInit.vrt.length
							|| !(($.inArray('driver_msg', self.possibilityInit.vrt) !== -1) || ($.inArray('custom_msg', self.possibilityInit.vrt) !== -1))
						)) {
							delete self.possibility.vrt;
						} else {
							if ( gprs ) {
								delete self.possibility.vrt;
							} else
								self.checkCmd('vrt');
						}

						if(self.possibility.vrt){
							if(gprs)
								self.offline = false;
							else {
								self.offline = true;
								// SMS stays available for an offline unit
								delete self.possibility.udp;
								delete self.possibility.tcp;
							}
						}

					} else if (self.model.get('mtype') === 'drivers') {
						self.possibility = {gsm: true, tcp: true};
						item = APP.globals.session.getItem(self.model.get('rid'));
						delete self.possibility.tcp; // for driver we delete "tcp" connection immediately
						/* if this driver haven't phone, or we can't send SMS, or SMS count is equal 0 - then we'll delete type "gsm" from possibility of this driver */
						if (
							(!self.model.has('phones') || !self.model.get('phones').length)
							&& (item && (item.getUserAccess() & wialon.item.Resource.accessFlag.viewDrivers))
						) {
							delete self.possibility.gsm;
						}
					}
					var _possibility = self.model.get('_possibility');
					var s = _.clone(self.possibility);
					var isUpdate = self.model.get('disable') && self.offline ? true : false;
					if ( _possibility && _.isEqual(_possibility ,self.possibility ) && !isUpdate ) {
						dfd.resolve();
						return;
					}
					self.model.set( '_possibility', s, {silent: true} );

					$.each(self.possibility, function(i, val) {self.possibility[i] = self.possibilityInit[i]});
					if (
						!self.model.get('disable') &&
						(
							!(_.isUndefined(self.possibility.tcp) || _.isEmpty(self.possibility.tcp)) ||
							!(_.isUndefined(self.possibility.vrt) || _.isEmpty(self.possibility.vrt)) ||
							!(_.isUndefined(self.possibility.udp) || _.isEmpty(self.possibility.udp)) ||
							!(_.isUndefined(self.possibility.gsm) || (_.isEmpty(self.possibility.gsm) && self.possibility.gsm !== true))
						)
					) {
						var oldPossibility = self.model.get('possibility'),
							oldPossibilityWithoutPhone;
						if (oldPossibility && oldPossibility.phone) {
							oldPossibilityWithoutPhone = _(oldPossibility).clone();
							delete oldPossibilityWithoutPhone.phone;
						}
						/* if possibility changed */
						if (!(oldPossibilityWithoutPhone && _.isEqual(oldPossibilityWithoutPhone, self.possibility))) {
							self.model.set('possibility', self.possibility, {silent: true});
							/* if this unit / driver sets in the "Latest" list, we'll update possibility for it too */
							if (!_.isUndefined(APP.MVC.Collection.Latest.get(self.model.id))) {
								var latestModel = APP.MVC.Collection.Latest.get(self.model.id);
								latestModel.set('possibility', self.possibility);
							}
						}
						self.updatePossibility(changedPhones);
					} else if (self.model.has('possibility')) {
						self.model.unset('possibility', {silent: true});
						self.offline = false;
						self.$el.removeClass('unit-offline');
						/* if this unit / driver sets in the "Latest" list, we'll update possibility for it too */
						if (!_.isUndefined(APP.MVC.Collection.Latest.get(self.model.id))) {
							var latestModel = APP.MVC.Collection.Latest.get(self.model.id);
							latestModel.unset('possibility');
						}
						self.updatePossibility(changedPhones);
					}
					dfd.resolve();
				};
				/* If phones changes for this unit / driver */
				if (changedPhones && !(_.isUndefined(APP.Msgs) || _.isNull(APP.config.model)) && (APP.config.model.id === self.model.id)) {
					if (changedPhones) {
						if (_.isEmpty(self.model.get('phones'))) APP.Msgs.$el.find('.title .phones').empty();
						else APP.Msgs.$el.find('.title .phones').html('<span>'+ self.model.get('phones').join('</span><span>') +'</span>');
					}
					if (APP.Msgs.$el.find('.phones span.active').length) APP.Msgs.$el.find('.phones span.active').trigger('click');
					else APP.Msgs.$el.find('.phones span:eq(0)').trigger('click');
				}
				if (self.model.has('timerID')) clearInterval(self.model.get('timerID'));
				var callback = function() {
					self.model.set('timerID', setInterval(self.possibilityFunc, Math.ceil(3000)), {silent: true});
					self.possibilityFunc();
				};
				if (self.once) {
					self.once = false;
					callback();
				} else $.when(self.getHwCommands()).done(function(){
					self.once = false;
					callback();
				});
			}).promise();
		},
		updatePossibility: function(changedPhones, onlyOnce) {
			var self = this;
			APP.Chat.log.start(__('Possibility change (%%o%%)', {'o': self.model.get('name')}));
			/**
			 * Callback function
			 * @type {Function}
			 * @param {Object} el cached DOM element
			 * @param {String} type connection type
			 * @param {Boolean} isError sets if we have got error
			 */
			function onCallback(el, type, isError) {
				if (isError) {
					el.addClass('disabled');
				} else {
					if (el.hasClass('disabled')) el.removeClass('disabled');
				}
			}
			function storedCmds(el, type) {
				var item = APP.globals.session.getItem(self.model.id);
				if (_.isNull(item)) onCallback(el, type, true);
				else {
					var cmds = item.getCommands();
					if (_.size(cmds)) {
						var founded = false;
						_.each(cmds, function(cmd) {
							if ($.inArray(type, cmd.t.split(',')) !== -1) {
								if ((cmd.c === 'driver_msg') || (cmd.c === 'custom_msg')) {
									APP.config.chat_cmd_msg[type] = cmd.n;
									founded = true;
									return false;
								}
							}
						});
						if (!founded) onCallback(el, type, true);
						else onCallback(el, type);
					} else onCallback(el, type, true);
				}
			}
			/**
			 * We'll call this function when "driver_msg" isn't available
			 * @type {Function}
			 * @param {Object} el cached DOM element
			 * @param {String} type connection type
			 */
			function checkCustomMsg(el, type) {
				APP.Chat.cmd.check({
					cmd: 'custom_msg',
					type: type,
					success: function(cmd) {
						if (_.isUndefined(cmd)) storedCmds(el, type);
						else {
							APP.config.chat_cmd_msg[type] = cmd.n;
							onCallback(el, type);
						}
					},
					error: function() {storedCmds(el, type)}
				}, APP.config.model.id);
			}

			/* we'll trigger phone click to select number to send, with class "active" if it was already chosen */
			if (!(_.isUndefined(APP.Msgs) || _.isNull(APP.config.model)) && (APP.config.model.id === self.model.id)) {
				if (APP.Msgs.$el.find('.phones span.active').length) APP.Msgs.$el.find('.phones span.active').trigger('click');
				else APP.Msgs.$el.find('.phones span:eq(0)').trigger('click');
			}

			var theSameModel = APP.config.model && APP.config.model.get('name') === self.model.get('name') ? true : false;
			if (self.model.has('possibility')) {
				var possibilities = self.model.get('possibility');
				if ( theSameModel ) {
					var typing = 'udp';
					if ( possibilities.vrt && possibilities.vrt.length ) {
						typing = 'vrt';
					} else if ( possibilities.tcp && possibilities.tcp.length ) {
						typing = 'tcp';
					}
					$('#tooltipTypeMsg li:first').attr( 'data-type', typing );
				}

				if(self.offline){
					self.$el.addClass('unit-offline');
				}
				else{
					self.$el.removeClass('unit-offline');
				}


				self.$el.removeClass('unavailable');
				var disabled = self.model.get('disable');
				if (!(_.isUndefined(APP.Msgs) || _.isNull(APP.config.model)) && (self.model.collection !== APP.MVC.Collection.Latest) && (APP.config.model.id === self.model.id) && !disabled) {
					var $history = APP.Msgs.$el.find('.history'),
						possibility = self.model.get('possibility');
					$('#tooltipTypeMsg li').each(function() {
						var $this = $(this),
							type = $this.data('type');
						if(possibility.vrt && possibility.vrt.length && type !== 'gsm' && !possibility.tcp)
							type = 'vrt';
						if (_.isUndefined(type)) return;
						if (self.model.get('mtype') === 'units') {
							if (possibility[type] && (($.inArray('driver_msg', possibility[type]) !== -1) || ($.inArray('custom_msg', possibility[type]) !== -1))) {
								if ($this.hasClass('disabled')) {
									if ($.inArray('driver_msg', possibility[type]) !== -1) {
										APP.Chat.cmd.check({
											type: type,
											success: function(cmd) {
												if (_.isUndefined(cmd)) checkCustomMsg($this, type);
												else {
													APP.config.chat_cmd_msg[type] = cmd.n;
													onCallback($this, type);
												}
											},
											error: function() {checkCustomMsg($this, type);}
										}, APP.config.model.id);
									} else checkCustomMsg($this, type);
								}
							} else if (!$this.hasClass('disabled') || onlyOnce) onCallback($this, type, true);
						} else {
							if (possibility[type]) {
								if ($this.hasClass('disabled')) onCallback($this, type);
							} else if (!$this.hasClass('disabled') || onlyOnce) onCallback($this, type, true);
						}
					});
					_.delay(function() {
						$(APP.config.tmpl.msgsControls).add($(APP.config.tmpl.msgForm)).show(0); // we'll show controls & submit form, if they are hidden
						APP.Msgs.resize();
						if ($history.length && ($history[0].scrollTop + Math.ceil($history.height() * 1.5)) >= $history[0].scrollHeight) APP.Msgs.scrollTo();
						setTimeout(function() {
							/* we'll choose message communication type, as we made for phones before */
							if (!(_.isNull(APP.Msgs.options.typeMsg) || APP.Msgs.options.typeMsg == 'vrt' || $('#tooltipTypeMsg li.active').hasClass('disabled')))
								$('#tooltipTypeMsg li.active').trigger('click');
							else
								$('#tooltipTypeMsg li:not(.disabled):eq(0)').trigger('click');
							APP.Chat.log.end(__('Possibility change (%%o%%)', {'o': self.model.get('name')}));
							APP.Msgs.clear();
						}, 250);
					}, 1000);
				}
			} else {
				self.$el.addClass('unavailable'); // we'll make for this unit / driver "unactive" class
				if (!(_.isUndefined(APP.Msgs) || _.isNull(APP.config.model)) && (self.model.collection !== APP.MVC.Collection.Latest) && (APP.config.model.id === self.model.id)) {
					$('#tooltipTypeMsg li').addClass('disabled'); // we'll add class "disabled" to all communication types
					var $history = APP.Msgs.$el.find('.history');
					APP.Msgs.options.typeMsg = null; // we'll set to null communication type
					$(APP.config.tmpl.msgsControls).add($(APP.config.tmpl.msgForm)).add($(APP.config.tmpl.smsCounter)).hide(0); // we'll hide submit form & message controls
					$history.append(_.template($(APP.config.tmpl.info).html(), {text: __('%%type%% are not available', {'type': __('SMS') +', '+ __('Chat')})}).replace(/\s\s+/g, '')); // we'll create service message
					APP.Msgs.resize();
					if ($history[0] && (($history[0].scrollTop + Math.ceil($history.height() * 1.5)) >= $history[0].scrollHeight)) APP.Msgs.scrollTo();
				}
				APP.Chat.log.end(__('Possibility change (%%o%%)', {'o': self.model.get('name')}));
			}
			return self;
		},
		updateCounters: function() {
			var self = this;
			$.each([APP.Latest, APP.Units, APP.Drivers], function(i, val) {
				var $title = val.$el.find('h3'),
					count = val.$el.find('.list .new').length;
				$title.find('i').text(count);
				if (count) $title.addClass('new'); // unread messages is still here
				else $title.find('i').fadeOut(1500, function() {
					$title.removeClass('new').find('i').removeAttr('style');
				});
			});
			return self;
		},
		getEvent: function(e) {
			var self = this,
				data = e.getData();
				data.f = data.f & 0x3fffffff;
			if (_.isUndefined(data)) return self; // if we have got wrong data we don't need to do smth
			if ((data.tp === 'xx') && (data.f === 4096)) { // check for changed phones or hardware
				var flags = 0x80733,
					phones = [];
				if ((self.model.get('mtype') === 'drivers')) {
					if (!((data.p.action === 'update_driver') && (data.p.p1 === self.model.get('name')))) return self;
					APP.globals.session.searchItem(self.model.get('rid'), flags, function(code, data) {
						if (code || !data) return;
						var drivers = data.getDrivers();
						if (!_.size(drivers)) return;
						$.each(drivers, function(k, driver) {
							var id = driver.id;
							if (id !== self.model.get('did')) return;
							$.each([driver.p, ''], function() {
								if (!wialon.util.String.isValidPhone(this)) return;
								phones.push(this);
							});
							self.model.set('phones', phones, {silent: true});
							self.checkPossibility(true);
						});
					});
				} else {
					if (!((data.p.action === 'update_unit_phone') || (data.p.action === 'update_unit_phone2') || (data.p.action === 'update_unit_hw'))) return self;
					if ((data.p.action === 'update_unit_phone') || (data.p.action === 'update_unit_phone2')) {
						APP.globals.session.searchItem(self.model.id, flags, function(code, data) {
							if (code || !data) return;
							var unit = data;
							$.each([unit.getPhoneNumber(), unit.getPhoneNumber2()], function() {
								if (!wialon.util.String.isValidPhone(this)) return;
								phones.push(this);
							});
							self.model.set('phones', phones, {silent: true});
							self.checkPossibility(true);
						});
					} else self.checkPossibility();
				}
				return self;
			}
			if ((self.model.get('mtype') === 'drivers')) {
				var item = APP.globals.session.getItem(self.model.get('rid'));
				if (!(item && item.getUserAccess() & wialon.item.Resource.accessFlag.viewNotifications)) return self;
			} else {
				var item = APP.globals.session.getItem(self.model.id);
				if (!(item && item.getUserAccess() & wialon.item.Item.accessFlag.execReports)) return self;
			}
			var id = self.model.id,
				phones = self.model.get('phones'),
				model;
			/* we'll filter only necessary events for this unit or driver resource */
			if ((data.tp !== 'us') && !((data.tp === 'xx') && ($.inArray(data.p.phone, phones) !== -1) && (data.f === 2305 || data.f === 2304)) && !(data.tp === 'ud' && (data.p.text || data.p.image || data.f & 16)) && !(data.tp === 'ucr' && (data.cn === 'driver_msg' || data.cn === 'custom_msg' || data.cn === 'send_position'))) return self;
			if (APP.globals.audioTagSupport && APP.config.sounds.available && (data.tp === 'ud' || data.tp === 'us' || ((data.tp === 'xx') && (data.f === 2304)))) {
				APP.globals.incomingSound.currentTime = 0;
				playSound(APP.globals.incomingSound);
			}
			/**
			 * Check message & model for correspondence reasons
			 * @type {Function}
			 * @param {Object} msg
			 * @param {Model} model
			 * @return {Model} if we found corresponding model, so we'll return model, if not - null
			 */
			function checkMsg(msg, model) {
				var founded = null,
					message;
				if ((msg.cn === 'driver_msg' || msg.cn === 'custom_msg') && (wialon.util.String.isValidText(msg.cp))) message = msg.cp;
				else if (msg.cn === 'send_position') {
					var coordsData = msg.cp.split('|');
					message = (!coordsData[3].match(APP.config.chat_cmd_coords_regexp)
					? '<i>' + coordsData[3] + '</i>'
					: '<i>'+ __('Sent coordinates') +'</i>: '+ coordsData[3]) +
				'<br /><a href="#" class="sent-coords" data-coords="'+ coordsData[0] +'|'+ coordsData[1] +'">'+ __('Show on map') +'</a>';
				} else if (wialon.util.String.isValidText(msg.p.sms_text)) message = msg.p.sms_text;
				if (message === model.get('message')) founded = model;
				return founded;
			}
			/**
			 * We'll update founded model
			 * @type {Function}
			 * @param {Number} id
			 * @param {Object} msg
			 * @param {Model} model
			 */
			function foundedMsg(id, msg, model) {
				var offset = Math.ceil(wialon.util.DateTime.getTimezoneOffset() / 1000);
				model.set({
					id: id,
					date: msg.t ? wialon.util.DateTime.formatTime(msg.t + offset, 2, APP.config.format.date) : null,
					time: msg.t ? wialon.util.DateTime.formatTime(msg.t + offset, 2, APP.config.format.time) : '',
					timestamp: msg.t,
					status: 'delivered'
				});
			}

			if (!(_.isUndefined(APP.Msgs) || _.isNull(APP.config.model)) && (APP.config.model.id === self.model.id)) {
				APP.Msgs.getMessagesLoader(function(d, c) {
					$.each(d, function(i, msg) {
						msg.f = msg.f & 0x3fffffff;
						if ((msg.tp !== 'us') && !((msg.tp === 'xx') && ($.inArray(msg.p.phone, phones) !== -1) && (msg.f === 2305 || msg.f === 2304)) && !(msg.tp === 'ud' && (msg.p.text || msg.p.image || msg.f & 16)) && !(msg.tp === 'ucr' && (msg.cn === 'driver_msg' || msg.cn === 'custom_msg' || msg.cn === 'send_position'))) return;
						// note: msg.t is the time of processing on the server, while the time of a new model is the client time
						var model = APP.MVC.Collection.Msgs.findWhere({'timestamp': msg.t});
						if (_.size(model) && model.get('massage') == msg.p.text) {
							if (model.id === 0) model.set('id', i, {silent: true});
							if (model.has('status') && (model.get('status') === 'not-delivered')) model.set('status', 'delivered');
						} else {
							if ((msg.tp === 'ucr') || ((msg.tp === 'xx') && (msg.f === 2305))) {
								var models = _.filter(APP.MVC.Collection.Msgs.models, function(model) {
									return ((model.get('type') === 'outgoing') && model.has('status') && (model.get('status') === 'not-delivered'));
								});
								if (!_.isEmpty(models)) {
									$.each(models, function(k, model) {
										if (!_.isNull(checkMsg(msg, model))) {foundedMsg(i, msg, model); return false;}
									});
								}else if(msg.ca && msg.ca.indexOf('__app__chatterbox') == -1){
									model = APP.Msgs.renderMsg(i, msg);
									if(APP.globals.lastSendCmd && APP.globals.lastSendMessage && APP.globals.lastSendMessage.get('message') == model.message && APP.globals.lastSendCmd.c == msg.cn){
										APP.globals.lastSendCmd = null;
										return false;
									}
									APP.MVC.Collection.Msgs.add(new APP.MVC.Model.Msg(model));
								}
							} else {
								var needGeos = false;
								// new message
								if ( !model && msg.p.image ) {
									needGeos = true;
								}
								model = APP.Msgs.renderMsg(i, msg);
								var newModel = new APP.MVC.Model.Msg(model);
								var nModel = APP.MVC.Collection.Msgs.add( model );
								if ( needGeos ) {
									APP.Msgs._getLocations( [newModel], function() {
										nModel.set( 'geo', newModel.get( 'geo' ), {silent: false});
									} );
								}
							}
						}
					});
				});
			} else {
				self.model.set({number: (self.model.get('number') + 1), status: ((data.tp === 'ud' && data.f & 16) ? 'new alert' : 'new')});
				model = self.model.clone();
				if (model.has('possibilityInit')) model.unset('possibilityInit', {silent: true});
				if (model.has('eventID')) model.unset('eventID', {silent: true});
				if (model.has('eventIDChangeLastMessage')) model.unset('eventIDChangeLastMessage', {silent: true});
				if (model.has('timerID')) model.unset('timerID', {silent: true});
				APP.MVC.Collection.Latest.unshift(model, {merge: true});
				APP.Chat.savePrevState(model.id);
				self.updateCounters();
			}
			return self;
		},
		onChangeLastMessage: function(e) {
			var self = this,
				data = e.getData();
			if (!_.isUndefined(data)) { // if we have got wrong data we don't need to do smth
				if (APP.config.model && self.model.id === APP.config.model.id) {
					$(APP.config.tmpl.msgsContainer).find('.history').children('.lastmsg').removeClass('lastmsg');
				}
			}
			return self;
		},
		messages: function(e) {
			if (e) APP.Chat.preventDefault(e);
			var self = this,
				model;
			function onError() {APP.MAP.map.setView(new L.LatLng(APP.globals.default_coordinates.y, APP.globals.default_coordinates.x), 11);}
			if (APP.Chat.cookie.get(APP.config.chat_cookie_resources +'_'+ APP.globals.userID) !== 'false') $(APP.config.tmpl.resources).addClass('shown');
			/* if this unit / driver have new messages */
			if (self.model.has('number') && (self.model.get('number') !== 0)) {
				self.model.unset('status', {silent: true});
				self.model.set('number', 0);
				if (self.model.collection === APP.MVC.Collection.Latest) {
					model = (self.model.get('mtype') === 'units') ? APP.MVC.Collection.Units.get(self.model.id) : APP.MVC.Collection.Drivers.get(self.model.id);
					model.unset('status', {silent: true});
					model.set('number', 0);
				} else {
					model = self.model;
					if (!_.isUndefined(APP.MVC.Collection.Latest.get(self.model.id))) {
						var latestModel = APP.MVC.Collection.Latest.get(self.model.id);
						latestModel.unset('status', {silent: true});
						latestModel.set('number', 0);
					}
				}
				self.updateCounters();
			} else {
				if (self.model.collection === APP.MVC.Collection.Latest) model = (self.model.get('mtype') === 'units') ? APP.MVC.Collection.Units.get(self.model.id) : APP.MVC.Collection.Drivers.get(self.model.id);
				else model = self.model;
			}
			if (!_.isUndefined(APP.config.model)) APP.config.model.unset('status', {silent: true});
			$(APP.config.tmpl.itemsContainer).find('.list li').removeClass('active');
			self.$el.addClass('active');
			APP.config.model = model;
			if (_.isUndefined(APP.MAP)) APP.MAP = new APP.MVC.View.Map();
			APP.MAP.clean();
			var item = APP.globals.session.getItem((model.get('mtype') === 'units') ? APP.config.model.id : APP.config.model.get('rid'));
			if (item) {
				var pos = null,
					markerOptions = { // we'll determine marker options
						iconUrl: model.get('icon_big'),
						iconSize: [APP.config.icon_size_big, APP.config.icon_size_big],
						iconAnchor: [Math.ceil(APP.config.icon_size_big / 2), APP.config.icon_size_big]
					};
				/* we'll detect unit / driver position */
				if ((model.get('mtype') === 'units') && item.getPosition()) pos = item.getPosition();
				else if (model.get('mtype') === 'drivers') {
					var drivers = _.filter(item.getDrivers(), function(driver) {return (driver.n === APP.config.model.get('name'))});
					if (_.size(drivers)) var driver = drivers[0];
					var bindedUnit = null;
					if (driver.bu) bindedUnit = APP.globals.session.getItem(driver.bu);
					else if (driver.pu) bindedUnit = APP.globals.session.getItem(driver.bu);
					if (!_.isNull(bindedUnit) && bindedUnit.getPosition()) pos = bindedUnit.getPosition();
					if (driver.r) {
						var ratio = driver.r;
						if (ratio > 1) {
							markerOptions.iconSize = [APP.config.icon_size_big, Math.ceil(APP.config.icon_size_big / ratio)],
							markerOptions.iconAnchor = [Math.ceil(APP.config.icon_size_big / 2), Math.ceil(APP.config.icon_size_big / ratio)];
						} else {
							markerOptions.iconSize = [Math.ceil(APP.config.icon_size_big * ratio), APP.config.icon_size_big],
							markerOptions.iconAnchor = [Math.ceil(APP.config.icon_size_big * ratio / 2), APP.config.icon_size_big];
						}
					}
				}
				/* if we can't detect positions - we'll show map with default position*/
				if (_.isNull(pos)) onError();
				else {
					APP.MAP.marker = new L.marker([pos.y, pos.x], {clickable: true, riseOnHover: true, icon: new APP.MAP.markerIconUnit(markerOptions)}).addTo(APP.MAP.map);
					var options = {'c': Math.floor(APP.Chat.atoui(pos.s)), 'measure': __('km/h')},
						appended = null,
						mu = null;
					if (model.get('mtype') === 'units') mu = item.getMeasureUnits(); //get unit measure system
					else if (model.get('mtype') === 'drivers') mu = bindedUnit.getMeasureUnits(); //get driver's bound unit measure system
					if (mu === 1) options = {'c': Math.floor(APP.Chat.atoui(pos.s * 0.621)), 'measure': __('mph')}//if american measurement system in a use
					appended = __('Latest message: %%d%% %%t%%', {'d': wialon.util.DateTime.formatTime(pos.t + Math.ceil(wialon.util.DateTime.getTimezoneOffset() / 1000), 2, APP.config.format.date), 't': wialon.util.DateTime.formatTime(pos.t + Math.ceil(wialon.util.DateTime.getTimezoneOffset() / 1000), 2, APP.config.format.time)}) +'<br />'+ __('Speed: %%c%% %%measure%%', options);
					APP.MAP.map.fitBounds([[pos.y + .00015, pos.x]]) // we'll shift a little bit down map - to show tooltip
					setTimeout(function() {APP.MAP.marker.bindPopup(appended, {maxWidth: 150}).openPopup()}, 500);
				}
			} else onError();
			$(APP.config.tmpl.resourcesContainer).find('li').removeClass('active');
			if ($(APP.config.tmpl.mapOverview).is(':hidden')) APP.MAP.toggle(); // show map section
			// if APP.Msgs instance isn't created before - we'll create it now and update with specific parameters
			if (_.isUndefined(APP.Msgs)) {
				APP.MVC.Collection.Msgs = new Backbone.Collection();
				APP.Msgs = new APP.MVC.View.Msgs({collection: APP.MVC.Collection.Msgs, period: null, filter: 'all'});
			} else {
				APP.Msgs.options.period = null; // today
				APP.Msgs.options.filter = 'all'; // show incoming / outgoing messages
			}
			APP.Msgs.render();
			setTimeout(function() {APP.Msgs.getMsgs()}, 500);
			return self;
		}
	});
	/**
	 * Units / drivers list view
	 * @type {View}
	 * @method render
	 * @method resize we'll trigger this method when document / window resized or we add / remove model from collection
	 * @method renderListItem render function for only single model
	 *        @param {Model} model
	 */
	APP.MVC.View.Items = APP.MVC.View.listItems.extend({
		render: function() {
			var self = this,
				service = '';
			if (self.collection === APP.MVC.Collection.Units) {
				service = 'avl_unit';
			}
			else if (self.collection === APP.MVC.Collection.Drivers) {
				service = 'drivers';
			}
			else if (self.collection === APP.MVC.Collection.Geofences) {
				service = 'zones_library';
			}
			/* render list from template & appended it to correct place in DOM */
			if ((service && (APP.globals.show[service])) || self.collection === APP.MVC.Collection.Latest) {
				self.$el
					.html(_.template(self.template, {typeName: self.typeName}).replace(/\s\s+/g, ''))
					.appendTo((self.collection === APP.MVC.Collection.Latest) ? APP.config.tmpl.itemsLatestContainer : APP.config.tmpl.itemsOtherContainer);
				self.update();
			}
			return self;
		},
		resize: function() {
			var self = this,
				$items = $(APP.config.tmpl.itemsOtherContainer).removeAttr('style'),
				$latest = $(APP.config.tmpl.itemsLatestContainer).removeAttr('style'),
				offsetLatest = $latest.offset().top,
				heightWindow = APP.Chat.$el.height() - parseInt(APP.globals.document.css('padding-bottom')) - 1;
			if ((Math.ceil((heightWindow - offsetLatest) / 2) < $latest.outerHeight(true)) && ((heightWindow - offsetLatest) < $(APP.config.tmpl.itemsContainer).outerHeight(true))) $latest.css('height', Math.ceil((heightWindow - offsetLatest) / 2) +'px');
			setTimeout(function() {
				var offsetItems = $items.offset().top;
				$items.css('height', (heightWindow - offsetItems) +'px');
				self.$el.parent().trigger('scroll');
			}, 250);
			return self;
		},
		renderListItem: function(model) {
			var item = new APP.MVC.View.Item({model: model}); // create instance for current model
			return item.render().$el;
		}
	});
	/**
	 * Only resource item (geofences) view in list
	 * @type {View}
	 * @const events
	 * @method map function which we'll call to show this geofence on map
	 *        @return {Object} this for chaining only
	 * @method send function which we'll call to send necessary coordinates to unit / driver
	 *        @param {Object} e event object
	 *        @return {Object} this for chaining only
	 */
	APP.MVC.View.Resource = APP.MVC.View.listItem.extend({
		events: {
			'click a': 'map',
			'dblclick a': 'send',
			'click a i': 'send'
		},
		map: function(e) {
			if (e) APP.Chat.preventDefault(e);
			var self = this;
			if (!self.model.has('mtype') || !(_.isArray(self.model.get('coordinates')))) return self;
			if (self.model.get('mtype') === 'geofences' && !self.model.has('type')) {APP.Chat.message({message: __('Oh! Unfortunately, we can\'t send coordinates')}); return self}
			var coordinates = self.model.get('coordinates');
			if (coordinates.length <= 0) return self;
			$(APP.config.tmpl.resourcesContainer).find('li').removeClass('active');
			self.$el.addClass('active');
			if (_.isUndefined(APP.MAP)) APP.MAP = new APP.MVC.View.Map();
			APP.MAP.clean();
			var points = [];
			switch (self.model.get('type')) {
				case 1:
					$.each(coordinates, function(i, val) {points.push(L.latLng(val.y, val.x))});
					APP.MAP.obj = new L.Polyline(points).addTo(APP.MAP.map);
					break;
				case 2:
					$.each(coordinates, function(i, val) {points.push(L.latLng(val.y, val.x))});
					APP.MAP.obj = new L.Polygon(points).addTo(APP.MAP.map);
					break;
				default: APP.MAP.obj = new L.Circle([coordinates[0].y, coordinates[0].x], coordinates[0].r).addTo(APP.MAP.map);
			}
			if (self.model.has('color')) APP.MAP.obj.setStyle({color: self.model.get('color')})
			APP.MAP.marker = new L.marker([coordinates[0].y, coordinates[0].x], {clickable: true, draggable: true, riseOnHover: true, icon: APP.MAP.markerIcon}).addTo(APP.MAP.map);
			if ($(APP.config.tmpl.mapOverview).is(':hidden')) APP.MAP.toggle();
			APP.MAP.map.fitBounds(APP.MAP.obj.getBounds());
			APP.MAP.marker.on('dblclick', APP.MAP.dblclick);
			if (!APP.Chat.cookie.get(APP.config.chat_cookie_baloon +'_'+ APP.globals.userID)) APP.MAP.marker.bindPopup(__('Drag to change<br />Double click to send'), {maxWidth: 150}).openPopup().on('popupclose', function(e) {
				var date = new Date();
				date.setTime(date.getTime() + (365 * 24 * 3600 * 1000));
				APP.Chat.cookie.set(APP.config.chat_cookie_baloon +'_'+ APP.globals.userID, true, date);
			});
			return self;
		},
		send: function(e) {
			if (e) APP.Chat.preventDefault(e);
			var self = this;
			if (_.isUndefined(APP.MAP)) APP.MAP = new APP.MVC.View.Map();
			if (APP.MAP.marker) APP.MAP.marker.fire('dblclick');
			return self;
		}
	});
	/**
	 * Resourse (geofences) list view
	 * @type {View}
	 * @method render
	 * @method resize we'll trigger this method when document / window resized or we add / remove model from collection
	 * @method renderListItem render function for only single model
	 *        @param {Model} model
	 */
	APP.MVC.View.Resources = APP.MVC.View.listItems.extend({
		render: function() {
			var self = this;
			if (self.collection.length) {
				self.$el
					.html(_.template(self.template, {typeName: self.typeName}).replace(/\s\s+/g, ''))
					.appendTo(APP.config.tmpl.resourcesContainer);
				self.update();
			}
			return self;
		},
		resize: function() {
			var self = this,
				$resources = $(APP.config.tmpl.resourcesContainer).removeAttr('style'),
				offsetResources = $resources.offset().top,
				heightWindow = APP.Chat.$el.height() - parseInt(APP.globals.document.css('padding-bottom')) - 1;
			$resources.css('height', (heightWindow - offsetResources - $(APP.config.tmpl.map).outerHeight(true)) +'px');
			self.$el.parent().trigger('scroll');
			return self;
		},
		renderListItem: function(model) {
			var item = new APP.MVC.View.Resource({model: model});
			return item.render().$el;
		}
	});
	/**
	 * Message item view in list
	 * @type {View}
	 * @const tagName
	 * @const className
	 * @const template
	 * @const events
	 * @method initialize
	 * @method render
	 *         @return {Object} this for chaining only
	 * @method check we'll trigger this method when user click on message
	 *         @return {Object} this for chaining only
	 * @method remove we'll trigger this method to remove message
	 *        @param {Object} e event object
	 *        @return {Object} this for chaining only
	 */
	APP.MVC.View.Msg = Backbone.View.extend({
		tagName: 'div',
		className: 'clearfix',
		template: $(APP.config.tmpl.msgTemplate).html(),
		events: {
			'click article:not(.service)': 'check',
			'click article .remove:not(.unactive)': 'remove',
			'click article .not-delivered': function(e) {APP.Chat.preventDefault(e)}
		},
		initialize: function() {
			var self = this;
			_.bindAll(self, 'render', 'check', 'remove');
			self.model.on('change', self.render, self);
		},
		render: function() {
			var self = this;
			if (self.model.has('hidden')) {self.$el.addClass('hidden'); return self}
			var item = APP.globals.session.getItem(APP.config.model.id);
			self.$el.removeClass('hidden founded').html(_.template(self.template, _.extend( {geo: ''}, self.model.toJSON() ) ).replace(/\s\s+/g, ''));
			if (self.model.has('founded')) self.$el.addClass('founded');
			if ((self.model.get('flag') === 5) || (APP.config.model.get('mtype') === 'drivers') || !(item && item.getUserAccess() & wialon.item.Unit.accessFlag.deleteMessages)) self.$el.find('.remove').addClass('unactive');
			if ((self.model.get('type') === 'outgoing') && self.model.has('status') && (self.model.get('status') === 'not-delivered')) {
				setTimeout(function() {if (self.model.get('status') === 'not-delivered') self.$el.find('.not-delivered').show(0)}, 30000);
			}
			return self;
		},
		check: function() {
			var self = this,
				item = APP.globals.session.getItem(APP.config.model.id),
				lastMsg = item && item.getLastMessage();
			if ( _.isEqual(lastMsg, self.model.get('raw')) ) {
				self.$el.addClass('lastmsg').siblings().removeClass('lastmsg');
			}
			self.$el.toggleClass('checked').siblings().removeClass('checked');
			return self;
		},
		remove: function(e) {
			var self = this,
				ml;
			if (self.$el.hasClass('lastmsg')) {
				APP.Chat.preventDefault(e);
			}
			else {
				if (e) APP.Chat.preventDefault(e);
				ml = APP.globals.session.getMessagesLoader();
				ml.deleteMessage(self.model.id, function(code) {
					if (code) {APP.Chat.message({message: __('Oh! We can\'t remove this message'), obj: wialon.core.Errors.getErrorText(code)}); return self}
					self.$el.removeClass('checked');
					if (self.model.has('founded')) self.model.unset('founded', {silent: true});
					self.model.set({'flag': 5, 'message': __('The message was removed')});
					APP.Msgs.resize();
				});

			}
			return self;
		}
	});
	/**
	 * Messages list view
	 * @type {View}
	 * @const el
	 * @const template
	 * @const events
	 * @method initialize
	 *         @param {Object} options
	 * @method render
	 *         @return {Object} this for chaining only
	 * @method update we'll trigger this method when collection reset
	 *         @return {Object} this for chaining only
	 * @method resize we'll trigger this method when document / window resized or we add / remove model from collection
	 * @method scrollTo triggered to scroll messages to the end or in specific value @val
	 *         @param {Number}
	 *         @return {Object} this for chaining only
	 * @method clear we'll trigger this method to clear submit form and smth else
	 *         @return {Object} this for chaining only
	 * @method renderListItem render function for only single model
	 *         @param {Model} model
	 * @method renderMsg render message data into model attributes
	 *         @param {Number} i index
	 *         @param {Number} d data
	 *         @return {Object} object with model attributes
	 * @method getMsgs we'll trigger this method to get messages for this unit / driver
	 *         @return {Object} this for chaining only
	 * @method getMessagesLoader
	 *         @param {Function} callback function with necessary data
	 * @method add we'll trigger this method when model added into collection
	 *         @return {Object} this for chaining only
	 * @method addSelf we'll trigger this method when we need to add model into collection after submit form
	 *         @param {Number} flag flag
	 *         @param {String} communication type of communication
	 *         @param {String} msg body of message
	 *         @return {Object} this for chaining only
	 * @method search we'll trigger this function to find out messages with specific parameters (filters)
	 *        @param {Object} e event object
	 *        @return {Object} this for chaining only
	 * @method export we'll trigger this function to export messages to xml
	 *        @param {Object} e event object
	 *        @return {Object} this for chaining only
	 * @method showOnMap we'll trigger this function to show sent coordinates from message on the map
	 *        @param {Object} e event object
	 *        @return {Object} this for chaining only
	 * @method switchSound we'll trigger this function to on / off sounds
	 *        @param {Object} e event object
	 *        @return {Object} this for chaining only
	 * @method check help submit function
	 *        @param {Object} e event object
	 *        @return {Object} this for chaining only
	 * @method typing help submit function
	 *        @param {Object} e event object
	 *        @return {Object} this for chaining only
	 * @method submit submit message function
	 *        @param {Object} e event object
	 *        @return {Object} this for chaining only
	 * @method getCursorPosition get position number in textarea field
	 *        @param {String} classname / ID textarea field
	 *        @return {Number} pos number
	 * @method setCursorPosition set position number in textarea field
	 *        @param {String} classname / ID textarea field
	 *        @param {Number} position to set cursor
	 *        @return {Object} this for chaining only
	 * @method choosePhone function to choose phone number
	 *        @param {Object} e event object
	 *        @return {Object} this for chaining only
	 * @method tooltip function to show tooltip
	 *        @param {Object} e event object
	 *        @return {Object} this for chaining only
	 * @method switchType function to change submit types (like communication or coordinates)
	 *        @param {Object} e event object
	 *        @return {Object} this for chaining only
	 * @method storeEnterKey function to store chosen option for submit "Enter" key
	 *        @param {Object} e event object
	 *        @return {Object} this for chaining only
	 */
	APP.MVC.View.Msgs = Backbone.View.extend({
		el: APP.config.tmpl.msgsContainer,
		template: $(APP.config.tmpl.msgsTemplate).html(),
		events: {
			'click .period': 'search',
			'click .filter': 'search',
			'click .export': 'export',
			'click .sent-coords': 'showOnMap',
			'click .phones span': 'choosePhone',
			'click .btn-tooltip': 'tooltip',
			'click .tooltip li:not(.disabled)': 'switchType',
			'click .btn-sound': 'switchSound',
			'click .button': 'submit',
			'keydown #msg-body': 'check',
			'keyup #msg-body': 'typing',
			'input #msg-body': 'typing',
			'propertychange #msg-body': 'typing',
			'change #cb-submit-type': 'storeEnterKey'
		},
		initialize: function(options) {
			var self = this;

			_.bindAll(self, 'render', 'update', 'add', 'resize', 'renderListItem', 'getMsgs', 'addSelf', 'search', 'showOnMap', 'switchSound', 'typing', 'submit', 'tooltip', 'switchType', 'choosePhone', 'storeEnterKey');
			self.options = options;
			self.collection.on({'reset': self.update, 'add': self.add}, self);
		},
		render: function() {
			var self = this,
				typeMsgArray = {},
				typeMsgCoordinates = {points: __('Points'), address: __('Address')};
			if (_.isUndefined(APP.config.model)) {APP.Chat.message({message: __('Oh! We can\'t fetch information')}); return self}
			function checkCustomMsg(type) {
				APP.Chat.cmd.check({
					cmd: 'custom_msg',
					type: type,
					success: function(cmd) {
						if (!_.isUndefined(cmd)) {
							APP.config.chat_cmd_msg[type] = cmd.n;
							typeMsgArray = (type === 'tcp') ? $.extend(true, typeMsgArray, {tcp: __('Chat')}) : $.extend(true, typeMsgArray, {gsm: __('SMS')});
						}
					}
				}, APP.config.model.id);
			}
			if (APP.config.model.has('possibility')) {
				if (APP.config.model.get('mtype') === 'units') {
					var possibility = APP.config.model.get('possibility'),
						allPossibilities = APP.config.model.get('possibilityInit'),
						types = ['tcp', 'gsm', 'vrt'];

					var tmp = null;
					_.forEach(possibility, function(val, key){
						if(allPossibilities[key]){
							tmp = val.concat(allPossibilities[key]);
							possibility[key] = _.uniq(tmp);
						}
					});
					$.each(types, function(i, val) {
						if (possibility[val] && (($.inArray('driver_msg', possibility[val]) !== -1) || ($.inArray('custom_msg', possibility[val]) !== -1))) {
							if ($.inArray('driver_msg', possibility[val]) !== -1) {
								APP.Chat.cmd.check({
									type: val,
									success: function(cmd) {
										if (_.isUndefined(cmd)) {
											// the command is created when the unit is selected for messaging
											APP.Chat.cmd.create({
												type: val,
												success: function(data) {},
												error: function() {
													checkCustomMsg(val);
												}
											}, APP.config.model.id);
										}
										else {
											APP.config.chat_cmd_msg[val] = cmd.n;
											switch(val){
												case "tcp":
													$.extend(true, typeMsgArray, {tcp: __('Chat')});
													break;
												case "gsm":
													$.extend(true, typeMsgArray, {gsm: __('SMS')});
													break;
												case "vrt":
												$.extend(true, typeMsgArray, {vrt: __('vrt')});
													break;
											}
										}
									},
									error: function() {checkCustomMsg(val);}
								}, APP.config.model.id);
							} else checkCustomMsg(val);
						}
					});
				} else typeMsgArray = {gsm: __('SMS')};
			}
			setTimeout(function() {
				var possibilities = APP.config.model.get('possibility');
				if(possibilities && (_.isUndefined(self.options.typeMsg)
					|| self.options.typeMsg === 'tcp'
					|| self.options.typeMsg === 'udp' ) ){
					if(possibilities.vrt && possibilities.vrt.length)
						self.options.typeMsg = 'vrt';
					else if(possibilities.tcp && possibilities.tcp.length)
						self.options.typeMsg = 'tcp';
					else if(possibilities.udp && possibilities.udp.length)
						self.options.typeMsg = 'udp';
				}
				if (_.isUndefined(self.options.typeMsg)) self.options.typeMsg = null;
				else if ($.inArray(self.options.typeMsg, _.keys(typeMsgArray)) === -1) self.options.typeMsg = null;
				self.$el.html(_.template(self.template, {
					name: APP.config.model.get('name'),
					phones: (!APP.config.model.has('phones') || _.isEmpty(APP.config.model.get('phones'))) ? '<span class="phones" />' : '<span class="phones"><span>'+ APP.config.model.get('phones').join('</span><span>') +'</span></span>',
					icon: APP.config.model.get('icon'),
					optFilter: self.options.filter,
					optPeriod: self.options.period,
					optTypeMsg: self.options.typeMsg,
					typeMsgArray: typeMsgArray
				}).replace(/\s\s+/g, ''));
				APP.Chat.translate(self.$el);
				if (APP.Chat.cookie.get(APP.config.chat_cookie_enterkey +'_'+ APP.globals.userID)) $(APP.config.tmpl.cbSubmitType).prop('checked', true);
				self.clear();
				if ($(APP.config.tmpl.splashContainer).is(':visible')) $(APP.config.tmpl.splashContainer).hide(0);
			}, 500);
			return self;
		},
		update: function() {
			var self = this,
				$history = self.$el.find('.history').empty(),
				count = self.collection.length;
			if (count) {
				var prevDate = null,
					date;
				self.collection.each(function(msg, index) {
					date = msg.get('date');
					if (!_.isNull(date) && (date !== prevDate)) {
						prevDate = date;
						var d = new Date(),
							additional;
						switch (date) {
							case wialon.util.DateTime.formatTime(Math.ceil((d.setDate(d.getDate()) + wialon.util.DateTime.getTimezoneOffset()) / 1000), 2, APP.config.format.date): additional = __('Today') +' ';
							break;
							case wialon.util.DateTime.formatTime(Math.ceil((d.setDate(d.getDate() - 1) + wialon.util.DateTime.getTimezoneOffset()) / 1000) + wialon.util.DateTime.getTimezoneOffset(), 2, APP.config.format.date): additional = __('Yesterday') +' ';
							break;
							default: additional = '';
						}
						$history.append('<div class="date">'+ additional + date +'</div>');
					}
					$history.append(self.renderListItem(msg));
					if (index === (count - 1)) {
						APP.config.model.trigger('change:possibility');
						APP.Chat.translate($history);
						self.resize().scrollTo();
						if (!_.isUndefined(APP.msgsSearch)) APP.msgsSearch.undelegateEvents();
						APP.msgsSearch = new APP.MVC.View.msgsSearch({collection: self.collection});
						setTimeout(function() {
							if (!_.isUndefined($(APP.config.tmpl.msgsSearch)) && ($(APP.config.tmpl.msgsSearch).val() !== '')) APP.msgsSearch.search($(APP.config.tmpl.msgsSearch).val().toString().toLowerCase());
						}, 500);
					}
				});
			} else {
				APP.config.model.trigger('change:possibility');
				APP.Chat.translate($history);
				self.resize().scrollTo();
			}
			return self;
		},
		resize: function() {
			var self = this,
				$history = $(APP.config.tmpl.msgsContainer).find('.history'),
				heightWindow = APP.Chat.$el.height() - parseInt(APP.globals.document.css('padding-bottom')) - 1;
			$(APP.config.tmpl.tooptip).hide();
			if ($history.length) {
				var offsetChat = $(APP.config.tmpl.msgsContainer).offset().top + $(APP.config.tmpl.msgsContainer).outerHeight(true) + $(APP.config.tmpl.msgsFilters).outerHeight(true) + 50,
					offsetTop = $history[0].scrollTop;
				$history.removeAttr('style');
				if (APP.config.model.has('possibility')) offsetChat += $(APP.config.tmpl.msgForm).outerHeight(true) + $(APP.config.tmpl.msgsControls).outerHeight(true);
				if ((heightWindow - offsetChat) < $history.outerHeight(true)) $history.css('height', (heightWindow - offsetChat) +'px');
				self.scrollTo(0).scrollTo(offsetTop);
			}
			return self;
		},
		scrollTo: function(val) {
			var self = this,
				$history = $(APP.config.tmpl.msgsContainer).find('.history');
			if ($history.length) $history.scrollTop(_.isUndefined(val) ? $history[0].scrollHeight : val);
			return self;
		},
		clear: function( clear ) {
			var self = this;
			if (_.isUndefined(APP.config.model)) {APP.Chat.message({message: __('Oh! We can\'t fetch information')}); return self;}
			$.when(APP.Chat.getAccountData()).done(function() {
				$(APP.config.tmpl.smsCounter).text(__('%%c%% SMS', {'c': ((APP.globals.smsCounter > 0) ? APP.globals.smsCounter : 0)}));
				if ( clear ){
					$(APP.config.tmpl.msgTextarea).val('');
				}
				var symbols = 0;
				if( ! $(APP.config.tmpl.msgTextarea).val()){
					$(APP.config.tmpl.msgButton).prop('disabled', true);
				}else
					symbols = $(APP.config.tmpl.msgTextarea).val().length;

				if (_.isNull(self.options.typeMsg)) {
					$(APP.config.tmpl.msgTextarea).prop('disabled', true);
					$(APP.config.tmpl.msgCounter).prop('disabled', true);
				} else {
					$(APP.config.tmpl.msgTextarea).prop('disabled', false);
					$(APP.config.tmpl.msgCounter).prop('disabled', false);
					if (self.options.typeMsg === 'gsm'){
						if( APP.globals.smsCounter == 0 || clear ){
							$(APP.config.tmpl.msgCounter).attr('data-content', __('Remaining') +' '+ __('%%r%% symbols', {'r': symbols}) +' (0 '+ __('SMS') +')');
						}
					}
					else
						$(APP.config.tmpl.msgCounter).attr('data-content', __('%%r%% symbols', {'r': symbols}));
				}
			});
			if (!_.isUndefined(APP.msgsSearch)) APP.msgsSearch.undelegateEvents();
			APP.msgsSearch = new APP.MVC.View.msgsSearch({collection: self.collection});
			setTimeout(function() {
				if (!_.isUndefined($(APP.config.tmpl.msgsSearch)) && ($(APP.config.tmpl.msgsSearch).val() !== '')) APP.msgsSearch.search($(APP.config.tmpl.msgsSearch).val().toString().toLowerCase());
			}, 500);
			return self;
		},
		renderListItem: function(model) {
			var msg = new APP.MVC.View.Msg({model: model});
			return msg.render().$el;
		},
		renderMsg: function(i, d) {
			var self = this,
				phones = APP.config.model.get('phones');
			if ((d.tp !== 'us') && !((d.tp === 'xx') && ($.inArray(d.p.phone, phones) !== -1) && (d.f === 2305 || d.f === 2304)) && !(d.tp === 'ud' && (d.p.text || d.p.image || d.f & 16)) && !(d.tp === 'ucr' && (d.cn === 'driver_msg' || d.cn === 'custom_msg' || d.cn === 'send_position'))) return false;
			if (!_.isUndefined(self.options.filter) && (self.options.filter !== 'all') && (((self.options.filter !== 'incoming') && ((d.tp === 'ud') || (d.tp === 'us') || (d.tp === 'xx' && d.f === 2304))) || ((self.options.filter !== 'outgoing') && ((d.tp === 'ucr') || (d.tp === 'xx' && d.f === 2305))))) return false;
			var item = APP.globals.session.getItem(APP.config.model.id),
				type = 'outgoing',
				communication = 'tcp',
				flag = 1,
				date = d.t ? wialon.util.DateTime.formatTime(d.t, 2, APP.config.format.date) : null,
				msg = '';
			if (d.tp === 'xx') {
				communication = 'sms';
				var escapedText = _.escape(d.p.sms_text);
				if (d.f === 2304) type = 'incoming';
				if (d.p.sms_text && wialon.util.String.isValidText(escapedText)) {
					msg = escapedText;
				}
			} else if (d.tp === 'ud') {
				type = 'incoming';
				if (d.f & 16) {
					flag = 4;
					msg = 'SOS';
				} else if (item && d.p.image) {
					flag = 2;
					var url = item.getMessageImageUrl(d.t, 0, 1);
					msg = '<a href="'+ url +'" target="_blank" class="img-msg" style="background-image:url('+ url +')"><img src="'+ url +'" title="Message Image '+ d.t +'" class="invisible" /></a>';
				} else if (d.p.text) msg = _.escape(d.p.text);
			} else if ((d.tp === 'us') && (d.st && wialon.util.String.isValidText(d.st))) {
				type = 'incoming';
				communication = 'sms';
				msg = _.escape(d.st);
			} else if ((d.tp === 'ucr') && d.cp && (d.cn === 'send_position')) {
				var coordsData = d.cp.split('|');
				flag = 3;
				msg = (!coordsData[3].match(APP.config.chat_cmd_coords_regexp)
					? '<i>' + coordsData[3] + '</i>'
					: '<i>'+ __('Sent coordinates') +'</i>: '+ coordsData[3]) +
				'<br /><a href="#" class="sent-coords" data-coords="'+ coordsData[0] +'|'+ coordsData[1] +'">'+ __('Show on map') +'</a>';
			} else if (d.cp) {
				if (d.lt === 'gsm') communication = 'sms';
				msg = d.cp;
			}
			return {
				mtype: 'msgs',
				id: i,
				date: date ? date : '',
				time: d.t ? wialon.util.DateTime.formatTime(d.t, 2, APP.config.format.time) : '',
				timestamp: d.t,
				type: type,
				communication: communication,
				flag: flag,
				message: msg,
				raw: d
			};
		},
		_getLocations: function( models, cb ) {
			var coords = [];
			_.forEach( models, function( m ) {
				var raw = m.get( 'raw' );
				coords.push( {
					lat: raw.pos ? raw.pos.y : null,
					lon: raw.pos ? raw.pos.x : null
				} )
			} );
			wialon.util.Gis.getLocations( coords, function( code, result ) {
				if ( !code ) {
					_.forEach( models, function( m, i ) {
						m.set('geo', result[i] || '' );
					} );
				}
				cb();
			} );
		},
		getMsgs: function() {
			var self = this;
			self.getMessagesLoader(function(data, code) {
				var count = data.length,
					models = [],
					needGeos = [];
				$.each(data, function(i, d) {
					d.f = d.f & 0x3fffffff;
					var model = self.renderMsg(i, d);
					if (model){
						var messageModel = new APP.MVC.Model.Msg(model);
						if ( model.flag === 2 ) {
							needGeos.push( messageModel );
						}
						models.push( messageModel );
					}
				});
				var renderMessages = function( models ) {
					APP.MVC.Collection.Msgs.reset(models);
					if (code) {
						var $history = self.$el.find('.history');
						$history.append(_.template($(APP.config.tmpl.info).html(), {text: __('History is not available')}).replace(/\s\s+/g, '')); // we'll create service message
						self.resize();
						if (($history[0].scrollTop + Math.ceil($history.height() * 1.5)) >= $history[0].scrollHeight) self.scrollTo();
					}
				};
				if ( needGeos.length ) {
					self._getLocations( needGeos, function() {
						renderMessages( models );
					} );
				} else {
					renderMessages( models );
				}
			});
			return self;
		},
		getMessagesLoader: function(callback) {
			var self = this,
				d = new Date(),
				to = APP.globals.session.getServerTime(),
				ml = APP.globals.session.getMessagesLoader(),
				from = d.setHours(0, 0, 0, 0),
				spec, id, mask;
			if (!_.isNull(self.options.period)) {
				switch (self.options.period) {
					case 'yesterday': from = d.setDate(d.getDate() - 1); break
					case 'week': from = d.setDate(d.getDate() - ((d.getDay() === 0) ? -7 : (d.getDay() - 1)) + ((APP.config.format.wd === 7) ? -1 : 0)); break
					case 'month': from = d.setMonth(d.getMonth() - 1); break
					default: from = 0
				}
			}
			from = Math.ceil(from / 1000);
			APP.Chat.log.start(__('Loading messages'));
			NProgress.start();
			$('#nprogress').appendTo('header');
			if (APP.config.model.has('mtype') && (APP.config.model.get('mtype') === 'units')) {
				id = APP.config.model.id;
				spec = wialon.item.Item.messageFlag.typeUnitCmd | wialon.item.Item.messageFlag.typeUnitSMS;
				mask = 0;
			} else {
				id = APP.config.model.get('rid');
				spec = wialon.item.Item.messageFlag.typeDriverSMS;
				mask = wialon.item.Item.messageFlag.typeMask;
			}
			function errorLoad(code, data) {
				NProgress.set(1);
				NProgress.done();
				APP.Chat.log.end(__('Loading messages'));
				if (code) data = {};
				else code = 0;
				callback && callback(data, code);
			};
			ml.unload(function(code) {
				if (code) {errorLoad(code); return}
				if (APP.config.model.collection === APP.MVC.Collection.Drivers) {
					var item = APP.globals.session.getItem(APP.config.model.get('rid'));
					if (!(item && item.getUserAccess() & wialon.item.Resource.accessFlag.viewNotifications)) {errorLoad(4); return}
				}
				ml.loadInterval(id, from, to, spec, mask, 0, function(code, data) {
					if (code) {errorLoad(code); return}
					ml.getMessages(0, data.count, function(code, data) {errorLoad(code, data)});
				});
			});
		},
		add: function() {
			var self = this,
				msg = APP.MVC.Collection.Msgs.last(),
				$history = self.$el.find('.history'),
				model;
			$history.append(self.renderListItem(msg));
			self.resize();
			if (($history[0].scrollTop + Math.ceil($history.height() * 1.5)) >= $history[0].scrollHeight) self.scrollTo();
			if (msg.get('flag') === 5) return self;
			model = APP.config.model.clone();
			if (model.has('possibilityInit')) model.unset('possibilityInit', {silent: true});
			if (model.has('eventID')) model.unset('eventID', {silent: true});
			if (model.has('eventIDChangeLastMessage')) model.unset('eventIDChangeLastMessage', {silent: true});
			if (model.has('timerID')) model.unset('timerID', {silent: true});
			APP.MVC.Collection.Latest.unshift(model, {merge: true});
			APP.Chat.translate($history).savePrevState(model.id);
			return self;
		},
		addSelf: function(flag, communication, msg, withMessage) {
			var self = this,
				time = APP.globals.session.getServerTime(),
				offset = Math.ceil(wialon.util.DateTime.getTimezoneOffset() / 1000),
				model = {
					mtype: 'msgs',
					date: wialon.util.DateTime.formatTime(time + offset, 2, APP.config.format.date),
					time: wialon.util.DateTime.formatTime(time + offset, 2, APP.config.format.time),
					timestamp: time,
					type: 'outgoing',
					communication: (communication === 'gsm') ? 'sms' : 'tcp',
					flag: flag,
					message: msg,
					status: 'not-delivered'
				},
				message;
			if (APP.globals.audioTagSupport && APP.config.sounds.available) {
				APP.globals.outgoingSound.currentTime = 0;
				playSound(APP.globals.outgoingSound);
			}
			if (APP.config.model.get('mtype') === 'units') {
				var item = APP.globals.session.getItem(APP.config.model.id);
				if (!(item && item.getUserAccess() & wialon.item.Item.accessFlag.execReports)) {
					self.clear();
					withMessage(message);
					return self;
				}
				$(APP.config.tmpl.msgTextarea).val('');
			} else {
				var item = APP.globals.session.getItem(APP.config.model.get('rid'));
				if (!(item && item.getUserAccess() & wialon.item.Resource.accessFlag.viewNotifications)) {
					self.clear();
					withMessage(message);
					return self;
				}
			}
			message = new APP.MVC.Model.Msg(model);
			APP.MVC.Collection.Msgs.add(message);
			self.clear();
			withMessage(message);
			return self;
		},
		search: function(e) {
			if (e) APP.Chat.preventDefault(e);
			var self = this,
				$this = $(e.target),
				filter = $this.hasClass('period') ? $this.data('period') : $this.data('filter');
			if (_.isUndefined(filter)) {APP.Chat.message(); return self}
			if ($this.hasClass('period')) self.options.period = filter;
			else self.options.filter = filter;
			$this.addClass('active').siblings().removeClass('active');
			self.getMsgs();
			return self;
		},
		export: function(e) {
			if (e) APP.Chat.preventDefault(e);
			var self = this,
				output = '',
				collection = _.reject(self.collection.models, function(model) {return model.get('flag') === 5}),
				count = collection.length;
			if (count > 0) {
				var msgs = '';
				$.each(collection, function(index, msg) {
					if (!msg.has('hidden')) {
						msgs += _.template($(APP.config.tmpl.xmlItemTemplate).html(), {
							timestamp: msg.has('timestamp') ? msg.get('timestamp') : '',
							type: msg.has('type') ? msg.get('type') : '',
							communication: msg.has('communication') ? msg.get('communication') : '',
							flag: msg.has('flag') ? msg.get('flag') : '',
							msg: msg.has('message') ? _.escape(msg.get('message')) : '',
						});
					}
					if (index === (count - 1)) {
						if (msgs === '') {APP.Chat.message({message: __('There are no message to export')}); return self}
						output = _.template($(APP.config.tmpl.xmlItemsTemplate).html(), {
							comments: __('XML comments'),
							name: APP.config.model.get('name'),
							phones: _.isEmpty(APP.config.model.get('phones')) ? '' : APP.config.model.get('phones').join(', '),
							type: APP.config.model.get('mtype'),
							msgs: msgs,
						}).replace(/\s\s+/g, '');
						window.location = 'data:application/octet-stream;base64;charset=utf-8,'+ window.btoa(unescape(encodeURIComponent(output)));
					}
				});
			} else APP.Chat.message({message: __('There are no message to export')});
			return self;
		},
		showOnMap: function(e) {
			if (e) APP.Chat.preventDefault(e);
			var self = this,
				coordinates = $(e.target).data('coords');
			if (_.isUndefined(coordinates)) {APP.Chat.message({message: 'Oh! We can\'t fetch information'}); return self}
			coordinates = coordinates.split('|');
			if (_.isUndefined(APP.MAP)) APP.MAP = new APP.MVC.View.Map();
			APP.MAP.clean().marker = new L.marker([coordinates[0], coordinates[1]], {clickable: false, riseOnHover: true, icon: APP.MAP.markerIcon}).addTo(APP.MAP.map);
			if ($(APP.config.tmpl.resources).not('.shown')) {
				var date = new Date();
				date.setTime(date.getTime() + (365 * 24 * 3600 * 1000));
				APP.Chat.cookie.set(APP.config.chat_cookie_resources +'_'+ APP.globals.userID, 'true', date);
				$(APP.config.tmpl.resources).addClass('shown');
			}
			if ($(APP.config.tmpl.mapOverview).is(':hidden')) APP.MAP.toggle();
			APP.MAP.map.setZoom(6).fitBounds([APP.MAP.marker.getLatLng()]).setZoom(15);
			return self;
		},
		switchSound: function(e) {
			if (e) APP.Chat.preventDefault(e);
			$(e.target).toggleClass('muted');
			APP.config.sounds.available = (APP.config.sounds.available) ? false : true;
			return self;
		},
		check: function(e) {
			var self = this,
				$textarea = $(APP.config.tmpl.msgTextarea),
				string = $.trim($textarea.val()),
				checked = $(APP.config.tmpl.cbSubmitType).prop('checked');
			$(APP.config.tmpl.msgsContainer).find('.history .checked').removeClass('checked');
			self.submitted = false;
			if (e && ((e.which === 13) || (e.keyCode === 13))) {
				APP.Chat.preventDefault(e);
				if ((checked && !e.ctrlKey && !e.shiftKey) || (!checked && (e.ctrlKey || e.shiftKey))) {
					if (string.length !== 0) self.submit().submitted = true;
				} else $textarea.val(string +'\n').scrollTop($textarea[0].scrollHeight);
			}
			return true;
		},
		typing: function(e, force) {
			var self = this,
				string = $.trim($(APP.config.tmpl.msgTextarea).val());
			if (self.submitted) return self;
			if ( !force ) {
				if ((string.length === 0) && (e && !((e.which === 13) || (e.which === 16) || (e.which === 17) || (e.keyCode === 13) || (e.keyCode === 16) || (e.keyCode === 17) || e.ctrlKey || e.shiftKey)) ) {self.clear(); return self}
				if(e && e.keyCode == 38 ) {
					return true;
				}
			}
			$(APP.config.tmpl.msgButton).prop('disabled', false);
			var len = string.length,
				d = (string && string.search(/[^a-z0-9\.\,\;\:\'\?\!\n\t\v\"\{\}\[\]\(\)\-\+\*\&\^\%\$\#\@\~\=\/\_\|\<\> \0]/i) >= 0 ? 70 : 160),
				count = (string ? APP.Chat.atoui(len / d) : 0),
				offset = (count > 0 ? count * 3 : 0);
			if (self.options.typeMsg === 'gsm') {
				var countSms = string ? APP.Chat.atoui((len + offset) / d + 1) : 0;
				if( APP.globals.smsCounter < countSms && APP.globals.smsCounter > 0){
					var st = string.slice(0, APP.globals.smsCounter * d + offset );
					$(APP.config.tmpl.msgTextarea).val(st);
					countSms = APP.globals.smsCounter;
				}
				$(APP.config.tmpl.msgCounter).attr('data-content', __('Remaining') +' '+ __('%%r%% symbols', {'r': (d * (count + 1) - len)}) +' ('+ (countSms) +' '+ __('SMS') +')');
			}else{
				$(APP.config.tmpl.msgCounter).attr('data-content', __('%%r%% symbols', {'r': len}));
			}
			return self;
		},
		submit: function(e) {
			if (e) APP.Chat.preventDefault(e);
			var self = this;
			if (_.isNull(APP.Msgs.options.typeMsg)) {APP.Chat.message({message: __('Not enought rights or something else bad')}); return self}

			var msg = $.trim($(APP.config.tmpl.msgTextarea).val()),
				phone = null,
				options = {type: APP.Msgs.options.typeMsg, data: msg};

			if(!msg)
				return;

			function storedCmds(type) {
				var item = APP.globals.session.getItem(APP.config.model.id);

				if (!_.isNull(item)) {
					var cmds = item.getCommands();
					if (_.size(cmds)) {
						var founded = false;
						_.each(cmds, function(cmd) {
							if ($.inArray(type, cmd.t.split(',')) !== -1) {
								if ((cmd.c === 'driver_msg') || (cmd.c === 'custom_msg')) {
									APP.config.chat_cmd_msg[type] = cmd.n;
									founded = true;
									return false;
								}
							}
						});
						if (founded){
							APP.Chat.cmd.send(false, options);
						}
					}
				}
			}
			var selectedModel = APP.config.model;
			var item = APP.globals.session.getItem(selectedModel.id);
			var _possibility = selectedModel.get('_possibility');
			var typeCmd = APP.Msgs.options.typeMsg;
			if (!_.isNull(item)) {
				var cmds = item.getCommands();
				if (_.size(cmds)) {

					var hasGPRS = function(unit, cmds) {
						if (!cmds)
							return 0;
						for (var i = 0; i < cmds.length; i++) {
							if (cmds[i].t.indexOf("tcp") != -1 || cmds[i].t.indexOf("udp") != -1)
								return 1;
						}
						return 0;
					};
					if ( !( item.getNetConn() || hasGPRS(item, cmds) ) && !_possibility[typeCmd] ) {
						APP.Msgs.options.typeMsg = 'vrt';
						options.type = 'vrt';
					}
				}
			}
			// New created message
			var message;
			self.addSelf(1, APP.Msgs.options.typeMsg, _.escape(msg), function(newMsg) {
				message = newMsg;
				APP.globals.lastSendMessage = message;
			});
			if (selectedModel.get('mtype') === 'units') {
				APP.Chat.cmd.check({
					type: APP.Msgs.options.typeMsg,
					success: function(cmd) {
						if (_.isUndefined(cmd)) {
							APP.Chat.cmd.check({
								cmd: 'custom_msg',
								type: APP.Msgs.options.typeMsg,
								success: function(cmd) {
									if (_.isUndefined(cmd)) storedCmds(APP.Msgs.options.typeMsg);
									else APP.Chat.cmd.send(cmd.id, $.extend(true, options, {
										success: function(data) {
											if (message) message.set('status', 'delivered', {silent: true});
										}
									}), cmd);
								},
								error: function() {storedCmds(APP.Msgs.options.typeMsg)}
							}, selectedModel.id);
						} else APP.Chat.cmd.send(cmd.id, options, cmd);
					},
					error: function() {
						APP.Chat.cmd.check({
							cmd: 'custom_msg',
							type: APP.Msgs.options.typeMsg,
							success: function(cmd) {
								if (_.isUndefined(cmd)) storedCmds(APP.Msgs.options.typeMsg);
								else APP.Chat.cmd.send(cmd.id, options, cmd);
								if (message) message.set('status', 'delivered', {silent: true});
							},
							error: function() {storedCmds(APP.Msgs.options.typeMsg)}
						}, selectedModel.id);
					}
				}, selectedModel.id);
			} else {
				var possibility = selectedModel.get('possibility');
				if (!_.isUndefined(possibility.phone)) {
					options = $.extend(true, options, {
						phone: possibility.phone,
						success: function(data) {
							if (message){
								message.set('status', 'delivered', {silent: true});
								self.clear(true);
							}
						}
					});
					APP.Chat.sms.send(options);
				}
			}
			return self;
		},
		getCursorPosition: function(selecter) {
			var el = $(selecter)[0],
				pos = 0;
			if ('selectionStart' in el) pos = el.selectionStart;
			else if ('selection' in document) {
				el.focus();
				var sel = document.selection.createRange(),
					length = sel.text.length;
				sel.moveStart('character', -el.value.length);
				pos = sel.text.length - length;
			}
			return pos;
		},
		setCursorPosition: function(selecter, pos) {
			var self = this,
				el = $(selecter)[0];
			if (el.length === 0) return self;
			function adjustOffset(el, offset) {
				var val = el.value,
					newOffset = offset;
				if (val.indexOf('\r\n') > -1) {
					var matches = val.replace(/\r\n/g, '\n').slice(0, offset).match(/\n/g);
					newOffset += matches ? matches.length : 0;
				}
				return newOffset;
			};
			if ('createTextRange' in el) {
				var range = el.createTextRange();
				range.collapse(true);
				range.moveStart('character', pos);
				range.moveEnd('character', pos);
				range.select();
			} else if ('setSelectionRange' in el) {
				el.focus();
				pos = adjustOffset(el, pos);
				el.setSelectionRange(pos, pos);
			}
			return self;
		},
		choosePhone: function(e) {
			if (e) APP.Chat.preventDefault(e);
			if (!APP.config.model.has('possibility')) return self;
			var $this = $(e.target),
				phone = $this.text(),
				possibility = APP.config.model.get('possibility');
			if (_.isString(phone)) {
				possibility = $.extend(true, possibility, {phone: phone});
				APP.config.model.set('possibility', possibility, {silent: true});
				$this.addClass('active').siblings().removeClass('active');
			}
			return self;
		},
		tooltip: function(e) {
			if (e) APP.Chat.preventDefault(e);
			var self = this,
				$this = $(e.target),
				data = $this.data('tooltip');
			if (_.isUndefined(data)) return self;
			var $tooltip = $('#'+ data);
			if ($tooltip.is(':hidden')) {
				var offset = $this.position(),
					left = offset.left + Math.ceil($this.outerWidth(true) / 2) - Math.ceil($tooltip.outerWidth(true) / 2),
					top = offset.top - $tooltip.outerHeight(true) - 5;
				$('.tooltip').hide();
				$tooltip.css({left: left, top: top}).show();
			} else $tooltip.hide();
			return self;
		},
		switchType: function(e) {
			if (e) APP.Chat.preventDefault(e);
			var self = this,
				$this = $(e.target),
				$tooltip = $this.closest('.tooltip'),
				data = $this.data('type');
			var changeType = 0;
			if( data !== self.options.typeMsg ) {
				changeType = 1;
			}
			self.options.typeMsg  = data;
			if( changeType ) {
				var $el = this.$(APP.config.tmpl.msgTextarea);
				self.typing( $el, 1 );
			}
			self.options.selectType = data;
			if (_.isUndefined(data)) return self;
			if ($tooltip.attr('id') === 'tooltipTypeMsg') {
				$('#btn-tooltipTypeMsg').text($this.text());
				self.options.typeMsg = self.options.typeMsg == 'vrt' ? 'vrt' : data;
				if (self.options.typeMsg === 'gsm') $(APP.config.tmpl.smsCounter).show(0);
				else $(APP.config.tmpl.smsCounter).hide(0);
			}
			$tooltip.hide();
			$this.addClass('active').siblings().removeClass('active');
			return self;
		},
		storeEnterKey: function(e) {
			if (e) APP.Chat.preventDefault(e);
			var self = this;
			if ($(APP.config.tmpl.cbSubmitType).prop('checked')) {
				var date = new Date();
				date.setTime(date.getTime() + (365 * 24 * 3600 * 1000));
				APP.Chat.cookie.set(APP.config.chat_cookie_enterkey +'_'+ APP.globals.userID, true, date);
			} else APP.Chat.cookie.set(APP.config.chat_cookie_enterkey +'_'+ APP.globals.userID, null, new Date(0));
			return self;
		}
	});
	/**
	 * Map View
	 * @type {View}
	 * @const el
	 * @const events
	 * @method initialize
	 * @method render
	 *         @return {Object} this for chaining only
	 * @method clean we'll trigger this method for map clearance
	 *         @return {Object} this for chaining only
	 * @method toggle we'll trigger this method to hide / show map
	 *        @param {Object} e event object
	 *        @return {Object} this for chaining only
	 * @method prepareLink we'll trigger this method to pass the url of the link to the callback
	 *        @param {Object} options
	 *        @return {Object} this for chaining only
	 * @method dblclick we'll trigger when user twice click on resource (geofence) item in the list
	 *        @param {Object} e event object
	 *        @return {Object} this for chaining only
	 * @method sendCoordinates we'll trigger to send coordinates
	 *        @param {Object} coordinates map coordinates
	 *        @return {Object} this for chaining only
	 * @method sendAddress we'll trigger to send address
	 *        @param {String} string address
	 *        @return {Object} this for chaining only
	 */
	APP.MVC.View.Map = Backbone.View.extend({
		el: APP.config.tmpl.map,
		events: {'click a': 'toggle'},
		initialize: function() {
			var self = this;
			_.bindAll(self, 'render', 'clean', 'toggle', 'prepareLink', 'dblclick', 'sendCoordinates', 'sendAddress');
			self.render();
		},
		render: function() {
			var self = this,
				map = APP.config.tmpl.mapOverview.slice(1),
				gis_url = APP.globals.session.getBaseGisUrl(),
				gurtam = L.tileLayer.webGis(gis_url, {attribution: APP_CONFIG.alias_webgis || "Gurtam Maps", minZoom: 6, userId: APP.globals.userID, sessionId: APP.globals.session.getId()}),
				osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://osm.org/copyright" target="_blank">OpenStreetMap</a> contributors &nbsp;'}),
				city = APP.globals.user.getCustomProperty('city', APP.config.default_city);
			self.markerIcon = L.icon({
				iconUrl: APP.config.markerIconUrl,
				iconSize: [32, 44],
				iconAnchor: [16, 44],
				shadowUrl: APP.config.markerShadowUrl,
				shadowSize: [41, 41],
				shadowAnchor: [12, 41]
			});
			self.markerIconUnit = L.Icon.extend({options: {}});
			self.map = L.map(map, {zoom: 13, layers: [gurtam]});

			if (!hiddenOSM) {
				var layers = {};
				layers[APP_CONFIG.alias_webgis || "Gurtam Maps"] = gurtam;
				layers["OpenStreetMap"] = osm;
				L.control.layers(layers).addTo(self.map);
			}
			wialon.util.Gis.searchByString(city, 0x800, 10, function(code, data) {
				if (code || !(data.length && data[0].items.length)) {return}
				APP.globals.default_coordinates = data[0].items[0];
				self.map.setView(new L.LatLng(APP.globals.default_coordinates.y, APP.globals.default_coordinates.x), 11);
			});
			return self;
		},
		clean: function() {
			var self = this;
			$.each([self.marker, self.obj], function(i, val) {if (val) {self.map.removeLayer(val); val = null}});
			self.map.setView(new L.LatLng(APP.globals.default_coordinates.y, APP.globals.default_coordinates.x), 11);
			return self;
		},
		toggle: function(e) {
			if (e) APP.Chat.preventDefault(e);
			var self = this;
			$(APP.config.tmpl.mapOverview).prev('a').toggleClass('closed');
			self.map.invalidateSize();
			if (APP.Geofences) APP.Geofences.resize();
			return self;
		},
		prepareLink: function(options) {
			var self = this,
				defaults = {url: null, pass: $.noop};
			options = $.extend(true, defaults, options);
			if (_.isNull(options.url)) {options.error(); return self}

			options.pass(options.url);

			return self;
		},
		dblclick: function(e) {
			var self = this;
			if (_.isUndefined(APP.Msgs)) {
				return self;
			}
			if (_.isNull(APP.Msgs.options.typeMsg)) {APP.Chat.message({message: __('Not enought rights or something else bad')}); return self}
			var coordinates = e.target.getLatLng();
			wialon.util.Gis.getLocations([{lat: coordinates.lat, lon: coordinates.lng}], function(code, locations) {
				if (code || locations.length === 0) {APP.Chat.message({message: __('Oh! We can\'t fetch information'), obj: wialon.core.Errors.getErrorText(code)}); return}
				self.sendCoordinates([{x: coordinates.lng, y: coordinates.lat}], locations[0]);
			});
			return self;
		},
		sendCoordinates: function(coordinates, text) {
			var self = this;
			if(APP.config.model){
				var possibilities = APP.config.model.get('possibility');
				if (possibilities.vrt && possibilities.vrt.length) {
					APP.Msgs.options.typeMsg = 'vrt';
				} else if (possibilities.tcp && possibilities.tcp.length) {
					APP.Msgs.options.typeMsg = 'tcp';
				} else {
					APP.Msgs.options.typeMsg = 'udp';
				}
			}
			var type = APP.Msgs.options.typeMsg || 'udp';
			if (_.isUndefined(coordinates) || (_.isEmpty(coordinates))) {APP.Chat.message({message: __('Oh! Unfortunately, we can\'t send coordinates')}); return self}
			function simpleSend() {
				self.prepareLink({
					url: wialon.util.String.sprintf('https://maps.google.com/maps?q=%s,%s', coordinates[0].y, coordinates[0].x),
					pass: function(data) {
						if (_.isUndefined(data)) {APP.Chat.message({message: __('Oh! Unfortunately, we can\'t send coordinates'), obj: data}); return}
						var value = $(APP.config.tmpl.msgTextarea).val(),
							pos = APP.Msgs.getCursorPosition(APP.config.tmpl.msgTextarea);
						$(APP.config.tmpl.msgTextarea).val(value.substr(0, pos) + data + value.substr(pos));
						APP.Msgs.submitted = false;
						APP.Msgs.setCursorPosition(APP.config.tmpl.msgTextarea, (pos + data.length)).typing();
					},
				});
			};
			function complexSend(id, cmd) {
				var msg = (text
						? '<i>' + text + '</i>'
						: '<i>' + __('Sent coordinates') +'</i>: '+ coordinates[0].y +'; '+ coordinates[0].x) +
					'<br /><a href="#" class="sent-coords" data-coords="'+ coordinates[0].y +'|'+ coordinates[0].x +'">'+ __('Show on map') +'</a>';
				// New created message
				var message;
				APP.Msgs.addSelf(3, type, msg, function(newMsg) {
					message = newMsg;
				});

				APP.Chat.cmd.send(id, {
					name: APP.config.chat_cmd_coords[type],
					type: type,
					data: coordinates[0].y +'|'+ coordinates[0].x +'|'+ __(text ? 'Sent address' : 'Sent coordinates') +'|'+ (text ? text : coordinates[0].y +'; '+ coordinates[0].x),
					success: function(){
						if (message) message.set('status', 'delivered', {silent: true});
					},
					error: $.proxy(APP.Chat, 'message', {message: __('Not enought rights or something else bad')})
				}, cmd);
			};
			function storedCmds(type) {
				var item = APP.globals.session.getItem(APP.config.model.id);
				if (!_.isNull(item)) {
					var cmds = item.getCommands();
					if (_.size(cmds)) {
						var founded = false;
						_.each(cmds, function(cmd) {
							if ($.inArray(type, cmd.t.split(',')) !== -1) {
								if (cmd.c === 'send_position') {
									APP.config.chat_cmd_coords[type] = cmd.n;
									founded = true;
									return false;
								}
							}
						})
						if (founded) complexSend(false);
						else simpleSend();
					}
				}
			};
			if (APP.config.model.collection === APP.MVC.Collection.Drivers) simpleSend();
			else {
				APP.Chat.cmd.check({
					cmd: 'send_position',
					type: type,
					success: function(cmd) {
						if (_.isUndefined(cmd)) {
							APP.Chat.cmd.create({
								cmd: 'send_position',
								type: type,
								name: APP.config.chat_cmd_coords[type],
								success: function(cmd) {
									if (_.isUndefined(cmd)) storedCmds(type);
									else {
										APP.config.chat_cmd_coords[type] = cmd.n;
										complexSend(cmd.id, cmd);
									}
								},
								error: function() {
									APP.Chat.cmd.check({
										cmd: 'driver_msg',
										type: type,
										success: function(cmd) {
											if (_.isUndefined(cmd)) {
												APP.Chat.cmd.create({
													cmd: 'driver_msg',
													type: type,
													name: APP.config.chat_cmd_coords[type],
													success: function(cmd) {
														if (_.isUndefined(cmd)) storedCmds(type);
														else {
															APP.config.chat_cmd_coords[type] = cmd.n;
															complexSend(cmd.id, cmd);
														}
													},
													error: function() {
														storedCmds(type);
													}
												}, APP.config.model.id)
											} else {
												APP.config.chat_cmd_coords[type] = cmd.n;
												complexSend(cmd.id, cmd);
											}
										},
										error: function() {storedCmds(type)}
									}, APP.config.model.id);
								}
							}, APP.config.model.id)
						} else {
							APP.config.chat_cmd_coords[type] = cmd.n;
							complexSend(cmd.id, cmd);
						}
					},
					error: function() {storedCmds(type)}
				}, APP.config.model.id);
			}
			return self;
		},
		sendAddress: function(string) {
			var self = this,
				value = $(APP.config.tmpl.msgTextarea).val(),
				pos = APP.Msgs.getCursorPosition(APP.config.tmpl.msgTextarea);
			$(APP.config.tmpl.msgTextarea).val(value.substr(0, pos) + string + value.substr(pos));
			APP.Msgs.submitted = false;
			APP.Msgs.setCursorPosition(APP.config.tmpl.msgTextarea, (pos + string.length)).typing();
			return self;
		}
	});
	/**
	 * Item view in start screen list
	 * @type {View}
	 * @const tagName
	 * @const template
	 * @const events
	 * @method initialize
	 * @method render
	 *         @return {Object} this for chaining only
	 * @method goTo we'll trigger this method to jump on necessary unit / driver & show messages
	 *        @param {Object} e event object
	 *        @return {Object} this for chaining only
	 */
	APP.MVC.View.splashItem = Backbone.View.extend({
		tagName: 'section',
		template: $(APP.config.tmpl.splashItemTemplate).html(),
		events: {'click article': 'goTo', 'click article a': 'goTo'},
		initialize: function() {
			var self = this;
			_.bindAll(self, 'render', 'goTo');
		},
		render: function() {
			var self = this;
			self.$el.html(_.template(self.template, self.model.toJSON()).replace(/\s\s+/g, ''));
			return self;
		},
		goTo: function(e) {
			if (e) APP.Chat.preventDefault(e);
			var self = this,
				model = APP.MVC.Collection.Latest.get(self.model.id);
			model.trigger('splash');
			return self;
		}
	});
	/**
	 * Start screen view
	 * @type {View}
	 * @const el
	 * @const template
	 * @method initialize
	 * @method render
	 * @method renderListItem render function for only single model
	 *        @param {Model} model
	 * @method renderSplash render unit / driver & message data into model attributes
	 *         @param {Number} id ID
	 *         @param {Number} i index
	 *         @param {Number} d data
	 *         @return {Object} object with model attributes
	 * @method getSplash we'll trigger this method to get items for start screen
	 *         @return {Object} this for chaining only
	 */
	APP.MVC.View.Splash = Backbone.View.extend({
		el: APP.config.tmpl.splashContainer,
		template: $(APP.config.tmpl.msgsTemplate).html(),
		initialize: function(options) {
			var self = this;
			_.bindAll(self, 'render', 'renderListItem', 'getSplash');
			self.options = options;
			self.getSplash().collection.on('reset', self.render, self);
		},
		render: function() {
			var self = this;
			if (self.collection.length > 0) {
				self.collection.each(function(item, index) {
					if (index === 3) self.$el.find(APP.config.tmpl.splashItemsContainer).append('<div class="clear" />');
					self.$el.find(APP.config.tmpl.splashItemsContainer).append(self.renderListItem(item));
				});
			}
			return self;
		},
		renderListItem: function(model) {
			var splashItem = new APP.MVC.View.splashItem({model: model});
			return splashItem.render().$el;
		},
		renderSplash: function(id, i, d) {
			var self = this,
				model = (_.isUndefined(APP.MVC.Collection.Units.get(id))) ? APP.MVC.Collection.Drivers.get(id) : APP.MVC.Collection.Units.get(id),
				phones = model.get('phones');
			if ((d.tp !== 'us') && !((d.tp === 'xx') && ($.inArray(d.p.phone, phones) !== -1) && (d.f === 2305 || d.f === 2304)) && !(d.tp === 'ud' && (d.p.text || d.p.image || d.f & 16)) && !(d.tp === 'ucr' && (d.cn === 'driver_msg' || d.cn === 'custom_msg' || d.cn === 'send_position'))) return false;
			var type = 'outgoing',
				communication = 'tcp',
				flag = 1,
				msg = '';
			if (d.tp === 'xx') {
				communication = 'sms';
				if (d.f === 2304) type = 'incoming';
				if (d.p.sms_text && wialon.util.String.isValidText(d.p.sms_text)) msg = _.escape(d.p.sms_text);
			} else if (d.tp === 'ud') {
				type = 'incoming';
				if (d.f & 16) {
					flag = 4;
					msg = 'SOS';
				} else if (d.p.image) {
					flag = 2;
					msg = '<img src="'+ APP.config.no_image +'" alt="Message Image '+ d.t +'" />';
				} else if (d.p.text) msg = _.escape(d.p.text);
			} else if ((d.tp === 'us') && (d.st && wialon.util.String.isValidText(d.st))) {
				type = 'incoming';
				communication = 'sms';
				msg = _.escape(d.st);
			} else if ((d.tp === 'ucr') && d.cp && (d.cn === 'send_position')) {
				var coordsData = d.cp.split('|');
				flag = 3;
				msg = (!coordsData[3].match(APP.config.chat_cmd_coords_regexp)
					? '<i>' + coordsData[3] + '</i>'
					: '<i>'+ __('Sent coordinates') +'</i>: '+ coordsData[3]) +
				'<br /><a href="#" class="sent-coords" data-coords="'+ coordsData[0] +'|'+ coordsData[1] +'">'+ __('Show on map') +'</a>';
			} else if (d.cp) {
				if (d.lt === 'gsm') communication = 'sms';
				msg = d.cp;
			} else msg;
			msg = APP.Chat.shortenTitle(msg, 95);
			return {
				id: model.get('id'),
				mtype: model.get('mtype'),
				name: model.get('name'),
				shortened_name: model.get('shortened_name'),
				icon: model.get('icon_big'),
				type: type,
				flag: flag,
				communication: communication,
				message: msg
			}
		},
		getSplash: function() {
			var self = this;
			if (APP.Chat.cookie.get(APP.config.chat_cookie_models +'_'+ APP.globals.userID)) {
				var recent = APP.Chat.cookie.get(APP.config.chat_cookie_models +'_'+ APP.globals.userID).split('|'),
					len = recent.length,
					ml = APP.globals.session.getMessagesLoader(),
					models = [];
				$.each(recent, function(i, item) {
					var itemModel = (_.isUndefined(APP.MVC.Collection.Units.get(item)))
						? APP.MVC.Collection.Drivers.get(item) ? APP.MVC.Collection.Drivers.get(item).clone() : false
						: APP.MVC.Collection.Units.get(item).clone();
					if (!itemModel) return;
					if (itemModel.has('eventID')) itemModel.unset('eventID', {silent: true});
					if (itemModel.has('eventIDChangeLastMessage')) itemModel.unset('eventIDChangeLastMessage', {silent: true});
					APP.MVC.Collection.Latest.unshift(itemModel, {merge: true});
					if (i <= (len - 7)) return true;
					var id = (itemModel.get('mtype') === 'drivers') ? itemModel.get('rid') : item;
					ml.loadLast(id, 0, 50, 0, 0, 100, function(code, data) {
						if (!code) {
							var count = data.count;
							$.each(data.messages.reverse(), function(i, d) {
								d.f = d.f & 0x3fffffff;
								var model = self.renderSplash(item, i, d);
								if (model) {models.push(new APP.MVC.Model.Splash(model)); return false}
							});
						}
						if (i === (len - 1)) APP.MVC.Collection.Splash.reset(models);
					});
				});
				return self;
			}
			return self;
		}
	});
	/**
	 * Main view
	 * @type {View}
	 * @const el
	 * @const events
	 * @method initialize
	 * @method render
	 * @method atoi
	 * @method atoui
	 * @const cookie
	 *        @type {Object}
	 *        @method set
	 *                @param {String} name
	 *                @param {String} value
	 *                @param {String} expires
	 *                @param {String} path
	 *                @param {String} domain
	 *                @param {Boolean} secure
	 *        @method get
	 *                @param {String} name
	 * @method getParameterByName
	 *         @param {String} name
	 *         @return {?String} searchable parameter
	 * @method loadModule we'll trigger this method to load javascript or stylesheet file
	 *         @param {Object} options
	 * @const log information into console.log
	 *        @type {Object}
	 *        @method start
	 *                @param {String} name
	 *        @method end
	 *                @param {String} name
	 * @method tr
	 *         @param {String} key
	 *         @param {String} params
	 *         @return {String} text converted string
	 * @method translate we'll trigger this method to get items for start screen
	 *         @param {Object} $cnt cached DOM element
	 *         @return {Object} this for chaining only
	 * @method shortenTitle we'll trigger this method to make text shorten
	 *         @param {String} string
	 *         @param {Number} count
	 *         @return {String} converted string
	 * @method sounds check sounds possibility
	 *         @return {Object} this for chaining only
	 * @method message we'll trigger this show message (ordinary javascript alert for default) for user
	 *         @param {Object} options
	 *         @return {Object} this for chaining only
	 * @method auth logging in to Wialon CMS
	 *         @param {Function} callback function with necessary data
	 *         @return {Object} this for chaining only
	 * @method getUnits
	 *         @param {Object} options
	 *         @return {Object} return deferred object (done or fail)
	 * @method getDrivers
	 *         @param {Object} options
	 *         @return {Object} return deferred object (done or fail)
	 * @method getGeofences
	 *         @param {Object} options
	 *         @return {Object} return deferred object (done or fail)
	 * @method getAccountData
	 *         @return {Object} return deferred object (done or fail)
	 * @method savePrevState store units / driver into cookie to get them in start screen after
	 *         @param {Number} count
	 *         @return {Object} this for chaining only
	 * @const cmd command object
	 *        @type {Object}
	 *        @method create command for unit
	 *                @param {Object} options
	 *        @method check command for unit
	 *                @param {Object} options
	 *        @method send command for unit
	 *                @param {Number} id
	 *                @param {Object} options
	 * @const sms Send SMS object
	 *        @type {Object}
	 *        @method send command for unit
	 *                @param {Object} options
	 * @method click we'll trigger to close all tooltips, if we clicked on empty space on page
	 * @method searchFounded we'll trigger this method if user click buttons, which used for message search
	 *        @param {Object} e event object
	 *        @return {Object} this for chaining only
	 * @method resize we'll trigger this method when window / document resized
	 *        @return {Object} this for chaining only
	 */
	APP.MVC.View.Main = Backbone.View.extend({
		el: window,
		events: {'click': 'click', 'resize': 'resize', 'keydown': 'searchFounded'},
		preventDefault: function(e) {e.preventDefault(); e.stopPropagation()},
		atoi: function(s) {
			var n = parseInt(s, 10);
			if (isNaN(n) || !isFinite(n) || Math.abs(n) > 0x7FFFFFFF) return 0;
			return n;
		},
		atoui: function(s) {
			var n = this.atoi(s);
			if (n < 0) return -n;
			return n;
		},
		cookie: {
			set: function(name, value, expires, path, domain, secure) {
				if (!name || _.isUndefined(value)) return false;
				var str = name +'='+ encodeURIComponent(value);
				if (expires) str += '; expires='+ expires.toGMTString();
				if (path) str += '; path='+ path;
				if (domain) str += '; domain='+ domain;
				if (secure) str += '; secure';
				document.cookie = str;
				return true;
			},
			get: function(name) {
				var pattern = '(?:; )?'+ name +'=([^;]*);?',
					regexp  = new RegExp(pattern);
				if (regexp.test(document.cookie)) return decodeURIComponent(RegExp['$1']);
				return false;
			}
		},
		getParameterByName: function(name,def) {
			if (!name) return null;
			var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(document.location.href);
			if (results) return decodeURIComponent(results[1]);
			return def || null;
		},
		loadModule: function(options) {
			var defaults = {condition: true, url: null, type: 'script', success: $.noop, error: $.noop};
			options = $.extend(true, defaults, options);
			if (options.condition) {
				var request = $.ajax({
					url: options.url,
					type: 'GET',
					dataType: (options.type === 'style') ? 'text' : options.type,
					crossDomain: true,
					cache: true,
					timeout: 30000
				});
				request.then(
					function(data, textStatus, jqXHR) {
						if (options.type === 'style') APP.globals.document.prepend(wialon.util.String.sprintf('<style>%s</style>', data));
						options.success(data, textStatus, jqXHR);
					},
					function(jqXHR, textStatus) {
						NProgress.set(1);
						NProgress.done();
						options.error(jqXHR, textStatus);
					}
				);
			} else console.log(__('Not necessary to load module'));
		},
		log: {
			start: function(name) {
				if (!name) return false;
				var d = new Date();
				console.time(__('Execution time: %%title%%', {title: name}))
				console.log(__('[%%time%%] %%title%% started', {time: d.toLocaleTimeString(), title: name}));
			},
			end: function(name) {
				if (!name) return false;
				console.timeEnd(__('Execution time: %%title%%', {title: name}));
			}
		},
		tr: function(key, params) {
			var key, text = APP.config.L10n[key] || null;
			if (text === null) text = key;
			else if (!_.isString(text)) text = text.toString();
			if (params) {
				text = text.replace(/(\%\%(\w+)\%\%)/g, function(match, key, value) {
					if (params.hasOwnProperty(value)) return params[value];
					return match;
				});
			}
			return text;
		},
		translate: function($cnt) {
			var self = this;
			self.log.start(__('Translation'));
			if (!$cnt) $cnt = self.$el;
			$cnt.find('.translate').each(function() {
				var $this = $(this),
					key = $this.data('translate-key') || null,
					params = $this.data('translate-params') || null;
				if (params) params = $.parseJSON(params.replace(/'/g, '"'));
				$this.html(self.tr(key, params));
			});
			self.log.end(__('Translation'));
			return self;
		},
		shortenTitle: function(string, count) {return string.length > count ? string.substring(0, count) + ' &#8230;' : string},
		sounds: function() {
			var self = this;
			APP.globals.audioTagSupport = !!(document.createElement('audio').canPlayType);
			if (APP.globals.audioTagSupport) {
				var sndType = new Audio(),
					canPlayMp3 = !!sndType.canPlayType && sndType.canPlayType('audio/mpeg') !== '',
					canPlayOgg = !!sndType.canPlayType && sndType.canPlayType('audio/ogg; codecs="vorbis"') !== '',
					audioExt = null;
				if (canPlayMp3) audioExt = 'mp3';
				else if (canPlayOgg) audioExt = 'ogg';
				sndType = canPlayMp3 = canPlayOgg = null;
				APP.globals.incomingSound = new Audio();
				APP.globals.outgoingSound = new Audio();
				APP.globals.incomingSound.src = wialon.util.String.sprintf('./sounds/%s.%s', APP.config.sounds.incomingName, audioExt);
				APP.globals.outgoingSound.src = wialon.util.String.sprintf('./sounds/%s.%s', APP.config.sounds.outgoingName, audioExt);
			}
			return self;
		},
		message: function(options) {
			var self = this,
			defaults = {
				type: 'log',
				message: __('Something wrong'),
				obj: null
			};
			options = $.extend(true, defaults, options);
			if (options.obj) {
				console.groupCollapsed(wialon.util.String.sprintf('%s: %s', __('Message log'), options.message));
				console[options.type](options.obj);
				console.groupEnd();
			}
			alert(options.message);
			return self;
		},
		auth: function(callback) {
			var self = this,
				url = self.getParameterByName('baseUrl','https://hst-api.wialon.com') || self.getParameterByName('hostUrl','http://hosting.wialon.com'),
				user = self.getParameterByName('user'),
				sid = self.getParameterByName('sid'),
				authHash = self.getParameterByName('authHash');
			if (!url) {self.message({message: __('Please, fill the correct data in configuration')}); return self}
			self.loadModule({
				url: url + '/wsdk/script/wialon.js',
				success: function() {
					qx.Class.include(wialon.core.Session, wialon.util.MDataFlagsHelper);
					APP.globals.session = wialon.core.Session.getInstance();
					APP.globals.session.initSession(url, 'gapp_chatter_box', 0x800);
					var loginCallback = function(code) {
						if (code) {
							NProgress.set(1);
							NProgress.done();
							self.message({message: __('Oh! Unfortunately, you can\'t login'), obj: wialon.core.Errors.getErrorText(code)});
							return self;
						}

						wialon.core.Remote.getInstance().remoteCall('core/set_session_property', { prop_name:'skip_nonactive_items', prop_value:1 }, function() {});
						APP.globals.session.addListener('invalidSession', $.proxy(self.message, self, {message: __('Session has been lost')}));
						callback && callback();
					};
					if (authHash) {
						APP.globals.session.loginAuthHash(authHash, loginCallback);
					} else if (sid) {
						APP.globals.session.duplicate(sid, user, true, loginCallback);
					} else {
						self.message({message: __('Oh! Unfortunately, you can\'t login')});
						return self;
					}
				},
				error: function(){
					NProgress.set(1);
					NProgress.done();
					$.proxy(self.message, self, {message: __('Oh! Unfortunately, we can\'t load SDK')})();
				}
			});
		},
		getData: function() {
			var self = this;
			return $.Deferred(function(dfd) {
				// Load necessary libraries
				APP.globals.session.loadLibrary('itemIcon');
				APP.globals.session.loadLibrary('unitCommandDefinitions');
				APP.globals.session.loadLibrary('resourceZones');
				APP.globals.session.loadLibrary('resourceDrivers');
				APP.globals.session.loadLibrary('resourceNotifications');
				APP.globals.session.loadLibrary('itemProfileFields');
				// Add resources into session
				var spec = [ {
					type: 'type',
					data: 'avl_unit',
					flags: 0x80733,
					mode: 0
				}, {
					type: 'type',
					data: 'avl_resource',
					flags: 0x80733 | 0x1003,
					mode: 0
				} ];
				/* 0x80733, 0x1003 */
				// Init wialon events
				APP.globals.session.updateDataFlags( spec, function() {
					dfd.resolve();
				});
			}).promise();
		},
		getUnits: function() {
			var self = this;
			return $.Deferred(function(dfd) {
				if (APP.globals.show.avl_unit) {
					var checkEnd = function(index, count, models) {
						self.log.end(__('Units'));
						if (index === (count - 1)) {
							setTimeout(function() {
								APP.MVC.Collection.Units.reset(models);
								dfd.resolve();
							}, 500);
						}
					};
					self.log.start(__('Units'));
					var units = APP.globals.session.getItems('avl_unit'),
						count = units.length,
						models = [];
					if (!count) {checkEnd(0, 1, []); return}
					$.each(units, function(i, unit) {
						var id = unit.getId(),
							phones = [];
						$.each([unit.getPhoneNumber(), unit.getPhoneNumber2()], function() {
							if (!wialon.util.String.isValidPhone(this)) return;
							phones.push(this);
						});
						models.push(new APP.MVC.Model.listItem({
							mtype: 'units',
							id: id,
							name: unit.getName(),
							icon: unit.getIconUrl(APP.config.icon_size),
							icon_big: unit.getIconUrl(APP.config.icon_size_big),
							phones: phones
						}));
					});
					checkEnd((count - 1), count, models);
				} else {
					dfd.resolve();
				}
			}).promise();
		},
		getDrivers: function() {
			var self = this;
			return $.Deferred(function(dfd) {
				if (APP.globals.show.drivers) {
					var checkEnd = function(index, count, models) {
						if (index === (count - 1)) {
							self.log.end(__('Drivers'));
							setTimeout(function() {
								APP.MVC.Collection.Drivers.reset(models);
								dfd.resolve();
							}, 500);
						}
					};
					self.log.start(__('Drivers'));
					var resources = APP.globals.session.getItems('avl_resource'),
						count = resources.length,
						models = [];
					if (!count) {checkEnd(0, 1, []); return}
					$.each(resources, function(i, resource) {
						var rid = resource.getId(),
							drivers = resource.getDrivers();
						if (!_.size(drivers)) {checkEnd(i, count, models); return}
						$.each(drivers, function(k, driver) {
							var id = driver.id,
								phones = [];
							$.each([driver.p, ''], function() {
								if (!wialon.util.String.isValidPhone(this)) return;
								phones.push(this);
							});
							models.push(new APP.MVC.Model.listItem({
								mtype: 'drivers',
								id: _.size(models),
								did: id,
								rid: rid,
								name: driver.n,
								icon: driver.r ? resource.getDriverImageUrl(driver, APP.config.icon_size) : APP.config.no_photo,
								icon_big: driver.r ? resource.getDriverImageUrl(driver, APP.config.icon_size_big) : APP.config.no_photo,
								phones: phones
							}));
						});
					});
					checkEnd((count - 1), count, models);
				} else {
					dfd.resolve();
				}
			}).promise();
		},
		getGeofences: function() {
			var self = this;
			return $.Deferred(function(dfd) {
				if (APP.globals.show.zones_library) {
					var checkEnd = function(index, count, models) {
						if (index === (count - 1)) {
							self.log.end(__('Geofences'));
							setTimeout(function() {
								APP.MVC.Collection.Geofences.reset(models);
								dfd.resolve();
							}, 500);
						}
					};
					self.log.start(__('Geofences'));
					var resources = APP.globals.session.getItems('avl_resource'),
						count = resources.length,
						models = [];
					if (!count) {checkEnd(0, 1, []); return}
					$.each(resources, function(i, resource) {
						var rid = resource.getId(),
							geofences = resource.getZones();
						if (!_.size(geofences)) {checkEnd(i, count, models); return}
						wialon.core.Remote.getInstance().startBatch('Geofences');
						$.each(geofences, function(k, geofence) {
							var id = geofence.id;
							resource.getZonesData([id], function(code, data) {
								if (code || !data.length) return;
								var geofence = data[0],
									type = geofence.t,
									icon;
								switch (type) {
									case 1: icon = APP.config.geo_polyline; break
									case 2: icon = APP.config.geo_polygon; break
									default: icon = APP.config.geo_circle
								}
								models.push(new APP.MVC.Model.listItem({
									mtype: 'geofences',
									id: _.size(models),
									gid: id,
									rid: rid,
									name: geofence.n,
									icon: icon,
									coordinates: geofence.p,
									type: type,
									color: '#'+ wialon.util.String.sprintf('#%06x', geofence.c).slice(3)
								}));
							});
						});
						wialon.core.Remote.getInstance().finishBatch(function(code, data, combinedCode, combinedData) {checkEnd((count - 1), count, models)}, 'Geofences');
					});
				} else {
					dfd.resolve();
				}
			}).promise();
		},
		cmd: {
			create: function(options, id, name) {
				var defaults = {cmd: 'driver_msg', type: 'tcp', name: APP.config.chat_cmd_msg.tcp, success: $.noop, error: $.noop};
				options = $.extend(true, defaults, options);

				var model = APP.MVC.Collection.Units.get(id);
				var possibilities = model ? model.get('possibilityInit') : {};
				if (model && possibilities[options.type]) {
					var listCmd = possibilities[options.type] || [];
					var canCreate = ~listCmd.indexOf(options.cmd);
					if (!canCreate) {
						console.error('unit can`t create command:' + model.get('name') + ' ' + options.cmd + ':' + options.type);
						return options.error(1);
					}

					console.warn('create command for unit:' + model.get('name') + ' ' + options.cmd + ':' + options.type);
				}
				var cmdNames = ~['driver_msg', 'custom_msg'].indexOf(options.cmd) || options.type === 'gsm' ? 'chat_cmd_msg' : 'chat_cmd_coords';
				if(!_.isUndefined(options.type) && APP.config[cmdNames]){
					switch(options.type){
						case "tcp":
							options.name = APP.config[cmdNames].tcp;
							break;
						case "udp":
							options.name = APP.config[cmdNames].udp;
							break;
						case "gsm":
							options.name = APP.config[cmdNames].gsm;
							break;
						case "vrt":
							options.name = APP.config[cmdNames].vrt;
							break;
					}
				}
				options.name = options.test ? options.test : options.name;
				APP.globals.session.getItem(id).createCommandDefinition({n: options.name, c: options.cmd, l: options.type, p: '', a: 1, f: "0"}, function(code, data) {
					if (code) options.error(code);
					else options.success(data);
				});
			},
			remove: function(cmd){
				return $.Deferred(function(dfd) {
					var _cmd = cmd;
					if(cmd.c !== 'send_position'){
						dfd.resolve(_cmd);
						return;
					}
					if(cmd.n.indexOf('__app__chatterbox_msg') == -1){
						if(cmd.n.indexOf('__app__chatterbox') == -1){
							dfd.resolve();
							return;
						}
						dfd.resolve(_cmd);
					}else{
						var u = APP.globals.session.getItem(APP.config.model.id);
						u.updateCommandDefinition({id: cmd.id}, function(){
							dfd.resolve();
						}, 'delete');
					}
				}).promise();
			},
			find: function(list, options, withoutType) {
				var _foundCmd = _.filter( list, function(cmd) {
					return cmd.c === options.cmd && cmd.p === '' && (withoutType || ~(_.isUndefined(cmd.t) ? cmd.l : cmd.t).indexOf(options.type));
				} );

				return _foundCmd && _foundCmd.length && _foundCmd[0] || false;
			},
			check: function(options, id) {
				var defaults = {cmd: 'driver_msg', type: 'tcp', success: $.noop, error: $.noop};
				// type: Auto
				var cmdTypeAuto = '';
				var self = this;
				options = $.extend(true, defaults, options);
				$.when(APP.Chat.getAccountData()).done(function() {
					var model = APP.MVC.Collection.Units.get(id);
					if ((options.type === 'gsm') && (!model.has('phones') || _.isEmpty(model.get('phones')))) {options.error(); return}
					else {
						var cmds = APP.globals.session.getItem(id).getCommandDefinitions();
						var unitCmds = APP.globals.session.getItem(model.id).getCommands();
						var tcpInsteadUdp = options.type === 'udp' && model.get('possibilityInit').tcp && model.get('possibilityInit').tcp.length;
						// find cmd
						if (cmds || unitCmds) {
							var _foundCmd = null;
							var list = null;
							if(!cmds && unitCmds) {
								list = unitCmds;
							} else if(cmds) {
								list = cmds;
							}
							_foundCmd = self.find(list, options);
							if( !_foundCmd && tcpInsteadUdp){
								_foundCmd = self.find(list, _.extend(options, {type: 'tcp'}));
							}
							if ( _foundCmd ) {
								if ( !_foundCmd.id ) {
									_foundCmd = _.extend({}, {id: -1}, _foundCmd)
								}
								console.warn('unit ' + model.get('name') + ' exits a command:' + ' ' + options.cmd + ':' + options.type);
								options.success(_foundCmd);
								return false;
							}
						}

						console.warn('unit ' + model.get('name') + ' don`t exits a command:' + ' ' + options.cmd + ':' + options.type);

						options.success();
					}
				});
			},
			send: function(id, options, _cmd) {
				var defaults = {type: 'tcp', name: APP.config.chat_cmd_msg.tcp, data: '', success: $.noop, error: $.noop};
				if (!_.isUndefined(options.type) && (options.type !== 'tcp'))
					defaults.name = APP.config.chat_cmd_msg.gsm;
				if (!_.isUndefined(options.type) && (options.type === 'udp'))
					defaults.name = APP.config.chat_cmd_msg.udp;
				if (!_.isUndefined(options.type) && (options.type === 'vrt'))
					defaults.name = APP.config.chat_cmd_msg.vrt;
				options = $.extend(true, defaults, options);

				var item = APP.globals.session.getItem(APP.config.model.id);
				if (!id) {
					item.remoteCommand(options.name, options.type, options.data, 0, function(code) {
						if (code) options.error(code);
						else {
							$.when(APP.Chat.getAccountData()).done(function() {
								$(APP.config.tmpl.smsCounter).text(__('%%c%% SMS', {'c': ((APP.globals.smsCounter > 0) ? APP.globals.smsCounter : 0)}));
								options.success();
							});
						}
					});
				} else {
					var cmd = item && item.getCommandDefinition(id) || _cmd;
					if (cmd && (wialon.util.Number.and(item.getUserAccess(), cmd.a) === cmd.a)) {
						options.name = cmd.n;
						APP.globals.lastSendCmd = cmd;
						item.remoteCommand(options.name, options.type, options.data, 0, function(code) {
							if (code) options.error(code);
							else {
								$.when(APP.Chat.getAccountData()).done(function() {
									$(APP.config.tmpl.smsCounter).text(__('%%c%% SMS', {'c': ((APP.globals.smsCounter > 0) ? APP.globals.smsCounter : 0)}));
									options.success();
								});
							}
						});
					} else options.error();
				}
			}
		},
		sms: {
			send: function(options, callback) {
				var defaults = {phone: '', data: '', success: $.noop, error: $.noop};
				options = $.extend(true, defaults, options);

				APP.globals.session.sendSms(options.phone, options.data, function(code, data) {
					if (code) options.error(code);
					else {
						APP.globals.smsCounter--;
						$(APP.config.tmpl.smsCounter).text(__('%%c%% SMS', {'c': ((APP.globals.smsCounter > 0) ? APP.globals.smsCounter : 0)}));

						options.success(data);
					}
				});
			}
		},
		getAccountData: function() {
			return $.Deferred(function(dfd) {
				var service;
				if(APP.globals.UnlimitSms || APP.globals.getAD || APP.globals.getSmsUTC && APP.globals.getSmsUTC == Math.floor(new Date().valueOf()/3000)){
					dfd.resolve();
					return;
				}

				APP.globals.getAD = true;

				APP.globals.session.getAccountData(0, function(code, data) {
					APP.globals.smsCounter = 0;
					APP.globals.getAD = false;
					APP.globals.getSmsUTC = Math.floor(new Date().valueOf()/3000);
					if (code) {
						// e.g error:7
						// can't get Account data - just check feature
						for (service in APP.globals.show) {
							if (APP.globals.session.checkFeature(service)) {
								APP.globals.show[service] = true;
							}
						}
					} else if (data && data.services) {
						if (data.services.sms) {
							APP.globals.smsCounter = data.services.sms.maxUsage - data.services.sms.usage;
						}
						for (service in APP.globals.show) {
							if (data.services[service] && data.services[service].maxUsage != 0 || APP.globals.session.checkFeature(service)) {
								APP.globals.show[service] = true;
							}
						}
					}

					dfd.resolve();
				});
			}).promise();
		},
		savePrevState: function(id) {
			var self = this,
				date = new Date();
			date.setTime(date.getTime() + (24 * 3600 * 1000));
			if (APP.Chat.cookie.get(APP.config.chat_cookie_models +'_'+ APP.globals.userID)) {
				var recent = APP.Chat.cookie.get(APP.config.chat_cookie_models +'_'+ APP.globals.userID).split('|'),
					strID = (id).toString();
				if ($.inArray(strID, recent) !== -1) recent = _.without(recent, strID);
				recent.push(id);
				APP.Chat.cookie.set(APP.config.chat_cookie_models +'_'+ APP.globals.userID, recent.join('|'), date);
				} else APP.Chat.cookie.set(APP.config.chat_cookie_models +'_'+ APP.globals.userID, id, date);
			return self;
		},
		initialize: function() {
			var self = this,
				lang = self.getParameterByName('lang','en'),
				debug = self.getParameterByName('debug'),
				log = self.getParameterByName('log');
			_.bindAll(this, 'render', 'resize', 'click');
			_.templateSettings = {interpolate: /\{\{(.+?)\}\}/g, evaluate: /\[\%(.+?)\%\]/g};
			NProgress.configure({showSpinner: false, template: '<div class="bar" role="bar"></div>'});
			NProgress.start();
			$('#nprogress').appendTo('header');
			APP.globals.iframe = (_.isEmpty(window.name)) ? false : true;
			if (!self.el.__) self.el.__ = self.tr;
			if (availableLanguages && ($.inArray(lang, availableLanguages) == -1)) lang = 'en';
			if (documentationLink) {
				$('#help').append('<a target="_blank" href="' + documentationLink + '"><img src="img/help.png"></a>');
			}
			$(APP.config.tmpl.btnRightPanel).on('click', self.rightPanelToggle);
			self.loadModule({
				url: './lang/'+ lang +'.json',
				type: 'json',
				success: function(data) {
					if (_.isUndefined(APP) || !APP.config) {
						return false;
					}

					APP.config = $.extend(true, APP.config, data);

					self.auth(function() {
						var methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd', 'timeStamp', 'trace'],
							method;

						if (!log) {
							methods = methods.concat(['warn', 'error']);
						}

						var length = methods.length;
						while (length--) {
							method = methods[length];
							if (!(console[method] && debug)) console[method] = $.noop;
						};
						console.clear();
						console.log('************************************************************************\n\nApps - WEB applications, developed on the basis of SDK for Wialon Hosting and Wialon Kit.\n\nhttp://apps.wialon.com\n\nCopyright:\n  2002-2013 Gurtam, http://gurtam.com\n\nLicense:\n  MIT: https://opensource.org/licenses/MIT\n\nAuthors:\n  * Gurtam\n\n************************************************************************');
						wialon.util.DateTime.setLocale(APP.config.localization.days, APP.config.localization.months, APP.config.localization.days_short, APP.config.localization.months_short);
						APP.globals.user = APP.globals.session.getCurrUser();
						//Read locale formats from wialon service
						APP.globals.user.getLocale(function(code, data) {
							if (code) return false;
							if (!data) {
								data = {};
							}
							if (!data.fd) {
								data.fd = 'yyyy-MM-dd_HH:mm:ss';
							}
							if (data.wd === undefined) {
								data.wd = 1;
							}
							var formats = wialon.util.DateTime.convertFormat(data.fd, true).split('_');
							if (formats[0]) APP.config.format.date = formats[0];
							if (formats[1]) APP.config.format.time = formats[1];
							APP.config.format.wd = data.fd;
						});
						APP.globals.userID = APP.globals.user.getId();
						$.when(self.getAccountData()).done(function() {
							$.when(self.getData()).done(function() {
								$.when(self.getUnits(), self.getDrivers(), self.getGeofences()).done(self.render);
							});
						});
					});
				},
				error: $.proxy(self.message, self, {message: __('Oh! %%module%% didn\'t load!', {'module': 'LANG'})})
			});
		},
		render: function() {
			var self = this;
			for (var i=0, items=APP.MVC.Collection.Drivers.models, len=items.length; i<len; i++) {
				var model = items[i];
				if (!model) continue;
				model.set('possibilityInit', {gsm: true}, {silent: true});
			}
			wialon.core.Remote.getInstance().startBatch('setPossibilityInit');
			var getHwCommands = function(item, model) {
				return APP.globals.session.getHwCommands(0, model.id, function(code, data) {
					if (code) {
						data = {};
						var cmds = item.getCommands();
						if (_.size(cmds)) {
							data = {gsm: [], tcp: []};
							_.each(cmds, function(cmd) {
								_.each(cmd.t.split(','), function(type) {
									if (type === 'gsm' || type === 'tcp') data[type].push(cmd.c);
								});
							})
						}
					}
					model.set('possibilityInit', $.extend(true, {gsm: [], tcp: []}, data), {silent: true});
				});
			};
			for (var i=0, items=APP.MVC.Collection.Units.models, len=items.length; i<len; i++) {
				var model = items[i];
				if (!model) continue;
				var item = APP.globals.session.getItem(model.id);
				if (_.isNull(item)) model.set('possibilityInit', {gsm: [], tcp: []}, {silent: true});
				else getHwCommands(item, model);
			}
			wialon.core.Remote.getInstance().finishBatch(function() {
				APP.MAP = new APP.MVC.View.Map();
				APP.MVC.View.Units = APP.MVC.View.Items.extend({className: 'list-units', typeName: __('Units')});
				APP.MVC.View.Drivers = APP.MVC.View.Items.extend({className: 'list-drivers', typeName: __('Drivers')});
				APP.MVC.View.Latest = APP.MVC.View.Items.extend({className: 'list-latest', typeName: __('Latest')});
				APP.MVC.View.Geofences = APP.MVC.View.Resources.extend({className: 'list-geofences', typeName: __('Geofences')});
				APP.Units = new APP.MVC.View.Units({collection: APP.MVC.Collection.Units});
				APP.Drivers = new APP.MVC.View.Drivers({collection: APP.MVC.Collection.Drivers});
				APP.Latest = new APP.MVC.View.Latest({collection: APP.MVC.Collection.Latest});
				APP.Geofences = new APP.MVC.View.Geofences({collection: APP.MVC.Collection.Geofences});
				APP.itemsSearch = new APP.MVC.View.itemsSearch();
				APP.resourcesSearch = new APP.MVC.View.resourcesSearch();
				APP.Splash = new APP.MVC.View.Splash({collection: APP.MVC.Collection.Splash});
				APP.globals.root
					.addClass(APP.globals.iframe ? 'iframe' : '')
					.attr('lang', APP.config.L10n.lang);
				self.translate().sounds();
				NProgress.done();
				setTimeout(function() {
					$(APP.config.tmpl.mainContainer).removeClass('loads');
					self.resize();
					if (APP.Chat.cookie.get(APP.config.chat_cookie_resources +'_'+ APP.globals.userID) !== 'false') self.rightPanelToggle();
				}, 500);
			}, 'setPossibilityInit');
			return self;
		},
		click: function() {$(APP.config.tmpl.tooptip).hide()},
		searchFounded: function(e) {
			var self = this;
			var sendByInter = $(APP.config.tmpl.cbSubmitType).prop('checked');
			if (!_.isUndefined(APP.msgsSearch) && e
				&& ( (e.which === 13) || (e.which === 114) || (e.keyCode === 13) || (e.keyCode === 114) )
			) {
				APP.Chat.preventDefault(e);
				APP.msgsSearch.switch((e.which === 38) || (((e.which === 13) || (e.which === 114)) && (e.ctrlKey || e.shiftKey)) || (e.keyCode === 38) || (((e.keyCode === 13) || (e.keyCode === 114)) && (e.ctrlKey || e.shiftKey)));
			}
			return self;
		},
		resize: function() {
			var self = this;
			console.log(__('Window resized'));
			if (self.$el.outerHeight(true) < 400) return self;
			$.each([APP.Latest, APP.Geofences, APP.Msgs], function(i, val) {if (val) {val.resize()}});
			return self;
		},
		rightPanelToggle: function(e) {
			if (e) APP.Chat.preventDefault(e);
			var self = this;
			$(APP.config.tmpl.tooptip).hide();
			var date = new Date();
			date.setTime(date.getTime() + (365 * 24 * 3600 * 1000));
			if ($(APP.config.tmpl.resources).hasClass('shown')) {
				APP.Chat.cookie.set(APP.config.chat_cookie_resources +'_'+ APP.globals.userID, "false", date);
				$(APP.config.tmpl.resources + ',' + APP.config.tmpl.btnRightPanel).removeClass('shown');
			} else {
				APP.Chat.cookie.set(APP.config.chat_cookie_resources +'_'+ APP.globals.userID, "true", date);
				$(APP.config.tmpl.resources + ',' + APP.config.tmpl.btnRightPanel).addClass('shown');
				$(APP.config.tmpl.resourcesContainer).trigger('scroll');
			}
			return self;
		}
	});
	APP.Chat = new APP.MVC.View.Main();
}(window, jQuery, _, Backbone);

/* jshint -W079 */
/* jshint unused:false */
if ( _.isUndefined( window.kirkiSetSettingValue ) ) {
	var kirkiSetSettingValue = { // eslint-disable-line vars-on-top

		/**
		 * Set the value of the control.
		 *
		 * @since 3.0.0
		 * @param string setting The setting-ID.
		 * @param mixed  value   The value.
		 */
		set: function( setting, value ) {

			/**
			 * Get the control of the sub-setting.
			 * This will be used to get properties we need from that control,
			 * and determine if we need to do any further work based on those.
			 */
			var $this = this,
				subControl = wp.customize.settings.controls[ setting ],
				valueJSON;

			// If the control doesn't exist then return.
			if ( _.isUndefined( subControl ) ) {
				return true;
			}

			// First set the value in the wp object. The control type doesn't matter here.
			$this.setValue( setting, value );

			// Process visually changing the value based on the control type.
			switch ( subControl.type ) {

				case 'kirki-background':
					if ( ! _.isUndefined( value['background-color'] ) ) {
						$this.setColorPicker( $this.findElement( setting, '.kirki-color-control' ), value['background-color'] );
					}
					$this.findElement( setting, '.placeholder, .thumbnail' ).removeClass().addClass( 'placeholder' ).html( 'No file selected' );
					_.each( [ 'background-repeat', 'background-position' ], function( subVal ) {
						if ( ! _.isUndefined( value[ subVal ] ) ) {
							$this.setSelectWoo( $this.findElement( setting, '.' + subVal + ' select' ), value[ subVal ] );
						}
					} );
					_.each( [ 'background-size', 'background-attachment' ], function( subVal ) {
						jQuery( $this.findElement( setting, '.' + subVal + ' input[value="' + value + '"]' ) ).prop( 'checked', true );
					} );
					valueJSON = JSON.stringify( value ).replace( /'/g, '&#39' );
					jQuery( $this.findElement( setting, '.background-hidden-value' ).attr( 'value', valueJSON ) ).trigger( 'change' );
					break;

				case 'kirki-code':
					jQuery( $this.findElement( setting, '.CodeMirror' ) )[0].CodeMirror.setValue( value );
					break;

				case 'checkbox':
				case 'kirki-switch':
				case 'kirki-toggle':
					value = ( 1 === value || '1' === value || true === value ) ? true : false;
					jQuery( $this.findElement( setting, 'input' ) ).prop( 'checked', value );
					wp.customize.instance( setting ).set( value );
					break;

				case 'kirki-select':
				case 'kirki-fontawesome':
					$this.setSelectWoo( $this.findElement( setting, 'select' ), value );
					break;

				case 'kirki-slider':
					jQuery( $this.findElement( setting, 'input' ) ).prop( 'value', value );
					jQuery( $this.findElement( setting, '.kirki_range_value .value' ) ).html( value );
					break;

				case 'kirki-generic':
					if ( _.isUndefined( subControl.choices ) || _.isUndefined( subControl.choices.element ) ) {
						subControl.choices.element = 'input';
					}
					jQuery( $this.findElement( setting, subControl.choices.element ) ).prop( 'value', value );
					break;

				case 'kirki-color':
					$this.setColorPicker( $this.findElement( setting, '.kirki-color-control' ), value );
					break;

				case 'kirki-multicheck':
					$this.findElement( setting, 'input' ).each( function() {
						jQuery( this ).prop( 'checked', false );
					} );
					_.each( value, function( subValue, i ) {
						jQuery( $this.findElement( setting, 'input[value="' + value[ i ] + '"]' ) ).prop( 'checked', true );
					} );
					break;

				case 'kirki-multicolor':
					_.each( value, function( subVal, index ) {
						$this.setColorPicker( $this.findElement( setting, '.multicolor-index-' + index ), subVal );
					} );
					break;

				case 'kirki-radio-buttonset':
				case 'kirki-radio-image':
				case 'kirki-radio':
				case 'kirki-dashicons':
				case 'kirki-color-palette':
				case 'kirki-palette':
					jQuery( $this.findElement( setting, 'input[value="' + value + '"]' ) ).prop( 'checked', true );
					break;

				case 'kirki-typography':
					_.each( [ 'font-family', 'variant' ], function( subVal ) {
						if ( ! _.isUndefined( value[ subVal ] ) ) {
							$this.setSelectWoo( $this.findElement( setting, '.' + subVal + ' select' ), value[ subVal ] );
						}
					} );
					_.each( [ 'font-size', 'line-height', 'letter-spacing', 'word-spacing' ], function( subVal ) {
						if ( ! _.isUndefined( value[ subVal ] ) ) {
							jQuery( $this.findElement( setting, '.' + subVal + ' input' ) ).prop( 'value', value[ subVal ] );
						}
					} );

					if ( ! _.isUndefined( value.color ) ) {
						$this.setColorPicker( $this.findElement( setting, '.kirki-color-control' ), value.color );
					}
					valueJSON = JSON.stringify( value ).replace( /'/g, '&#39' );
					jQuery( $this.findElement( setting, '.typography-hidden-value' ).attr( 'value', valueJSON ) ).trigger( 'change' );
					break;

				case 'kirki-dimensions':
					_.each( value, function( subValue, id ) {
						jQuery( $this.findElement( setting, '.' + id + ' input' ) ).prop( 'value', subValue );
					} );
					break;

				case 'kirki-repeater':

					// Not yet implemented.
					break;

				case 'kirki-custom':

					// Do nothing.
					break;
				default:
					jQuery( $this.findElement( setting, 'input' ) ).prop( 'value', value );
			}
		},

		/**
		 * Set the value for colorpickers.
		 * CAUTION: This only sets the value visually, it does not change it in th wp object.
		 *
		 * @since 3.0.0
		 * @param object selector jQuery object for this element.
		 * @param string value    The value we want to set.
		 */
		setColorPicker: function( selector, value ) {
			selector.attr( 'data-default-color', value ).data( 'default-color', value ).wpColorPicker( 'color', value );
		},

		/**
		 * Sets the value in a selectWoo element.
		 * CAUTION: This only sets the value visually, it does not change it in th wp object.
		 *
		 * @since 3.0.0
		 * @param string selector The CSS identifier for this selectWoo.
		 * @param string value    The value we want to set.
		 */
		setSelectWoo: function( selector, value ) {
			jQuery( selector ).selectWoo().val( value ).trigger( 'change' );
		},

		/**
		 * Sets the value in textarea elements.
		 * CAUTION: This only sets the value visually, it does not change it in th wp object.
		 *
		 * @since 3.0.0
		 * @param string selector The CSS identifier for this textarea.
		 * @param string value    The value we want to set.
		 */
		setTextarea: function( selector, value ) {
			jQuery( selector ).prop( 'value', value );
		},

		/**
		 * Finds an element inside this control.
		 *
		 * @since 3.0.0
		 * @param string setting The setting ID.
		 * @param string element The CSS identifier.
		 */
		findElement: function( setting, element ) {
			return wp.customize.control( setting ).container.find( element );
		},

		/**
		 * Updates the value in the wp.customize object.
		 *
		 * @since 3.0.0
		 * @param string setting The setting-ID.
		 * @param mixed  value   The value.
		 */
		setValue: function( setting, value, timeout ) {
			timeout = ( _.isUndefined( timeout ) ) ? 100 : parseInt( timeout, 10 );
			wp.customize.instance( setting ).set( {} );
			setTimeout( function() {
				wp.customize.instance( setting ).set( value );
			}, timeout );
		}
	};
}
var kirki = {

	initialized: false,

	/**
	 * Initialize the object.
	 *
	 * @since 3.0.17
	 * @returns {null}
	 */
	initialize: function() {
		var self = this;

		// We only need to initialize once.
		if ( self.initialized ) {
			return;
		}

		setTimeout( function() {
			kirki.util.webfonts.standard.initialize();
			kirki.util.webfonts.google.initialize();
		}, 150 );

		// Mark as initialized.
		self.initialized = true;
	}
};

// Initialize the kirki object.
kirki.initialize();
var kirki = kirki || {};
kirki = jQuery.extend( kirki, {

	/**
	 * An object containing definitions for controls.
	 *
	 * @since 3.0.16
	 */
	control: {

		/**
		 * The radio control.
		 *
		 * @since 3.0.17
		 */
		'kirki-radio': {

			/**
			 * Init the control.
			 *
			 * @since 3.0.17
			 * @param {Object} control - The customizer control object.
			 * @returns {null}
			 */
			init: function( control ) {
				var self = this;

				// Render the template.
				self.template( control );

				// Init the control.
				kirki.input.radio.init( control );

			},

			/**
			 * Render the template.
			 *
			 * @since 3.0.17
			 * @param {Object} control - The customizer control object.
			 * @param {Object} control.params - The control parameters.
			 * @param {string} control.params.label - The control label.
			 * @param {string} control.params.description - The control description.
			 * @param {string} control.params.inputAttrs - extra input arguments.
			 * @param {string} control.params.default - The default value.
			 * @param {Object} control.params.choices - Any extra choices we may need.
			 * @param {string} control.id - The setting.
			 * @returns {null}
			 */
			template: function( control ) {
				var template = wp.template( 'kirki-input-radio' );
				control.container.html( template( {
					label: control.params.label,
					description: control.params.description,
					'data-id': control.id,
					inputAttrs: control.params.inputAttrs,
					'default': control.params.default,
					value: kirki.setting.get( control.id ),
					choices: control.params.choices
				} ) );
			}
		},

		/**
		 * The color control.
		 *
		 * @since 3.0.16
		 */
		'kirki-color': {

			/**
			 * Init the control.
			 *
			 * @since 3.0.16
			 * @param {Object} control - The customizer control object.
			 * @returns {null}
			 */
			init: function( control ) {
				var self = this;

				// Render the template.
				self.template( control );

				// Init the control.
				kirki.input.color.init( control );

			},

			/**
			 * Render the template.
			 *
			 * @since 3.0.16
			 * @param {Object}     control - The customizer control object.
			 * @param {Object}     control.params - The control parameters.
			 * @param {string}     control.params.label - The control label.
			 * @param {string}     control.params.description - The control description.
			 * @param {string}     control.params.mode - The colorpicker mode. Can be 'full' or 'hue'.
			 * @param {bool|array} control.params.palette - false if we don't want a palette,
			 *                                              true to use the default palette,
			 *                                              array of custom hex colors if we want a custom palette.
			 * @param {string}     control.params.inputAttrs - extra input arguments.
			 * @param {string}     control.params.default - The default value.
			 * @param {Object}     control.params.choices - Any extra choices we may need.
			 * @param {boolean}    control.params.choices.alpha - should we add an alpha channel?
			 * @param {string}     control.id - The setting.
			 * @returns {null}
			 */
			template: function( control ) {
				var template = wp.template( 'kirki-input-color' );
				control.container.html( template( {
					label: control.params.label,
					description: control.params.description,
					'data-id': control.id,
					mode: control.params.mode,
					inputAttrs: control.params.inputAttrs,
					'data-palette': control.params.palette,
					'data-default-color': control.params.default,
					'data-alpha': control.params.choices.alpha,
					value: kirki.setting.get( control.id )
				} ) );
			}
		},

		/**
		 * The generic control.
		 *
		 * @since 3.0.16
		 */
		'kirki-generic': {

			/**
			 * Init the control.
			 *
			 * @since 3.0.17
			 * @param {Object} control - The customizer control object.
			 * @param {Object} control.params - Control parameters.
			 * @param {Object} control.params.choices - Define the specifics for this input.
			 * @param {string} control.params.choices.element - The HTML element we want to use ('input', 'div', 'span' etc).
			 * @returns {null}
			 */
			init: function( control ) {
				var self = this;

				// Render the template.
				self.template( control );

				// Init the control.
				if ( ! _.isUndefined( control.params ) && ! _.isUndefined( control.params.choices ) && ! _.isUndefined( control.params.choices.element ) && 'textarea' === control.params.choices.element ) {
					kirki.input.textarea.init( control );
					return;
				}
				kirki.input.genericInput.init( control );
			},

			/**
			 * Render the template.
			 *
			 * @since 3.0.17
			 * @param {Object}  control - The customizer control object.
			 * @param {Object}  control.params - The control parameters.
			 * @param {string}  control.params.label - The control label.
			 * @param {string}  control.params.description - The control description.
			 * @param {string}  control.params.inputAttrs - extra input arguments.
			 * @param {string}  control.params.default - The default value.
			 * @param {Object}  control.params.choices - Any extra choices we may need.
			 * @param {boolean} control.params.choices.alpha - should we add an alpha channel?
			 * @param {string}  control.id - The setting.
			 * @returns {null}
			 */
			template: function( control ) {
				var args = {
						label: control.params.label,
						description: control.params.description,
						'data-id': control.id,
						inputAttrs: control.params.inputAttrs,
						choices: control.params.choices,
						value: kirki.setting.get( control.id )
					},
					template;

				if ( ! _.isUndefined( control.params ) && ! _.isUndefined( control.params.choices ) && ! _.isUndefined( control.params.choices.element ) && 'textarea' === control.params.choices.element ) {
					template = wp.template( 'kirki-input-textarea' );
					control.container.html( template( args ) );
					return;
				}
				template = wp.template( 'kirki-input-generic' );
				control.container.html( template( args ) );
			}
		},

		/**
		 * The number control.
		 *
		 * @since 3.0.26
		 */
		'kirki-number': {

			/**
			 * Init the control.
			 *
			 * @since 3.0.26
			 * @param {Object} control - The customizer control object.
			 * @returns {null}
			 */
			init: function( control ) {
				var self = this;

				// Render the template.
				self.template( control );

				// Init the control.
				kirki.input.number.init( control );
			},

			/**
			 * Render the template.
			 *
			 * @since 3.0.27
			 * @param {Object}  control - The customizer control object.
			 * @param {Object}  control.params - The control parameters.
			 * @param {string}  control.params.label - The control label.
			 * @param {string}  control.params.description - The control description.
			 * @param {string}  control.params.inputAttrs - extra input arguments.
			 * @param {string}  control.params.default - The default value.
			 * @param {Object}  control.params.choices - Any extra choices we may need.
			 * @param {string}  control.id - The setting.
			 * @returns {null}
			 */
			template: function( control ) {
				var template = wp.template( 'kirki-input-number' );

				control.container.html(
					template( args = {
						label: control.params.label,
						description: control.params.description,
						'data-id': control.id,
						inputAttrs: control.params.inputAttrs,
						choices: control.params.choices,
						value: kirki.setting.get( control.id )
					} )
				);
			}
		},

		/**
		 * The image control.
		 *
		 * @since 3.0.34
		 */
		'kirki-image': {

			/**
			 * Init the control.
			 *
			 * @since 3.0.34
			 * @param {Object} control - The customizer control object.
			 * @returns {null}
			 */
			init: function( control ) {
				var self = this;

				// Render the template.
				self.template( control );

				// Init the control.
				kirki.input.image.init( control );
			},

			/**
			 * Render the template.
			 *
			 * @since 3.0.34
			 * @param {Object}  control - The customizer control object.
			 * @param {Object}  control.params - The control parameters.
			 * @param {string}  control.params.label - The control label.
			 * @param {string}  control.params.description - The control description.
			 * @param {string}  control.params.inputAttrs - extra input arguments.
			 * @param {string}  control.params.default - The default value.
			 * @param {Object}  control.params.choices - Any extra choices we may need.
			 * @param {string}  control.id - The setting.
			 * @returns {null}
			 */
			template: function( control ) {
				var template = wp.template( 'kirki-input-image' );

				control.container.html(
					template( args = {
						label: control.params.label,
						description: control.params.description,
						'data-id': control.id,
						inputAttrs: control.params.inputAttrs,
						choices: control.params.choices,
						value: kirki.setting.get( control.id )
					} )
				);
			}
		},

		'kirki-select': {

			/**
			 * Init the control.
			 *
			 * @since 3.0.17
			 * @param {Object} control - The customizer control object.
			 * @returns {null}
			 */
			init: function( control ) {
				var self = this;

				// Render the template.
				self.template( control );

				// Init the control.
				kirki.input.select.init( control );
			},

			/**
			 * Render the template.
			 *
			 * @since 3.0.17
			 * @param {Object}  control - The customizer control object.
			 * @param {Object}  control.params - The control parameters.
			 * @param {string}  control.params.label - The control label.
			 * @param {string}  control.params.description - The control description.
			 * @param {string}  control.params.inputAttrs - extra input arguments.
			 * @param {Object}  control.params.default - The default value.
			 * @param {Object}  control.params.choices - The choices for the select dropdown.
			 * @param {string}  control.id - The setting.
			 * @returns {null}
			 */
			template: function( control ) {
				var template = wp.template( 'kirki-input-select' );

				control.container.html( template( {
					label: control.params.label,
					description: control.params.description,
					'data-id': control.id,
					inputAttrs: control.params.inputAttrs,
					choices: control.params.choices,
					value: kirki.setting.get( control.id ),
					multiple: control.params.multiple || 1,
					placeholder: control.params.placeholder
				} ) );
			}
		},
	}
} );
/* global kirkiL10n */
var kirki = kirki || {};
kirki = jQuery.extend( kirki, {

	/**
	 * An object containing definitions for input fields.
	 *
	 * @since 3.0.16
	 */
	input: {

		/**
		 * Radio input fields.
		 *
		 * @since 3.0.17
		 */
		radio: {

			/**
			 * Init the control.
			 *
			 * @since 3.0.17
			 * @param {Object} control - The control object.
			 * @param {Object} control.id - The setting.
			 * @returns {null}
			 */
			init: function( control ) {
				var input = jQuery( 'input[data-id="' + control.id + '"]' );

				// Save the value
				input.on( 'change keyup paste click', function() {
					kirki.setting.set( control.id, jQuery( this ).val() );
				} );
			}
		},

		/**
		 * Color input fields.
		 *
		 * @since 3.0.16
		 */
		color: {

			/**
			 * Init the control.
			 *
			 * @since 3.0.16
			 * @param {Object} control - The control object.
			 * @param {Object} control.id - The setting.
			 * @param {Object} control.choices - Additional options for the colorpickers.
			 * @param {Object} control.params - Control parameters.
			 * @param {Object} control.params.choices - alias for control.choices.

			 * @returns {null}
			 */
			init: function( control ) {
				var picker = jQuery( '.kirki-color-control[data-id="' + control.id + '"]' ),
					clear;

				control.choices = control.choices || {};
				if ( _.isEmpty( control.choices ) && control.params.choices ) {
					control.choices = control.params.choices;
				}

				// If we have defined any extra choices, make sure they are passed-on to Iris.
				if ( ! _.isEmpty( control.choices ) ) {
					picker.wpColorPicker( control.choices );
				}

				// Tweaks to make the "clear" buttons work.
				setTimeout( function() {
					clear = jQuery( '.kirki-input-container[data-id="' + control.id + '"] .wp-picker-clear' );
					if ( clear.length ) {
						clear.click( function() {
							kirki.setting.set( control.id, '' );
						} );
					}
				}, 200 );

				// Saves our settings to the WP API
				picker.wpColorPicker( {
					change: function() {

						// Small hack: the picker needs a small delay
						setTimeout( function() {
							kirki.setting.set( control.id, picker.val() );
						}, 20 );
					}
				} );
			}
		},

		/**
		 * Generic input fields.
		 *
		 * @since 3.0.17
		 */
		genericInput: {

			/**
			 * Init the control.
			 *
			 * @since 3.0.17
			 * @param {Object} control - The control object.
			 * @param {Object} control.id - The setting.
			 * @returns {null}
			 */
			init: function( control ) {
				var input = jQuery( 'input[data-id="' + control.id + '"]' );

				// Save the value
				input.on( 'change keyup paste click', function() {
					kirki.setting.set( control.id, jQuery( this ).val() );
				} );
			}
		},

		/**
		 * Generic input fields.
		 *
		 * @since 3.0.17
		 */
		textarea: {

			/**
			 * Init the control.
			 *
			 * @since 3.0.17
			 * @param {Object} control - The control object.
			 * @param {Object} control.id - The setting.
			 * @returns {null}
			 */
			init: function( control ) {
				var textarea = jQuery( 'textarea[data-id="' + control.id + '"]' );

				// Save the value
				textarea.on( 'change keyup paste click', function() {
					kirki.setting.set( control.id, jQuery( this ).val() );
				} );
			}
		},

		select: {

			/**
			 * Init the control.
			 *
			 * @since 3.0.17
			 * @param {Object} control - The control object.
			 * @param {Object} control.id - The setting.
			 * @returns {null}
			 */
			init: function( control ) {
				var element  = jQuery( 'select[data-id="' + control.id + '"]' ),
					multiple = parseInt( element.data( 'multiple' ), 10 ),
					selectValue,
					selectWooOptions = {
						escapeMarkup: function( markup ) {
							return markup;
						}
					};
					if ( control.params.placeholder ) {
						selectWooOptions.placeholder = control.params.placeholder;
						selectWooOptions.allowClear = true;
					}

				if ( 1 < multiple ) {
					selectWooOptions.maximumSelectionLength = multiple;
				}
				jQuery( element ).selectWoo( selectWooOptions ).on( 'change', function() {
					selectValue = jQuery( this ).val();
					selectValue = ( null === selectValue && 1 < multiple ) ? [] : selectValue;
					kirki.setting.set( control.id, selectValue );
				} );
			}
		},

		/**
		 * Number fields.
		 *
		 * @since 3.0.26
		 */
		number: {

			/**
			 * Init the control.
			 *
			 * @since 3.0.17
			 * @param {Object} control - The control object.
			 * @param {Object} control.id - The setting.
			 * @returns {null}
			 */
			init: function( control ) {

				var element = jQuery( 'input[data-id="' + control.id + '"]' ),
					value   = control.setting._value,
					up,
					down;

				// Make sure we use default values if none are define for some arguments.
				control.params.choices = _.defaults( control.params.choices, {
					min: 0,
					max: 100,
					step: 1
				} );

				// Make sure we have a valid value.
				if ( isNaN( value ) || '' === value ) {
					value = ( 0 > control.params.choices.min && 0 < control.params.choices.max ) ? 0 : control.params.choices.min;
				}
				value = parseFloat( value );

				// If step is 'any', set to 0.001.
				control.params.choices.step = ( 'any' === control.params.choices.step ) ? 0.001 : control.params.choices.step;

				// Make sure choices are properly formtted as numbers.
				control.params.choices.min  = parseFloat( control.params.choices.min );
				control.params.choices.max  = parseFloat( control.params.choices.max );
				control.params.choices.step = parseFloat( control.params.choices.step );

				up   = jQuery( '.kirki-input-container[data-id="' + control.id + '"] .plus' );
				down = jQuery( '.kirki-input-container[data-id="' + control.id + '"] .minus' );

				up.click( function() {
					var oldVal = parseFloat( element.val() ),
						newVal;

					newVal = ( oldVal >= control.params.choices.max ) ? oldVal : oldVal + control.params.choices.step;

					element.val( newVal );
					element.trigger( 'change' );
				} );

				down.click( function() {
					var oldVal = parseFloat( element.val() ),
						newVal;

					newVal = ( oldVal <= control.params.choices.min ) ? oldVal : oldVal - control.params.choices.step;

					element.val( newVal );
					element.trigger( 'change' );
				} );

				element.on( 'change keyup paste click', function() {
					var val = jQuery( this ).val();
					if ( isNaN( val ) ) {
						val = parseFloat( val, 10 );
						val = ( isNaN( val ) ) ? 0 : val;
						jQuery( this ).attr( 'value', val );
					}
					kirki.setting.set( control.id, val );
				} );
			}

		},

		/**
		 * Image fields.
		 *
		 * @since 3.0.34
		 */
		image: {

			/**
			 * Init the control.
			 *
			 * @since 3.0.34
			 * @param {Object} control - The control object.
			 * @returns {null}
			 */
			init: function( control ) {
				var value         = kirki.setting.get( control.id ),
					saveAs        = ( ! _.isUndefined( control.params.choices ) && ! _.isUndefined( control.params.choices.save_as ) ) ? control.params.choices.save_as : 'url',
					preview       = control.container.find( '.placeholder, .thumbnail' ),
					previewImage  = ( 'array' === saveAs ) ? value.url : value,
					removeButton  = control.container.find( '.image-upload-remove-button' ),
					defaultButton = control.container.find( '.image-default-button' );

				// Make sure value is properly formatted.
				value = ( 'array' === saveAs && _.isString( value ) ) ? { url: value } : value;

				// Tweaks for save_as = id.
				if ( ( 'id' === saveAs || 'ID' === saveAs ) && '' !== value ) {
					wp.media.attachment( value ).fetch().then( function() {
						setTimeout( function() {
							var url = wp.media.attachment( value ).get( 'url' );
							preview.removeClass().addClass( 'thumbnail thumbnail-image' ).html( '<img src="' + url + '" alt="" />' );
						}, 700 );
					} );
				}

				// If value is not empty, hide the "default" button.
				if ( ( 'url' === saveAs && '' !== value ) || ( 'array' === saveAs && ! _.isUndefined( value.url ) && '' !== value.url ) ) {
					control.container.find( 'image-default-button' ).hide();
				}

				// If value is empty, hide the "remove" button.
				if ( ( 'url' === saveAs && '' === value ) || ( 'array' === saveAs && ( _.isUndefined( value.url ) || '' === value.url ) ) ) {
					removeButton.hide();
				}

				// If value is default, hide the default button.
				if ( value === control.params.default ) {
					control.container.find( 'image-default-button' ).hide();
				}

				if ( '' !== previewImage ) {
					preview.removeClass().addClass( 'thumbnail thumbnail-image' ).html( '<img src="' + previewImage + '" alt="" />' );
				}

				control.container.on( 'click', '.image-upload-button', function( e ) {
					var image = wp.media( { multiple: false } ).open().on( 'select', function() {

						// This will return the selected image from the Media Uploader, the result is an object.
						var uploadedImage = image.state().get( 'selection' ).first(),
							jsonImg       = uploadedImage.toJSON(),
							previewImage  = jsonImg.url;

						if ( ! _.isUndefined( jsonImg.sizes ) ) {
							previewImage = jsonImg.sizes.full.url;
							if ( ! _.isUndefined( jsonImg.sizes.medium ) ) {
								previewImage = jsonImg.sizes.medium.url;
							} else if ( ! _.isUndefined( jsonImg.sizes.thumbnail ) ) {
								previewImage = jsonImg.sizes.thumbnail.url;
							}
						}

						if ( 'array' === saveAs ) {
							kirki.setting.set( control.id, {
								id: jsonImg.id,
								url: jsonImg.sizes.full.url,
								width: jsonImg.width,
								height: jsonImg.height
							} );
						} else if ( 'id' === saveAs ) {
							kirki.setting.set( control.id, jsonImg.id );
						} else {
							kirki.setting.set( control.id, ( ( ! _.isUndefined( jsonImg.sizes ) ) ? jsonImg.sizes.full.url : jsonImg.url ) );
						}

						if ( preview.length ) {
							preview.removeClass().addClass( 'thumbnail thumbnail-image' ).html( '<img src="' + previewImage + '" alt="" />' );
						}
						if ( removeButton.length ) {
							removeButton.show();
							defaultButton.hide();
						}
					} );

					e.preventDefault();
				} );

				control.container.on( 'click', '.image-upload-remove-button', function( e ) {

					var preview,
						removeButton,
						defaultButton;

					e.preventDefault();

					kirki.setting.set( control.id, '' );

					preview       = control.container.find( '.placeholder, .thumbnail' );
					removeButton  = control.container.find( '.image-upload-remove-button' );
					defaultButton = control.container.find( '.image-default-button' );

					if ( preview.length ) {
						preview.removeClass().addClass( 'placeholder' ).html( kirkiL10n.noFileSelected );
					}
					if ( removeButton.length ) {
						removeButton.hide();
						if ( jQuery( defaultButton ).hasClass( 'button' ) ) {
							defaultButton.show();
						}
					}
				} );

				control.container.on( 'click', '.image-default-button', function( e ) {

					var preview,
						removeButton,
						defaultButton;

					e.preventDefault();

					kirki.setting.set( control.id, control.params.default );

					preview       = control.container.find( '.placeholder, .thumbnail' );
					removeButton  = control.container.find( '.image-upload-remove-button' );
					defaultButton = control.container.find( '.image-default-button' );

					if ( preview.length ) {
						preview.removeClass().addClass( 'thumbnail thumbnail-image' ).html( '<img src="' + control.params.default + '" alt="" />' );
					}
					if ( removeButton.length ) {
						removeButton.show();
						defaultButton.hide();
					}
				} );
			}
		}
	}
} );
var kirki = kirki || {};
kirki = jQuery.extend( kirki, {

	/**
	 * An object containing definitions for settings.
	 *
	 * @since 3.0.16
	 */
	setting: {

		/**
		 * Gets the value of a setting.
		 *
		 * This is a helper function that allows us to get the value of
		 * control[key1][key2] for example, when the setting used in the
		 * customizer API is "control".
		 *
		 * @since 3.0.16
		 * @param {string} setting - The setting for which we're getting the value.
		 * @returns {mixed} Depends on the value.
		 */
		get: function( setting ) {
			var parts        = setting.split( '[' ),
				foundSetting = '',
				foundInStep  = 0,
				currentVal   = '';

			_.each( parts, function( part, i ) {
				part = part.replace( ']', '' );

				if ( 0 === i ) {
					foundSetting = part;
				} else {
					foundSetting += '[' + part + ']';
				}

				if ( ! _.isUndefined( wp.customize.instance( foundSetting ) ) ) {
					currentVal  = wp.customize.instance( foundSetting ).get();
					foundInStep = i;
				}

				if ( foundInStep < i ) {
					if ( _.isObject( currentVal ) && ! _.isUndefined( currentVal[ part ] ) ) {
						currentVal = currentVal[ part ];
					}
				}
			} );

			return currentVal;
		},

		/**
		 * Sets the value of a setting.
		 *
		 * This function is a bit complicated because there any many scenarios to consider.
		 * Example: We want to save the value for my_setting[something][3][something-else].
		 * The control's setting is my_setting[something].
		 * So we need to find that first, then figure out the remaining parts,
		 * merge the values recursively to avoid destroying my_setting[something][2]
		 * and also take into account any defined "key" arguments which take this even deeper.
		 *
		 * @since 3.0.16
		 * @param {object|string} element - The DOM element whose value has changed,
		 *                                  or an ID.
		 * @param {mixed}         value - Depends on the control-type.
		 * @param {string}        key - If we only want to save an item in an object
		 *                                  we can define the key here.
		 * @returns {null}
		 */
		set: function( element, value, key ) {
			var setting,
				parts,
				currentNode   = '',
				foundNode     = '',
				subSettingObj = {},
				currentVal,
				subSetting,
				subSettingParts;

			// Get the setting from the element.
			setting = element;
			if ( _.isObject( element ) ) {
				if ( jQuery( element ).attr( 'data-id' ) ) {
					setting = element.attr( 'data-id' );
				} else {
					setting = element.parents( '[data-id]' ).attr( 'data-id' );
				}
			}

			if ( 'undefined' !== typeof wp.customize.control( setting ) ) {
				wp.customize.control( setting ).setting.set( value );
				return;
			}

			parts = setting.split( '[' );

			// Find the setting we're using in the control using the customizer API.
			_.each( parts, function( part, i ) {
				part = part.replace( ']', '' );

				// The current part of the setting.
				currentNode = ( 0 === i ) ? part : '[' + part + ']';

				// When we find the node, get the value from it.
				// In case of an object we'll need to merge with current values.
				if ( ! _.isUndefined( wp.customize.instance( currentNode ) ) ) {
					foundNode  = currentNode;
					currentVal = wp.customize.instance( foundNode ).get();
				}
			} );

			// Get the remaining part of the setting that was unused.
			subSetting = setting.replace( foundNode, '' );

			// If subSetting is not empty, then we're dealing with an object
			// and we need to dig deeper and recursively merge the values.
			if ( '' !== subSetting ) {
				if ( ! _.isObject( currentVal ) ) {
					currentVal = {};
				}
				if ( '[' === subSetting.charAt( 0 ) ) {
					subSetting = subSetting.replace( '[', '' );
				}
				subSettingParts = subSetting.split( '[' );
				_.each( subSettingParts, function( subSettingPart, i ) {
					subSettingParts[ i ] = subSettingPart.replace( ']', '' );
				} );

				// If using a key, we need to go 1 level deeper.
				if ( key ) {
					subSettingParts.push( key );
				}

				// Converting to a JSON string and then parsing that to an object
				// may seem a bit hacky and crude but it's efficient and works.
				subSettingObj = '{"' + subSettingParts.join( '":{"' ) + '":"' + value + '"' + '}'.repeat( subSettingParts.length );
				subSettingObj = JSON.parse( subSettingObj );

				// Recursively merge with current value.
				jQuery.extend( true, currentVal, subSettingObj );
				value = currentVal;

			} else {
				if ( key ) {
					currentVal = ( ! _.isObject( currentVal ) ) ? {} : currentVal;
					currentVal[ key ] = value;
					value = currentVal;
				}
			}
			wp.customize.control( foundNode ).setting.set( value );
		}
	}
} );
/* global ajaxurl */
var kirki = kirki || {};
kirki = jQuery.extend( kirki, {
	/**
	 * A collection of utility methods.
	 *
	 * @since 3.0.17
	 */
	util: {
		media_query_devices: { desktop: 'desktop', tablet: 'tablet', mobile: 'mobile' },
		sides: { top: 'top', right: 'right', bottom: 'bottom', left: 'left' },
		sides_array: ['top', 'right', 'bottom', 'left'],
		/**
		 * A collection of utility methods for webfonts.
		 *
		 * @since 3.0.17
		 */
		webfonts: {

			/**
			 * Google-fonts related methods.
			 *
			 * @since 3.0.17
			 */
			google: {

				/**
				 * An object containing all Google fonts.
				 *
				 * to set this call this.setFonts();
				 *
				 * @since 3.0.17
				 */
				fonts: {},

				/**
				 * Init for google-fonts.
				 *
				 * @since 3.0.17
				 * @returns {null}
				 */
				initialize: function() {
					var self = this;

					self.setFonts();
				},

				/**
				 * Set fonts in this.fonts
				 *
				 * @since 3.0.17
				 * @returns {null}
				 */
				setFonts: function() {
					var self = this;

					// No need to run if we already have the fonts.
					if ( ! _.isEmpty( self.fonts ) ) {
						return;
					}

					// Make an AJAX call to set the fonts object (alpha).
					jQuery.post( ajaxurl, { 'action': 'kirki_fonts_google_all_get' }, function( response ) {

						// Get fonts from the JSON array.
						self.fonts = JSON.parse( response );
					} );
				},

				/**
				 * Gets all properties of a font-family.
				 *
				 * @since 3.0.17
				 * @param {string} family - The font-family we're interested in.
				 * @returns {Object}
				 */
				getFont: function( family ) {
					var self = this,
						fonts = self.getFonts();

					if ( 'undefined' === typeof fonts[ family ] ) {
						return false;
					}
					return fonts[ family ];
				},

				/**
				 * Gets all properties of a font-family.
				 *
				 * @since 3.0.17
				 * @param {string} order - How to order the fonts (alpha|popularity|trending).
				 * @param {int}    number - How many to get. 0 for all.
				 * @returns {Object}
				 */
				getFonts: function( order, category, number ) {
					var self        = this,
						ordered     = {},
						categorized = {},
						plucked     = {};

					// Make sure order is correct.
					order  = order || 'alpha';
					order  = ( 'alpha' !== order && 'popularity' !== order && 'trending' !== order ) ? 'alpha' : order;

					// Make sure number is correct.
					number = number || 0;
					number = parseInt( number, 10 );

					// Order fonts by the 'order' argument.
					if ( 'alpha' === order ) {
						ordered = jQuery.extend( {}, self.fonts.items );
					} else {
						_.each( self.fonts.order[ order ], function( family ) {
							ordered[ family ] = self.fonts.items[ family ];
						} );
					}

					// If we have a category defined get only the fonts in that category.
					if ( '' === category || ! category ) {
						categorized = ordered;
					} else {
						_.each( ordered, function( font, family ) {
							if ( category === font.category ) {
								categorized[ family ] = font;
							}
						} );
					}

					// If we only want a number of font-families get the 1st items from the results.
					if ( 0 < number ) {
						_.each( _.first( _.keys( categorized ), number ), function( family ) {
							plucked[ family ] = categorized[ family ];
						} );
						return plucked;
					}

					return categorized;
				},

				/**
				 * Gets the variants for a font-family.
				 *
				 * @since 3.0.17
				 * @param {string} family - The font-family we're interested in.
				 * @returns {Array}
				 */
				getVariants: function( family ) {
					var self = this,
						font = self.getFont( family );

					// Early exit if font was not found.
					if ( ! font ) {
						return false;
					}

					// Early exit if font doesn't have variants.
					if ( _.isUndefined( font.variants ) ) {
						return false;
					}

					// Return the variants.
					return font.variants;
				}
			},

			/**
			 * Standard fonts related methods.
			 *
			 * @since 3.0.17
			 */
			standard: {

				/**
				 * An object containing all Standard fonts.
				 *
				 * to set this call this.setFonts();
				 *
				 * @since 3.0.17
				 */
				fonts: {},

				/**
				 * Init for google-fonts.
				 *
				 * @since 3.0.17
				 * @returns {null}
				 */
				initialize: function() {
					var self = this;

					self.setFonts();
				},

				/**
				 * Set fonts in this.fonts
				 *
				 * @since 3.0.17
				 * @returns {null}
				 */
				setFonts: function() {
					var self = this;

					// No need to run if we already have the fonts.
					if ( ! _.isEmpty( self.fonts ) ) {
						return;
					}

					// Make an AJAX call to set the fonts object.
					jQuery.post( ajaxurl, { 'action': 'kirki_fonts_standard_all_get' }, function( response ) {

						// Get fonts from the JSON array.
						self.fonts = JSON.parse( response );
					} );
				},

				/**
				 * Gets the variants for a font-family.
				 *
				 * @since 3.0.17
				 * @returns {Array}
				 */
				getVariants: function() {
					return [ 'regular', 'italic', '700', '700italic' ];
				}
			},

			/**
			 * Figure out what this font-family is (google/standard)
			 *
			 * @since 3.0.20
			 * @param {string} family - The font-family.
			 * @returns {string|false} - Returns string if found (google|standard)
			 *                           and false in case the font-family is an arbitrary value
			 *                           not found anywhere in our font definitions.
			 */
			getFontType: function( family ) {
				var self = this;

				// Check for standard fonts first.
				if (
					'undefined' !== typeof self.standard.fonts[ family ] || (
						'undefined' !== typeof self.standard.fonts.stack &&
						'undefined' !== typeof self.standard.fonts.stack[ family ]
					)
				) {
					return 'standard';
				}

				// Check in googlefonts.
				if ( 'undefined' !== typeof self.google.fonts.items[ family ] ) {
					return 'google';
				}
				return false;
			}
		},

		validate: {
			cssValue: function( value ) {

				var validUnits = [ 'fr', 'rem', 'em', 'ex', '%', 'px', 'cm', 'mm', 'in', 'pt', 'pc', 'ch', 'vh', 'vw', 'vmin', 'vmax' ],
					numericValue,
					unit;

				// Early exit if value is not a string or a number.
				if ( 'string' !== typeof value || 'number' !== typeof value ) {
					return true;
				}

				// Whitelist values.
				if ( 0 === value || '0' === value || 'auto' === value || 'inherit' === value || 'initial' === value ) {
					return true;
				}

				// Skip checking if calc().
				if ( 0 <= value.indexOf( 'calc(' ) && 0 <= value.indexOf( ')' ) ) {
					return true;
				}

				// Get the numeric value.
				numericValue = parseFloat( value );

				// Get the unit
				unit = value.replace( numericValue, '' );

				// Allow unitless.
				if ( ! value ) {
					return;
				}

				// Check the validity of the numeric value and units.
				return ( ! isNaN( numericValue ) && -1 < jQuery.inArray( unit, validUnits ) );
			}
		},
		
		helpers: {
			setupMediaQueries: function( control ) {
				var has_units            = !_.isUndefined( control.params.choices.units );
				var desktop_wrappers     = control.container.find( '.control-wrapper-outer' ),
					desktop_unit_wrapper = control.container.find( '.kirki-unit-choices-outer' );
				var device_wrappers = {
					'desktop': [],
					'tablet': [],
					'mobile': []
				},
				unit_wrappers = {};
				//If media queries are not enabled in some way, just return the containers as desktop devices.
				if ( !control.params.choices.use_media_queries )
				{
					return {
						devices: { 'desktop': desktop_wrappers },
						units:   { 'desktop': desktop_unit_wrapper }
					};
				}
				
				desktop_wrappers.each( function(){
					var desktop_wrapper = $( this );
					//If media queries is enabled, we need to clone the containers for each device to keep input separated.
					//Clone the initial wrapper and add tablet/mobile.
					var tablet_wrapper = desktop_wrapper.clone().addClass( 'device-tablet' ).attr( 'device', 'tablet' ),
						mobile_wrapper = desktop_wrapper.clone().addClass( 'device-mobile' ).attr( 'device', 'mobile' );
					//Add desktop to the original wrapper.
					desktop_wrapper.addClass( 'device-desktop active' ).attr( 'device', 'desktop' );
					
					//Append to the container.
					tablet_wrapper.insertAfter( desktop_wrapper );
					mobile_wrapper.insertAfter( tablet_wrapper );
					
					//Add all the wrappers to the array for iterating.
					device_wrappers['desktop'].push( desktop_wrapper );
					device_wrappers['tablet'].push( tablet_wrapper );
					device_wrappers['mobile'].push( mobile_wrapper );
				});
				//If we're using units, we need to do the same thing.
				if ( has_units )
				{
					//Do the same type of duplication as above.
					var tablet_unit_wrapper = desktop_unit_wrapper.clone().addClass( 'device-tablet' ).attr( 'device', 'tablet' ),
						mobile_unit_wrapper = desktop_unit_wrapper.clone().addClass( 'device-mobile' ).attr( 'device', 'mobile' );
					desktop_unit_wrapper.addClass( 'device-desktop active' ).attr( 'device', 'desktop' );
					
					//Append to the container.
					tablet_unit_wrapper.insertAfter( desktop_unit_wrapper );
					mobile_unit_wrapper.insertAfter( tablet_unit_wrapper );
					
					//Append to the unit_wrapper object.
					unit_wrappers['desktop'] = desktop_unit_wrapper;
					unit_wrappers['tablet']  = tablet_unit_wrapper;
					unit_wrappers['mobile']  = mobile_unit_wrapper;
					
					//Normalize the IDs of the unit choices to match the device.
					_.each( unit_wrappers, function( unit_wrapper )
					{
						var choice_wrappers = unit_wrapper.find( '.kirki-unit-choice' ),
							device          = unit_wrapper.attr( 'device' );
						choice_wrappers.each( function()
						{
							var choice_wrapper = $( this ),
								input          = choice_wrapper.find( 'input[type="radio"]' ),
								label          = choice_wrapper.find( 'label' ),
								id             = input.attr( 'id' ),
								name           = input.attr( 'name' )
								new_id         = id + '_' + device,
								new_name       = name + '_' + device;
							input.attr( 'id', new_id ).attr( 'name', new_name );
							label.attr( 'for', new_id );
						});
					});
				}
				
				return {
					devices: device_wrappers,
					units: unit_wrappers
				};
			},
			initUnitSelect: function( control, args )
			{
				var container = control.container,
					unit_radios = jQuery( '.kirki-unit-choice input[type="radio"]', container );
				if ( args.selected_unit )
					unit_radios.filter( '[value="' + args.selected_unit + '"]' ).click();
				else
					unit_radios.first().click();
				unit_radios.on( 'change', function( e )
				{
					e.preventDefault();
					e.stopPropagation();
					var unit_radio = $( this ),
						new_unit = unit_radio.val();
					if ( args.unit_changed )
						args.unit_changed ( new_unit );
				});
			},
			selectUnit: function( unit_wrapper, value ) {
				var radios = unit_wrapper.find( 'input[type="radio"]' );
				if ( !value )
				{
					value = radios.first().val();
				}
				radios.filter( ':checked' ).prop( 'checked', false );
				var wanted_radio = radios.filter( '[value="' + value + '"]' );
				if ( wanted_radio.length )
					wanted_radio.prop( 'checked', true ).trigger( 'change' );
				else
					radios.first().prop( 'checked', true ).trigger( 'change' );
			},
		},

		/**
		 * Parses HTML Entities.
		 *
		 * @since 3.0.34
		 * @param {string} str - The string we want to parse.
		 * @returns {string}
		 */
		parseHtmlEntities: function( str ) {
			var parser = new DOMParser,
				dom    = parser.parseFromString(
					'<!doctype html><body>' + str, 'text/html'
				);

			return dom.body.textContent;
		},
		
		parseNumber: function( str ){
			return parseFloat( str );
			// var numberRegex = /[0-9]\d{0,9}(\.\d{1,3})?%?/gm;
			// if ( typeof str === 'undefined' )
			// 	return '';
			// var result = str.toString().match( numberRegex );
			// if ( result )
			// 	return result[0];
			// else
			// 	return null;
		}
	}
} );
/* global kirki */
/**
 * The majority of the code in this file
 * is derived from the wp-customize-posts plugin
 * and the work of @westonruter to whom I am very grateful.
 *
 * @see https://github.com/xwp/wp-customize-posts
 */

( function() {
	'use strict';

	/**
	 * A dynamic color-alpha control.
	 *
	 * @class
	 * @augments wp.customize.Control
	 * @augments wp.customize.Class
	 */
	wp.customize.kirkiDynamicControl = wp.customize.Control.extend( {

		initialize: function( id, options ) {
			var control = this,
				args    = options || {};

			args.params = args.params || {};
			if ( ! args.params.type ) {
				args.params.type = 'kirki-generic';
			}
			if ( ! args.params.content ) {
				args.params.content = jQuery( '<li></li>' );
				args.params.content.attr( 'id', 'customize-control-' + id.replace( /]/g, '' ).replace( /\[/g, '-' ) );
				args.params.content.attr( 'class', 'customize-control customize-control-' + args.params.type );
			}

			control.propertyElements = [];
			wp.customize.Control.prototype.initialize.call( control, id, args );
		},

		/**
		 * Add bidirectional data binding links between inputs and the setting(s).
		 *
		 * This is copied from wp.customize.Control.prototype.initialize(). It
		 * should be changed in Core to be applied once the control is embedded.
		 *
		 * @private
		 * @returns {null}
		 */
		_setUpSettingRootLinks: function() {
			var control = this,
				nodes   = control.container.find( '[data-customize-setting-link]' );

			nodes.each( function() {
				var node = jQuery( this );

				wp.customize( node.data( 'customizeSettingLink' ), function( setting ) {
					var element = new wp.customize.Element( node );
					control.elements.push( element );
					element.sync( setting );
					element.set( setting() );
				} );
			} );
		},

		/**
		 * Add bidirectional data binding links between inputs and the setting properties.
		 *
		 * @private
		 * @returns {null}
		 */
		_setUpSettingPropertyLinks: function() {
			var control = this,
				nodes;

			if ( ! control.setting ) {
				return;
			}

			nodes = control.container.find( '[data-customize-setting-property-link]' );

			nodes.each( function() {
				var node = jQuery( this ),
					element,
					propertyName = node.data( 'customizeSettingPropertyLink' );

				element = new wp.customize.Element( node );
				control.propertyElements.push( element );
				element.set( control.setting()[ propertyName ] );

				element.bind( function( newPropertyValue ) {
					var newSetting = control.setting();
					if ( newPropertyValue === newSetting[ propertyName ] ) {
						return;
					}
					newSetting = _.clone( newSetting );
					newSetting[ propertyName ] = newPropertyValue;
					control.setting.set( newSetting );
				} );
				control.setting.bind( function( newValue ) {
					if ( newValue[ propertyName ] !== element.get() ) {
						element.set( newValue[ propertyName ] );
					}
				} );
			} );
		},

		/**
		 * @inheritdoc
		 */
		ready: function() {
			var control = this;

			control._setUpSettingRootLinks();
			control._setUpSettingPropertyLinks();

			wp.customize.Control.prototype.ready.call( control );

			control.deferred.embedded.done( function() {
				control.initKirkiControl( control );
			} );
		},

		/**
		 * Embed the control in the document.
		 *
		 * Override the embed() method to do nothing,
		 * so that the control isn't embedded on load,
		 * unless the containing section is already expanded.
		 *
		 * @returns {null}
		 */
		embed: function() {
			var control   = this,
				sectionId = control.section();

			if ( ! sectionId ) {
				return;
			}

			wp.customize.section( sectionId, function( section ) {
				if ( 'kirki-expanded' === section.params.type || section.expanded() || wp.customize.settings.autofocus.control === control.id ) {
					control.actuallyEmbed();
				} else {
					section.expanded.bind( function( expanded ) {
						if ( expanded ) {
							control.actuallyEmbed();
						}
					} );
				}
			} );
		},

		/**
		 * Deferred embedding of control when actually
		 *
		 * This function is called in Section.onChangeExpanded() so the control
		 * will only get embedded when the Section is first expanded.
		 *
		 * @returns {null}
		 */
		actuallyEmbed: function() {
			var control = this;
			if ( 'resolved' === control.deferred.embedded.state() ) {
				return;
			}
			control.renderContent();
			control.deferred.embedded.resolve(); // This triggers control.ready().
		},

		/**
		 * This is not working with autofocus.
		 *
		 * @param {object} [args] Args.
		 * @returns {null}
		 */
		focus: function( args ) {
			var control = this;
			control.actuallyEmbed();
			wp.customize.Control.prototype.focus.call( control, args );
		},

		/**
		 * Additional actions that run on ready.
		 *
		 * @param {object} [args] Args.
		 * @returns {null}
		 */
		initKirkiControl: function( control ) {
			if ( 'undefined' !== typeof kirki.control[ control.params.type ] ) {
				kirki.control[ control.params.type ].init( control );
				return;
			}

			// Save the value
			this.container.on( 'change keyup paste click', 'input', function() {
				control.setting.set( jQuery( this ).val() );
			} );
		}
	} );
}() );
_.each( kirki.control, function( obj, type ) {
	wp.customize.controlConstructor[ type ] = wp.customize.kirkiDynamicControl.extend( {} );
} );
jQuery( document ).ready( function( $ ) {
	var observer = new MutationObserver(function (mutations, me) {
		// Responsive switchers
		$( '.kirki-responsive-switchers li' ).off( 'click') .on( 'click', function( event ) {
			event.preventDefault();
			// Set up variables
			var $this 		= $( this ),
				$devices 	= $( '.kirki-responsive-switchers' ),
				$device 	= $this.attr( 'device' ),
				$control 	= $( '.customize-control.has-switchers' ),
				$body 		= $( '.wp-full-overlay' ),
				$footer_devices = $( '.wp-full-overlay-footer .devices' );
			
			// Button class
			$devices.find( 'li' ).removeClass( 'active' );
			if ( $device !== 'desktop' )
				$devices.find( 'li.' + $device ).addClass( 'active' );
			
			// Control class
			$control.find( '.control-wrapper-outer' ).removeClass( 'active' );
			$control.find( '.control-wrapper-outer.device-' + $device ).addClass( 'active' );
			$control.removeClass( 'device-desktop device-tablet device-mobile' ).addClass( 'device-' + $device );
			
			// Unit class
			$control.find( '.kirki-unit-choices-outer' ).removeClass( 'active' );
			$control.find( '.kirki-unit-choices-outer.device-' + $device ).addClass( 'active' );
			
			// Wrapper class
			$body.removeClass( 'preview-desktop preview-tablet preview-mobile' ).addClass( 'preview-' + $device );
			
			// Panel footer buttons
			$footer_devices.find( 'button' ).removeClass( 'active' ).attr( 'aria-pressed', false );
			$footer_devices.find( 'button.preview-' + $device ).addClass( 'active' ).attr( 'aria-pressed', true );
			
			// Open switchers
			if ( $this.hasClass( 'desktop' ) ) {
				$control.toggleClass( 'responsive-switchers-open' );
			}
			
		} );
			
		// If panel footer buttons clicked
		$( '.wp-full-overlay-footer .devices button' ).on( 'click', function( event ) {
			
			// Set up variables
			var $this 		= $( this ),
				$devices 	= $( '.customize-control.has-switchers .kirki-responsive-switchers' ),
				$device 	= $( event.currentTarget ).data( 'device' ),
				$control 	= $( '.customize-control.has-switchers' );
			
			// Button class
			$devices.find( 'li' ).removeClass( 'active' );
			if ( $device !== 'desktop' )
				$devices.find( 'li.' + $device ).addClass( 'active' );
			
			// Control class
			$control.find( '.control-wrapper-outer' ).removeClass( 'active' );
			$control.find( '.control-wrapper-outer.device-' + $device ).addClass( 'active' );
			$control.removeClass( 'device-desktop device-tablet device-mobile' ).addClass( 'device-' + $device );
			
			// Unit class
			$control.find( '.kirki-unit-choices-outer' ).removeClass( 'active' );
			$control.find( '.kirki-unit-choices-outer.device-' + $device ).addClass( 'active' );
			
			// Open switchers
			if ( ! $this.hasClass( 'preview-desktop' ) ) {
			} else {
				$control.removeClass( 'responsive-switchers-open' );
			}
		
		} );
	});
	observer.observe(document, {
		childList: true,
		subtree: true
	});
});/* global kirkiControlLoader */
wp.customize.controlConstructor['kirki-background'] = wp.customize.Control.extend( {

	// When we're finished loading continue processing
	ready: function() {
		
		'use strict';
		
		var control = this;

		// Init the control.
		if ( ! _.isUndefined( window.kirkiControlLoader ) && _.isFunction( kirkiControlLoader ) ) {
			kirkiControlLoader( control );
		} else {
			control.initKirkiControl();
		}
	},

	initKirkiControl: function() {

		var control = this,
			value   = control.setting._value,
			picker  = control.container.find( '.kirki-color-control' );

		// Hide unnecessary controls if the value doesn't have an image.
		if ( _.isUndefined( value['background-image'] ) || '' === value['background-image'] ) {
			control.container.find( '.background-wrapper > .background-repeat' ).hide();
			control.container.find( '.background-wrapper > .background-position' ).hide();
			control.container.find( '.background-wrapper > .background-size' ).hide();
			control.container.find( '.background-wrapper > .background-attachment' ).hide();
		}

		// Color.
		picker.wpColorPicker( {
			change: function() {
				setTimeout( function() {
					control.saveValue( 'background-color', picker.val() );
				}, 100 );
			}
		} );

		// Background-Repeat.
		control.container.on( 'change', '.background-repeat select', function() {
			control.saveValue( 'background-repeat', jQuery( this ).val() );
		} );

		// Background-Size.
		control.container.on( 'change click', '.background-size input', function() {
			control.saveValue( 'background-size', jQuery( this ).val() );
		} );

		// Background-Position.
		control.container.on( 'change', '.background-position select', function() {
			control.saveValue( 'background-position', jQuery( this ).val() );
		} );

		// Background-Attachment.
		control.container.on( 'change click', '.background-attachment input', function() {
			control.saveValue( 'background-attachment', jQuery( this ).val() );
		} );

		// Background-Image.
		control.container.on( 'click', '.background-image-upload-button', function( e ) {
			var image = wp.media( { multiple: false } ).open().on( 'select', function() {

				// This will return the selected image from the Media Uploader, the result is an object.
				var uploadedImage = image.state().get( 'selection' ).first(),
					previewImage   = uploadedImage.toJSON().sizes.full.url,
					imageUrl,
					imageID,
					imageWidth,
					imageHeight,
					preview,
					removeButton;

				if ( ! _.isUndefined( uploadedImage.toJSON().sizes.medium ) ) {
					previewImage = uploadedImage.toJSON().sizes.medium.url;
				} else if ( ! _.isUndefined( uploadedImage.toJSON().sizes.thumbnail ) ) {
					previewImage = uploadedImage.toJSON().sizes.thumbnail.url;
				}

				imageUrl    = uploadedImage.toJSON().sizes.full.url;
				imageID     = uploadedImage.toJSON().id;
				imageWidth  = uploadedImage.toJSON().width;
				imageHeight = uploadedImage.toJSON().height;

				// Show extra controls if the value has an image.
				if ( '' !== imageUrl ) {
					control.container.find( '.background-wrapper > .background-repeat, .background-wrapper > .background-position, .background-wrapper > .background-size, .background-wrapper > .background-attachment' ).show();
				}

				control.saveValue( 'background-image', imageUrl );
				preview      = control.container.find( '.placeholder, .thumbnail' );
				removeButton = control.container.find( '.background-image-upload-remove-button' );

				if ( preview.length ) {
					preview.removeClass().addClass( 'thumbnail thumbnail-image' ).html( '<img src="' + previewImage + '" alt="" />' );
				}
				if ( removeButton.length ) {
					removeButton.show();
				}
			} );

			e.preventDefault();
		} );

		control.container.on( 'click', '.background-image-upload-remove-button', function( e ) {

			var preview,
				removeButton;

			e.preventDefault();

			control.saveValue( 'background-image', '' );

			preview      = control.container.find( '.placeholder, .thumbnail' );
			removeButton = control.container.find( '.background-image-upload-remove-button' );

			// Hide unnecessary controls.
			control.container.find( '.background-wrapper > .background-repeat' ).hide();
			control.container.find( '.background-wrapper > .background-position' ).hide();
			control.container.find( '.background-wrapper > .background-size' ).hide();
			control.container.find( '.background-wrapper > .background-attachment' ).hide();

			if ( preview.length ) {
				preview.removeClass().addClass( 'placeholder' ).html( 'No file selected' );
			}
			if ( removeButton.length ) {
				removeButton.hide();
			}
		} );
	},

	/**
	 * Saves the value.
	 */
	saveValue: function( property, value ) {

		var control = this,
			input   = jQuery( '#customize-control-' + control.id.replace( '[', '-' ).replace( ']', '' ) + ' .background-hidden-value' ),
			val     = control.setting._value;

		val[ property ] = value;

		jQuery( input ).attr( 'value', JSON.stringify( val ) ).trigger( 'change' );
		control.setting.set( val );
	}
} );
wp.customize.controlConstructor['kirki-border'] = wp.customize.kirkiDynamicControl.extend( {
	initKirkiControl: function() {
		var control = this,
			container = control.container,
			style_select = jQuery( '.border-style select', container),
			inputs = jQuery( '.kirki-control-dimension input', container),
			link_inputs_btn = jQuery( '.kirki-input-link', container),
			color_picker = jQuery( '.color input', container ),
			has_units = !_.isUndefined( control.params.choices.units ),
			value = control.setting._value;
		
		control.has_units = has_units;
		
		if ( !has_units )
			inputs.attr( 'type', 'text' );
		
		if ( !value && control.params.default )
		{
			value = control.params.default;
			if ( _.isUndefined( value['unit'] ) )
				value['unit'] = jQuery( '.kirki-unit-choice input[type="radio"]:first', container ).val()
		}
		if ( value )
		{
			style_select.val( value['style'] || 'none' );
			control.fill_inputs( value );
		}
		else
			style_select.val( 'none' );
		
		color_picker.attr( 'data-default-color', value['color'] )
			.data( 'default-color', value['color'] )
			.val( value['color'] )
			.wpColorPicker( {
				change: function(e, ui) {
					setTimeout(function(){
						control.save();
					}, 100);
				},
				clear: function (event) {
					setTimeout( function() {
						control.save();
					}, 100 );
				}
			});
		
		if ( has_units )
		{
			kirki.util.helpers.initUnitSelect( control, {
				selected_unit: value['unit'],
				unit_changed: function( new_unit ) {
					control.save();
				}
			});
		}
		
		style_select.change( function( e ) {
			e.preventDefault();
			control.toggle_visibility( style_select );
			control.save();
		});
	
		inputs.on( 'keyup change click', function() {
			var input = jQuery( this );
			var cur_val = input.val();
			var last_val = input.attr( 'last-val' );
			if ( cur_val != last_val )
			{
				input.attr( 'last-val', cur_val );
				if ( link_inputs_btn.hasClass( 'linked' ) )
				{
					inputs.attr( 'last-val', cur_val );
					inputs.val( cur_val );
				}
				control.save();
			}
		});
	
		link_inputs_btn.click( function( e )
		{
			e.preventDefault();
			link_inputs_btn.toggleClass( 'unlinked linked' );
		});
		
		this.toggle_visibility( style_select );
		
		if ( control.params.choices.sync_values )
			link_inputs_btn.click();
	},
	
	toggle_visibility: function( style_select )
	{
		var val = style_select.val(),
			containers = jQuery( '.size,.color', this.container );
		if ( val !== 'none' )
			containers.show();
		else
			containers.hide();
	},
	
	fill_inputs: function( value )
	{
		var control = this;
		_.each( ['top', 'right', 'bottom', 'left'], function( side )
		{
			if ( _.isUndefined( control.params.default[side] ))
				return false;
			var input = jQuery( '[side="' + side + '"]', control.container ),
				border_val = value[side];
			if ( value['unit'] && value['unit'] !== '' )
				border_val = kirki.util.parseNumber( border_val );
			input.val( border_val );
		});
	},
	
	save: function()
	{
		var new_val = {};
		var control = this,
			container = this.container,
			input = jQuery( '.border-hidden-value', container ),
			border_style = jQuery( '.border-style select', container).val(),
			selected_unit = jQuery( '.kirki-unit-choice input[type="radio"]:checked', container ),
			color = jQuery( '.color input', container).val();
		new_val['style'] = border_style;
		new_val['unit']  = selected_unit.val();
		new_val['color'] = color;
		_.each( ['top', 'right', 'bottom', 'left'], function ( side )
		{
			var val = 0;
			if ( !_.isUndefined( control.params.default[side] ) )
			{
				val = jQuery( 'input[side="' + side + '"]', container).val();
				if ( !val )
					val = 0;
			}
			if ( value != 0 && new_val['unit'] !== '' )
				val += new_val['unit'];
			new_val[side] = val;
		});
		input.attr( 'value', JSON.stringify ( new_val ) ).trigger( 'change' );
		control.setting.set( new_val );
	}
} );wp.customize.controlConstructor['kirki-box-shadow'] = wp.customize.kirkiDynamicControl.extend( {
	initKirkiControl: function() {
		var control = this,
			container = control.container,
			inputs = jQuery( '.kirki-control-dimension input', container),
			color_picker = jQuery( '.color input', container ),
			value = control.setting._value;
		
		if ( !value && control.params.default )
			value = control.params.default;
		
		if ( value )
			control.fill_inputs( value );
		
		color_picker.attr( 'data-default-color', value['color'] )
			.data( 'default-color', value['color'] )
			.val( value['color'] )
			.wpColorPicker( {
				change: function(e, ui) {
					setTimeout(function(){
						control.save();
					}, 100);
				},
				clear: function (event) {
					setTimeout( function() {
						control.save();
					}, 100 );
				}
			});

		inputs.on( 'keyup change click', function() {
			var input = jQuery( this );
			var cur_val = input.val();
			var last_val = input.attr( 'last-val' );
			if ( cur_val != last_val )
			{
				input.attr( 'last-val', cur_val );
				control.save();
			}
		});
	},
	
	fill_inputs: function( value )
	{
		var control = this;
		_.each( ['h_offset', 'v_offset', 'blur', 'spread'], function( side )
		{
			if ( side == 'blur' || side == 'spread' )
				if ( _.isUndefined( control.params.default[side] ))
					return false;
			var input = jQuery( '[side="' + side + '"]', control.container ),
				val = kirki.util.parseNumber( value[side] );
			input.val( val );
		});
	},
	
	save: function()
	{
		var new_val = {};
		var control = this,
			container = this.container,
			input = jQuery( '.border-hidden-value', container ),
			color = jQuery( '.color input', container).val();
		
		_.each( ['h_offset', 'v_offset', 'blur', 'spread'], function ( side )
		{
			var val = jQuery( 'input[side="' + side + '"]', container).val();
			if ( side == 'blur' || side == 'spread' )
				if ( _.isUndefined( control.params.default[side] ))
					val = 0;
			if ( _.isEmpty( val ) )
				val = 0;
			new_val[side] = val + 'px';
		});
		
		new_val['color'] = color;
		input.attr( 'value', JSON.stringify ( new_val ) ).trigger( 'change' );
		control.setting.set( new_val );
	}
} );wp.customize.controlConstructor['kirki-color-palette'] = wp.customize.kirkiDynamicControl.extend( {} );
wp.customize.controlConstructor['kirki-gradient'] = wp.customize.kirkiDynamicControl.extend( {
	// When we're finished loading continue processing
	ready: function() {
	
		'use strict';
		
		var control = this;

		// Init the control.
		if ( ! _.isUndefined( window.kirkiControlLoader ) && _.isFunction( kirkiControlLoader ) ) {
			kirkiControlLoader( control );
		} else {
			control.initKirkiControl();
		}
	},
	
	initKirkiControl: function() {
		var control = this,
			container = control.container,
			input = jQuery( '.gradient-hidden-value', container ),
			color1_picker = jQuery( '.color1 .color-picker', container ),
			color2_picker = jQuery( '.color2 .color-picker', container ),
			location = jQuery( '.location input', container ),
			textInput    = control.container.find( '.slider-wrapper .value input' ),
			sliderReset  = control.container.find( '.slider-reset' ),
			locationChangeAction = ( 'postMessage' === control.setting.transport ) ? 'mousemove change' : 'change',
			direction = container.find( '.direction select' ),
			value = control.setting._value;
		if ( !value )
			value = control.params.default;
		if ( !value )
		{
			value = {
				color1: '',
				color2: '',
				location: '0%',
				direction: ''
			};
		}
		color1_picker.attr( 'data-default-color', value['color1'] )
			.data( 'default-color', value['color1'] )
			.val( value['color1'] )
			.wpColorPicker( {
				change: function(e, ui)
				{
					setTimeout(function()
					{
						save();
					}, 100 );
				}
			});
		color2_picker.attr( 'data-default-color', value['color2'] )
			.data( 'default-color', value['color2'] )
			.val( value['color2'] )
			.wpColorPicker( {
				change: function(e, ui)
				{
					setTimeout(function()
					{
						save();
					}, 100 );
				}
			});
		location.val( value['location'].replace( '%', '' ) );
		direction.val( value['direction'] );
		
		location.on( locationChangeAction, function( e )
		{
			//e.preventDefault();
			textInput.attr( 'value', location.val() );
			save();
		});
		
		textInput.on( 'input paste change', function( e ) {
			//location.val( textInput.val() ).trigger( 'change' );
		} );
		
		direction.on( 'change', function( e ) {
			save();
		});
		
		sliderReset.click( function( e ) {
			var defVal = control.params.default['location'].replace( '%', '') || 0;
			location.val( defVal );
			textInput.val( defVal );
		});
		
		function save()
		{
			var value = {
				color1: color1_picker.val(),
				color2: color2_picker.val(),
				location: location.val() + '%',
				direction: direction.val()
			};
			input.attr( 'value', JSON.stringify( value ) ).trigger( 'change' );
			control.setting.set( value );
		}
	}
} );
wp.customize.controlConstructor['kirki-dashicons'] = wp.customize.kirkiDynamicControl.extend( {} );
wp.customize.controlConstructor['kirki-date'] = wp.customize.kirkiDynamicControl.extend( {

	initKirkiControl: function() {
		var control  = this,
			selector = control.selector + ' input.datepicker';

		// Init the datepicker
		jQuery( selector ).datepicker( {
			dateFormat: 'yy-mm-dd'
		} );

		// Save the changes
		this.container.on( 'change keyup paste', 'input.datepicker', function() {
			control.setting.set( jQuery( this ).val() );
		} );
	}
} );
/* global dimensionkirkiL10n */
wp.customize.controlConstructor['kirki-dimension'] = wp.customize.kirkiDynamicControl.extend( {

	initKirkiControl: function() {

		var control = this,
			value;

		// Notifications.
		control.kirkiNotifications();

		// Save the value
		this.container.on( 'change keyup paste', 'input', function() {

			value = jQuery( this ).val();
			control.setting.set( value );
		} );
	},

	/**
	 * Handles notifications.
	 */
	kirkiNotifications: function() {

		var control        = this,
			acceptUnitless = ( 'undefined' !== typeof control.params.choices && 'undefined' !== typeof control.params.choices.accept_unitless && true === control.params.choices.accept_unitless );

		wp.customize( control.id, function( setting ) {
			setting.bind( function( value ) {
				var code = 'long_title';

				if ( false === kirki.util.validate.cssValue( value ) && ( ! acceptUnitless || isNaN( value ) ) ) {
					setting.notifications.add( code, new wp.customize.Notification(
						code,
						{
							type: 'warning',
							message: dimensionkirkiL10n['invalid-value']
						}
					) );
				} else {
					setting.notifications.remove( code );
				}
			} );
		} );
	}
} );
/* global dimensionskirkiL10n */
wp.customize.controlConstructor['kirki-dimensions'] = wp.customize.kirkiDynamicControl.extend( {

	initKirkiControl: function() {

		var control     = this,
			subControls = control.params.choices.controls,
			value       = {},
			subsArray   = [],
			i;

		_.each( subControls, function( v, i ) {
			if ( true === v ) {
				subsArray.push( i );
			}
		} );

		for ( i = 0; i < subsArray.length; i++ ) {
			value[ subsArray[ i ] ] = control.setting._value[ subsArray[ i ] ];
			control.updateDimensionsValue( subsArray[ i ], value );
		}
	},

	/**
	 * Updates the value.
	 */
	updateDimensionsValue: function( context, value ) {

		var control = this;

		control.container.on( 'change keyup paste', '.' + context + ' input', function() {
			value[ context ] = jQuery( this ).val();

			// Notifications.
			control.kirkiNotifications();

			// Save the value
			control.saveValue( value );
		} );
	},

	/**
	 * Saves the value.
	 */
	saveValue: function( value ) {

		var control  = this,
			newValue = {};

		_.each( value, function( newSubValue, i ) {
			newValue[ i ] = newSubValue;
		} );

		control.setting.set( newValue );
	},

	/**
	 * Handles notifications.
	 */
	kirkiNotifications: function() {

		var control = this;

		wp.customize( control.id, function( setting ) {
			setting.bind( function( value ) {
				var code = 'long_title',
					subs = {},
					message;

				setting.notifications.remove( code );

				_.each( value, function( val, direction ) {
					if ( false === kirki.util.validate.cssValue( val ) ) {
						subs[ direction ] = val;
					} else {
						delete subs[ direction ];
					}
				} );

				if ( ! _.isEmpty( subs ) ) {
					message = dimensionskirkiL10n['invalid-value'] + ' (' + _.values( subs ).toString() + ') ';
					setting.notifications.add( code, new wp.customize.Notification( code, {
						type: 'warning',
						message: message
					} ) );
					return;
				}
				setting.notifications.remove( code );
			} );
		} );
	}
} );
/* global tinyMCE */
wp.customize.controlConstructor['kirki-editor'] = wp.customize.kirkiDynamicControl.extend( {

	initKirkiControl: function() {

		var control = this,
			element = control.container.find( 'textarea' ),
			id      = 'kirki-editor-' + control.id.replace( '[', '' ).replace( ']', '' ),
			editor;

		wp.editor.initialize( id, {
			tinymce: {
				wpautop: true
			},
			quicktags: true,
			mediaButtons: true
		} );

		editor = tinyMCE.get( id );

		if ( editor ) {
			editor.onChange.add( function( ed ) {
				var content;

				ed.save();
				content = editor.getContent();
				element.val( content ).trigger( 'change' );
				wp.customize.instance( control.id ).set( content );
			} );
		}
	}
} );
/* global fontAwesomeJSON */
wp.customize.controlConstructor['kirki-fontawesome'] = wp.customize.kirkiDynamicControl.extend( {

	initKirkiControl: function() {

		var control  = this,
			element  = this.container.find( 'select' ),
			icons    = jQuery.parseJSON( fontAwesomeJSON ),
			selectValue,
			selectWooOptions = {
				data: [],
				escapeMarkup: function( markup ) {
					return markup;
				},
				templateResult: function( val ) {
					return '<i class="fa fa-lg fa-' + val.id + '" aria-hidden="true"></i>' + ' ' + val.text;
				},
				templateSelection: function( val ) {
					return '<i class="fa fa-lg fa-' + val.id + '" aria-hidden="true"></i>' + ' ' + val.text;
				}
			},
			select;

		_.each( icons.icons, function( icon ) {
			selectWooOptions.data.push( {
				id: icon.id,
				text: icon.name
			} );
		} );

		select = jQuery( element ).selectWoo( selectWooOptions );

		select.on( 'change', function() {
			selectValue = jQuery( this ).val();
			control.setting.set( selectValue );
		} );
		select.val( control.setting._value ).trigger( 'change' );
	}
} );
wp.customize.controlConstructor['kirki-multicheck'] = wp.customize.kirkiDynamicControl.extend( {

	initKirkiControl: function() {

		var control = this;

		// Save the value
		control.container.on( 'change', 'input', function() {
			var value = [],
				i = 0;

			// Build the value as an object using the sub-values from individual checkboxes.
			jQuery.each( control.params.choices, function( key ) {
				if ( control.container.find( 'input[value="' + key + '"]' ).is( ':checked' ) ) {
					control.container.find( 'input[value="' + key + '"]' ).parent().addClass( 'checked' );
					value[ i ] = key;
					i++;
				} else {
					control.container.find( 'input[value="' + key + '"]' ).parent().removeClass( 'checked' );
				}
			} );

			// Update the value in the customizer.
			control.setting.set( value );
		} );
	}
} );
/* global kirkiControlLoader */
wp.customize.controlConstructor['kirki-multicolor'] = wp.customize.Control.extend( {

	// When we're finished loading continue processing
	ready: function() {

		'use strict';

		var control = this;

		// Init the control.
		if ( ! _.isUndefined( window.kirkiControlLoader ) && _.isFunction( kirkiControlLoader ) ) {
			kirkiControlLoader( control );
		} else {
			control.initKirkiControl();
		}
	},

	initKirkiControl: function() {

		'use strict';

		var control = this,
			colors  = control.params.choices,
			keys    = Object.keys( colors ),
			value   = this.params.value,
			i       = 0;

		// Proxy function that handles changing the individual colors
		function kirkiMulticolorChangeHandler( control, value, subSetting ) {

			var picker = control.container.find( '.multicolor-index-' + subSetting ),
				args   = {
					change: function() {

						// Color controls require a small delay.
						setTimeout( function() {

							// Set the value.
							control.saveValue( subSetting, picker.val() );

							// Trigger the change.
							control.container.find( '.multicolor-index-' + subSetting ).trigger( 'change' );
						}, 100 );
					}
				};

			if ( _.isObject( colors.irisArgs ) ) {
				_.each( colors.irisArgs, function( irisValue, irisKey ) {
					args[ irisKey ] = irisValue;
				} );
			}

			// Did we change the value?
			picker.wpColorPicker( args );
		}

		// Colors loop
		while ( i < Object.keys( colors ).length ) {
			kirkiMulticolorChangeHandler( this, value, keys[ i ] );
			i++;
		}
	},

	/**
	 * Saves the value.
	 */
	saveValue: function( property, value ) {

		var control = this,
			input   = control.container.find( '.multicolor-hidden-value' ),
			val     = control.setting._value;

		val[ property ] = value;

		jQuery( input ).attr( 'value', JSON.stringify( val ) ).trigger( 'change' );
		control.setting.set( val );
	}
} );
wp.customize.controlConstructor['kirki-palette'] = wp.customize.kirkiDynamicControl.extend( {} );
wp.customize.controlConstructor['kirki-radio-buttonset'] = wp.customize.kirkiDynamicControl.extend( {} );
wp.customize.controlConstructor['kirki-radio-image'] = wp.customize.kirkiDynamicControl.extend( {} );
/* global kirkiControlLoader */
var RepeaterRow = function( rowIndex, container, label, control ) {

	'use strict';

	var self        = this;
	this.rowIndex   = rowIndex;
	this.container  = container;
	this.label      = label;
	this.header     = this.container.find( '.repeater-row-header' );

	this.header.on( 'click', function() {
		self.toggleMinimize();
	} );

	this.container.on( 'click', '.repeater-row-remove', function() {
		self.remove();
	} );

	this.header.on( 'mousedown', function() {
		self.container.trigger( 'row:start-dragging' );
	} );

	this.container.on( 'keyup change', 'input, select, textarea', function( e ) {
		self.container.trigger( 'row:update', [ self.rowIndex, jQuery( e.target ).data( 'field' ), e.target ] );
	} );

	this.setRowIndex = function( rowIndex ) {
		this.rowIndex = rowIndex;
		this.container.attr( 'data-row', rowIndex );
		this.container.data( 'row', rowIndex );
		this.updateLabel();
	};

	this.toggleMinimize = function() {

		// Store the previous state.
		this.container.toggleClass( 'minimized' );
		this.header.find( '.dashicons' ).toggleClass( 'dashicons-arrow-up' ).toggleClass( 'dashicons-arrow-down' );
	};

	this.remove = function() {
		this.container.slideUp( 300, function() {
			jQuery( this ).detach();
		} );
		this.container.trigger( 'row:remove', [ this.rowIndex ] );
	};

	this.updateLabel = function() {
		var rowLabelField,
			rowLabel,
			rowLabelSelector;

		if ( 'field' === this.label.type ) {
			rowLabelField = this.container.find( '.repeater-field [data-field="' + this.label.field + '"]' );
			if ( _.isFunction( rowLabelField.val ) ) {
				rowLabel = rowLabelField.val();
				if ( '' !== rowLabel ) {
					if ( ! _.isUndefined( control.params.fields[ this.label.field ] ) ) {
						if ( ! _.isUndefined( control.params.fields[ this.label.field ].type ) ) {
							if ( 'select' === control.params.fields[ this.label.field ].type ) {
								if ( ! _.isUndefined( control.params.fields[ this.label.field ].choices ) && ! _.isUndefined( control.params.fields[ this.label.field ].choices[ rowLabelField.val() ] ) ) {
									rowLabel = control.params.fields[ this.label.field ].choices[ rowLabelField.val() ];
								}
							} else if ( 'radio' === control.params.fields[ this.label.field ].type || 'radio-image' === control.params.fields[ this.label.field ].type ) {
								rowLabelSelector = control.selector + ' [data-row="' + this.rowIndex + '"] .repeater-field [data-field="' + this.label.field + '"]:checked';
								rowLabel = jQuery( rowLabelSelector ).val();
							}
						}
					}
					this.header.find( '.repeater-row-label' ).text( rowLabel );
					return;
				}
			}
		}
		this.header.find( '.repeater-row-label' ).text( this.label.value + ' ' + ( this.rowIndex + 1 ) );
	};
	this.updateLabel();
};

wp.customize.controlConstructor.repeater = wp.customize.Control.extend( {

	// When we're finished loading continue processing
	ready: function() {

		'use strict';

		var control = this;

		// Init the control.
		if ( ! _.isUndefined( window.kirkiControlLoader ) && _.isFunction( kirkiControlLoader ) ) {
			kirkiControlLoader( control );
		} else {
			control.initKirkiControl();
		}
	},

	initKirkiControl: function() {

		'use strict';

		var control = this,
			limit,
			theNewRow;

		// The current value set in Control Class (set in Kirki_Customize_Repeater_Control::to_json() function)
		var settingValue = this.params.value;

		// The hidden field that keeps the data saved (though we never update it)
		this.settingField = this.container.find( '[data-customize-setting-link]' ).first();

		// Set the field value for the first time, we'll fill it up later
		this.setValue( [], false );

		// The DIV that holds all the rows
		this.repeaterFieldsContainer = this.container.find( '.repeater-fields' ).first();

		// Set number of rows to 0
		this.currentIndex = 0;

		// Save the rows objects
		this.rows = [];

		// Default limit choice
		limit = false;
		if ( ! _.isUndefined( this.params.choices.limit ) ) {
			limit = ( 0 >= this.params.choices.limit ) ? false : parseInt( this.params.choices.limit, 10 );
		}

		this.container.on( 'click', 'button.repeater-add', function( e ) {
			e.preventDefault();
			if ( ! limit || control.currentIndex < limit ) {
				theNewRow = control.addRow();
				theNewRow.toggleMinimize();
				control.initColorPicker();
				control.initSelect( theNewRow );
			} else {
				jQuery( control.selector + ' .limit' ).addClass( 'highlight' );
			}
		} );

		this.container.on( 'click', '.repeater-row-remove', function() {
			control.currentIndex--;
			if ( ! limit || control.currentIndex < limit ) {
				jQuery( control.selector + ' .limit' ).removeClass( 'highlight' );
			}
		} );

		this.container.on( 'click keypress', '.repeater-field-image .upload-button,.repeater-field-cropped_image .upload-button,.repeater-field-upload .upload-button', function( e ) {
			e.preventDefault();
			control.$thisButton = jQuery( this );
			control.openFrame( e );
		} );

		this.container.on( 'click keypress', '.repeater-field-image .remove-button,.repeater-field-cropped_image .remove-button', function( e ) {
			e.preventDefault();
			control.$thisButton = jQuery( this );
			control.removeImage( e );
		} );

		this.container.on( 'click keypress', '.repeater-field-upload .remove-button', function( e ) {
			e.preventDefault();
			control.$thisButton = jQuery( this );
			control.removeFile( e );
		} );

		/**
		 * Function that loads the Mustache template
		 */
		this.repeaterTemplate = _.memoize( function() {
			var compiled,

				/*
				 * Underscore's default ERB-style templates are incompatible with PHP
				 * when asp_tags is enabled, so WordPress uses Mustache-inspired templating syntax.
				 *
				 * @see trac ticket #22344.
				 */
				options = {
					evaluate: /<#([\s\S]+?)#>/g,
					interpolate: /\{\{\{([\s\S]+?)\}\}\}/g,
					escape: /\{\{([^\}]+?)\}\}(?!\})/g,
					variable: 'data'
				};

			return function( data ) {
				compiled = _.template( control.container.find( '.customize-control-repeater-content' ).first().html(), null, options );
				return compiled( data );
			};
		} );

		// When we load the control, the fields have not been filled up
		// This is the first time that we create all the rows
		if ( settingValue.length ) {
			_.each( settingValue, function( subValue ) {
				theNewRow = control.addRow( subValue );
				control.initColorPicker();
				control.initSelect( theNewRow, subValue );
			} );
		}

		// Once we have displayed the rows, we cleanup the values
		this.setValue( settingValue, true, true );

		this.repeaterFieldsContainer.sortable( {
			handle: '.repeater-row-header',
			update: function() {
				control.sort();
			}
		} );

	},

	/**
	 * Open the media modal.
	 */
	openFrame: function( event ) {

		'use strict';

		if ( wp.customize.utils.isKeydownButNotEnterEvent( event ) ) {
			return;
		}

		if ( this.$thisButton.closest( '.repeater-field' ).hasClass( 'repeater-field-cropped_image' ) ) {
			this.initCropperFrame();
		} else {
			this.initFrame();
		}

		this.frame.open();
	},

	initFrame: function() {

		'use strict';

		var libMediaType = this.getMimeType();

		this.frame = wp.media( {
			states: [
			new wp.media.controller.Library( {
					library: wp.media.query( { type: libMediaType } ),
					multiple: false,
					date: false
				} )
			]
		} );

		// When a file is selected, run a callback.
		this.frame.on( 'select', this.onSelect, this );
	},

	/**
	 * Create a media modal select frame, and store it so the instance can be reused when needed.
	 * This is mostly a copy/paste of Core api.CroppedImageControl in /wp-admin/js/customize-control.js
	 */
	initCropperFrame: function() {

		'use strict';

		// We get the field id from which this was called
		var currentFieldId = this.$thisButton.siblings( 'input.hidden-field' ).attr( 'data-field' ),
			attrs          = [ 'width', 'height', 'flex_width', 'flex_height' ], // A list of attributes to look for
			libMediaType   = this.getMimeType();

		// Make sure we got it
		if ( _.isString( currentFieldId ) && '' !== currentFieldId ) {

			// Make fields is defined and only do the hack for cropped_image
			if ( _.isObject( this.params.fields[ currentFieldId ] ) && 'cropped_image' === this.params.fields[ currentFieldId ].type ) {

				//Iterate over the list of attributes
				attrs.forEach( function( el ) {

					// If the attribute exists in the field
					if ( ! _.isUndefined( this.params.fields[ currentFieldId ][ el ] ) ) {

						// Set the attribute in the main object
						this.params[ el ] = this.params.fields[ currentFieldId ][ el ];
					}
				}.bind( this ) );
			}
		}

		this.frame = wp.media( {
			button: {
				text: 'Select and Crop',
				close: false
			},
			states: [
				new wp.media.controller.Library( {
					library: wp.media.query( { type: libMediaType } ),
					multiple: false,
					date: false,
					suggestedWidth: this.params.width,
					suggestedHeight: this.params.height
				} ),
				new wp.media.controller.CustomizeImageCropper( {
					imgSelectOptions: this.calculateImageSelectOptions,
					control: this
				} )
			]
		} );

		this.frame.on( 'select', this.onSelectForCrop, this );
		this.frame.on( 'cropped', this.onCropped, this );
		this.frame.on( 'skippedcrop', this.onSkippedCrop, this );

	},

	onSelect: function() {

		'use strict';

		var attachment = this.frame.state().get( 'selection' ).first().toJSON();

		if ( this.$thisButton.closest( '.repeater-field' ).hasClass( 'repeater-field-upload' ) ) {
			this.setFileInRepeaterField( attachment );
		} else {
			this.setImageInRepeaterField( attachment );
		}
	},

	/**
	 * After an image is selected in the media modal, switch to the cropper
	 * state if the image isn't the right size.
	 */

	onSelectForCrop: function() {

		'use strict';

		var attachment = this.frame.state().get( 'selection' ).first().toJSON();

		if ( this.params.width === attachment.width && this.params.height === attachment.height && ! this.params.flex_width && ! this.params.flex_height ) {
			this.setImageInRepeaterField( attachment );
		} else {
			this.frame.setState( 'cropper' );
		}
	},

	/**
	 * After the image has been cropped, apply the cropped image data to the setting.
	 *
	 * @param {object} croppedImage Cropped attachment data.
	 */
	onCropped: function( croppedImage ) {

		'use strict';

		this.setImageInRepeaterField( croppedImage );

	},

	/**
	 * Returns a set of options, computed from the attached image data and
	 * control-specific data, to be fed to the imgAreaSelect plugin in
	 * wp.media.view.Cropper.
	 *
	 * @param {wp.media.model.Attachment} attachment
	 * @param {wp.media.controller.Cropper} controller
	 * @returns {Object} Options
	 */
	calculateImageSelectOptions: function( attachment, controller ) {

		'use strict';

		var control    = controller.get( 'control' ),
			flexWidth  = !! parseInt( control.params.flex_width, 10 ),
			flexHeight = !! parseInt( control.params.flex_height, 10 ),
			realWidth  = attachment.get( 'width' ),
			realHeight = attachment.get( 'height' ),
			xInit      = parseInt( control.params.width, 10 ),
			yInit      = parseInt( control.params.height, 10 ),
			ratio      = xInit / yInit,
			xImg       = realWidth,
			yImg       = realHeight,
			x1,
			y1,
			imgSelectOptions;

		controller.set( 'canSkipCrop', ! control.mustBeCropped( flexWidth, flexHeight, xInit, yInit, realWidth, realHeight ) );

		if ( xImg / yImg > ratio ) {
			yInit = yImg;
			xInit = yInit * ratio;
		} else {
			xInit = xImg;
			yInit = xInit / ratio;
		}

		x1 = ( xImg - xInit ) / 2;
		y1 = ( yImg - yInit ) / 2;

		imgSelectOptions = {
			handles: true,
			keys: true,
			instance: true,
			persistent: true,
			imageWidth: realWidth,
			imageHeight: realHeight,
			x1: x1,
			y1: y1,
			x2: xInit + x1,
			y2: yInit + y1
		};

		if ( false === flexHeight && false === flexWidth ) {
			imgSelectOptions.aspectRatio = xInit + ':' + yInit;
		}
		if ( false === flexHeight ) {
			imgSelectOptions.maxHeight = yInit;
		}
		if ( false === flexWidth ) {
			imgSelectOptions.maxWidth = xInit;
		}

		return imgSelectOptions;
	},

	/**
	 * Return whether the image must be cropped, based on required dimensions.
	 *
	 * @param {bool} flexW
	 * @param {bool} flexH
	 * @param {int}  dstW
	 * @param {int}  dstH
	 * @param {int}  imgW
	 * @param {int}  imgH
	 * @return {bool}
	 */
	mustBeCropped: function( flexW, flexH, dstW, dstH, imgW, imgH ) {

		'use strict';

		if ( ( true === flexW && true === flexH ) || ( true === flexW && dstH === imgH ) || ( true === flexH && dstW === imgW ) || ( dstW === imgW && dstH === imgH ) || ( imgW <= dstW ) ) {
			return false;
		}

		return true;
	},

	/**
	 * If cropping was skipped, apply the image data directly to the setting.
	 */
	onSkippedCrop: function() {

		'use strict';

		var attachment = this.frame.state().get( 'selection' ).first().toJSON();
		this.setImageInRepeaterField( attachment );

	},

	/**
	 * Updates the setting and re-renders the control UI.
	 *
	 * @param {object} attachment
	 */
	setImageInRepeaterField: function( attachment ) {

		'use strict';

		var $targetDiv = this.$thisButton.closest( '.repeater-field-image,.repeater-field-cropped_image' );

		$targetDiv.find( '.kirki-image-attachment' ).html( '<img src="' + attachment.url + '">' ).hide().slideDown( 'slow' );

		$targetDiv.find( '.hidden-field' ).val( attachment.id );
		this.$thisButton.text( this.$thisButton.data( 'alt-label' ) );
		$targetDiv.find( '.remove-button' ).show();

		//This will activate the save button
		$targetDiv.find( 'input, textarea, select' ).trigger( 'change' );
		this.frame.close();

	},

	/**
	 * Updates the setting and re-renders the control UI.
	 *
	 * @param {object} attachment
	 */
	setFileInRepeaterField: function( attachment ) {

		'use strict';

		var $targetDiv = this.$thisButton.closest( '.repeater-field-upload' );

		$targetDiv.find( '.kirki-file-attachment' ).html( '<span class="file"><span class="dashicons dashicons-media-default"></span> ' + attachment.filename + '</span>' ).hide().slideDown( 'slow' );

		$targetDiv.find( '.hidden-field' ).val( attachment.id );
		this.$thisButton.text( this.$thisButton.data( 'alt-label' ) );
		$targetDiv.find( '.upload-button' ).show();
		$targetDiv.find( '.remove-button' ).show();

		//This will activate the save button
		$targetDiv.find( 'input, textarea, select' ).trigger( 'change' );
		this.frame.close();

	},

	getMimeType: function() {

		'use strict';

		// We get the field id from which this was called
		var currentFieldId = this.$thisButton.siblings( 'input.hidden-field' ).attr( 'data-field' );

		// Make sure we got it
		if ( _.isString( currentFieldId ) && '' !== currentFieldId ) {

			// Make fields is defined and only do the hack for cropped_image
			if ( _.isObject( this.params.fields[ currentFieldId ] ) && 'upload' === this.params.fields[ currentFieldId ].type ) {

				// If the attribute exists in the field
				if ( ! _.isUndefined( this.params.fields[ currentFieldId ].mime_type ) ) {

					// Set the attribute in the main object
					return this.params.fields[ currentFieldId ].mime_type;
				}
			}
		}
		return 'image';

	},

	removeImage: function( event ) {

		'use strict';

		var $targetDiv,
			$uploadButton;

		if ( wp.customize.utils.isKeydownButNotEnterEvent( event ) ) {
			return;
		}

		$targetDiv = this.$thisButton.closest( '.repeater-field-image,.repeater-field-cropped_image,.repeater-field-upload' );
		$uploadButton = $targetDiv.find( '.upload-button' );

		$targetDiv.find( '.kirki-image-attachment' ).slideUp( 'fast', function() {
			jQuery( this ).show().html( jQuery( this ).data( 'placeholder' ) );
		} );
		$targetDiv.find( '.hidden-field' ).val( '' );
		$uploadButton.text( $uploadButton.data( 'label' ) );
		this.$thisButton.hide();

		$targetDiv.find( 'input, textarea, select' ).trigger( 'change' );

	},

	removeFile: function( event ) {

		'use strict';

		var $targetDiv,
			$uploadButton;

		if ( wp.customize.utils.isKeydownButNotEnterEvent( event ) ) {
			return;
		}

		$targetDiv = this.$thisButton.closest( '.repeater-field-upload' );
		$uploadButton = $targetDiv.find( '.upload-button' );

		$targetDiv.find( '.kirki-file-attachment' ).slideUp( 'fast', function() {
			jQuery( this ).show().html( jQuery( this ).data( 'placeholder' ) );
		} );
		$targetDiv.find( '.hidden-field' ).val( '' );
		$uploadButton.text( $uploadButton.data( 'label' ) );
		this.$thisButton.hide();

		$targetDiv.find( 'input, textarea, select' ).trigger( 'change' );

	},

	/**
	 * Get the current value of the setting
	 *
	 * @return Object
	 */
	getValue: function() {

		'use strict';

		// The setting is saved in JSON
		return JSON.parse( decodeURI( this.setting.get() ) );

	},

	/**
	 * Set a new value for the setting
	 *
	 * @param newValue Object
	 * @param refresh If we want to refresh the previewer or not
	 */
	setValue: function( newValue, refresh, filtering ) {

		'use strict';

		// We need to filter the values after the first load to remove data requrired for diplay but that we don't want to save in DB
		var filteredValue = newValue,
			filter        = [];

		if ( filtering ) {
			jQuery.each( this.params.fields, function( index, value ) {
				if ( 'image' === value.type || 'cropped_image' === value.type || 'upload' === value.type ) {
					filter.push( index );
				}
			} );
			jQuery.each( newValue, function( index, value ) {
				jQuery.each( filter, function( ind, field ) {
					if ( ! _.isUndefined( value[ field ] ) && ! _.isUndefined( value[ field ].id ) ) {
						filteredValue[index][ field ] = value[ field ].id;
					}
				} );
			} );
		}

		this.setting.set( encodeURI( JSON.stringify( filteredValue ) ) );

		if ( refresh ) {

			// Trigger the change event on the hidden field so
			// previewer refresh the website on Customizer
			this.settingField.trigger( 'change' );
		}
	},

	/**
	 * Add a new row to repeater settings based on the structure.
	 *
	 * @param data (Optional) Object of field => value pairs (undefined if you want to get the default values)
	 */
	addRow: function( data ) {

		'use strict';

		var control       = this,
			template      = control.repeaterTemplate(), // The template for the new row (defined on Kirki_Customize_Repeater_Control::render_content() ).
			settingValue  = this.getValue(), // Get the current setting value.
			newRowSetting = {}, // Saves the new setting data.
			templateData, // Data to pass to the template
			newRow,
			i;

		if ( template ) {

			// The control structure is going to define the new fields
			// We need to clone control.params.fields. Assigning it
			// ould result in a reference assignment.
			templateData = jQuery.extend( true, {}, control.params.fields );

			// But if we have passed data, we'll use the data values instead
			if ( data ) {
				for ( i in data ) {
					if ( data.hasOwnProperty( i ) && templateData.hasOwnProperty( i ) ) {
						templateData[ i ].default = data[ i ];
					}
				}
			}

			templateData.index = this.currentIndex;

			// Append the template content
			template = template( templateData );

			// Create a new row object and append the element
			newRow = new RepeaterRow(
				control.currentIndex,
				jQuery( template ).appendTo( control.repeaterFieldsContainer ),
				control.params.row_label,
				control
			);

			newRow.container.on( 'row:remove', function( e, rowIndex ) {
				control.deleteRow( rowIndex );
			} );

			newRow.container.on( 'row:update', function( e, rowIndex, fieldName, element ) {
				control.updateField.call( control, e, rowIndex, fieldName, element );
				newRow.updateLabel();
			} );

			// Add the row to rows collection
			this.rows[ this.currentIndex ] = newRow;

			for ( i in templateData ) {
				if ( templateData.hasOwnProperty( i ) ) {
					newRowSetting[ i ] = templateData[ i ].default;
				}
			}

			settingValue[ this.currentIndex ] = newRowSetting;
			this.setValue( settingValue, true );

			this.currentIndex++;

			return newRow;
		}
	},

	sort: function() {

		'use strict';

		var control     = this,
			$rows       = this.repeaterFieldsContainer.find( '.repeater-row' ),
			newOrder    = [],
			settings    = control.getValue(),
			newRows     = [],
			newSettings = [];

		$rows.each( function( i, element ) {
			newOrder.push( jQuery( element ).data( 'row' ) );
		} );

		jQuery.each( newOrder, function( newPosition, oldPosition ) {
			newRows[ newPosition ] = control.rows[ oldPosition ];
			newRows[ newPosition ].setRowIndex( newPosition );

			newSettings[ newPosition ] = settings[ oldPosition ];
		} );

		control.rows = newRows;
		control.setValue( newSettings );

	},

	/**
	 * Delete a row in the repeater setting
	 *
	 * @param index Position of the row in the complete Setting Array
	 */
	deleteRow: function( index ) {

		'use strict';

		var currentSettings = this.getValue(),
			row,
			i,
			prop;

		if ( currentSettings[ index ] ) {

			// Find the row
			row = this.rows[ index ];
			if ( row ) {

				// Remove the row settings
				delete currentSettings[ index ];

				// Remove the row from the rows collection
				delete this.rows[ index ];

				// Update the new setting values
				this.setValue( currentSettings, true );

			}

		}

		// Remap the row numbers
		i = 1;
		for ( prop in this.rows ) {
			if ( this.rows.hasOwnProperty( prop ) && this.rows[ prop ] ) {
				this.rows[ prop ].updateLabel();
				i++;
			}
		}
	},

	/**
	 * Update a single field inside a row.
	 * Triggered when a field has changed
	 *
	 * @param e Event Object
	 */
	updateField: function( e, rowIndex, fieldId, element ) {

		'use strict';

		var type,
			row,
			currentSettings;

		if ( ! this.rows[ rowIndex ] ) {
			return;
		}

		if ( ! this.params.fields[ fieldId ] ) {
			return;
		}

		type            = this.params.fields[ fieldId].type;
		row             = this.rows[ rowIndex ];
		currentSettings = this.getValue();

		element = jQuery( element );

		if ( _.isUndefined( currentSettings[ row.rowIndex ][ fieldId ] ) ) {
			return;
		}

		if ( 'checkbox' === type ) {
			currentSettings[ row.rowIndex ][ fieldId ] = element.is( ':checked' );
		} else {

			// Update the settings
			currentSettings[ row.rowIndex ][ fieldId ] = element.val();
		}
		this.setValue( currentSettings, true );
	},

	/**
	 * Init the color picker on color fields
	 * Called after AddRow
	 *
	 */
	initColorPicker: function() {

		'use strict';

		var control     = this,
			colorPicker = control.container.find( '.color-picker-hex' ),
			options     = {},
			fieldId     = colorPicker.data( 'field' );

		// We check if the color palette parameter is defined.
		if ( ! _.isUndefined( fieldId ) && ! _.isUndefined( control.params.fields[ fieldId ] ) && ! _.isUndefined( control.params.fields[ fieldId ].palettes ) && _.isObject( control.params.fields[ fieldId ].palettes ) ) {
			options.palettes = control.params.fields[ fieldId ].palettes;
		}

		// When the color picker value is changed we update the value of the field
		options.change = function( event, ui ) {

			var currentPicker   = jQuery( event.target ),
				row             = currentPicker.closest( '.repeater-row' ),
				rowIndex        = row.data( 'row' ),
				currentSettings = control.getValue();

			currentSettings[ rowIndex ][ currentPicker.data( 'field' ) ] = ui.color.toString();
			control.setValue( currentSettings, true );

		};

		// Init the color picker
		if ( 0 !== colorPicker.length ) {
			colorPicker.wpColorPicker( options );
		}
	},

	/**
	 * Init the dropdown-pages field with selectWoo
	 * Called after AddRow
	 *
	 * @param {object} theNewRow the row that was added to the repeater
	 * @param {object} data the data for the row if we're initializing a pre-existing row
	 *
	 */
	initSelect: function( theNewRow, data ) {

		'use strict';

		var control  = this,
			dropdown = theNewRow.container.find( '.repeater-field select' ),
			$select,
			dataField,
			multiple,
			selectWooOptions = {};

		if ( 0 === dropdown.length ) {
			return;
		}

		dataField = dropdown.data( 'field' );
		multiple  = jQuery( dropdown ).data( 'multiple' );
		if ( 'undefed' !== multiple && jQuery.isNumeric( multiple ) ) {
			multiple = parseInt( multiple, 10 );
			if ( 1 < multiple ) {
				selectWooOptions.maximumSelectionLength = multiple;
			}
		}

		data = data || {};
		data[ dataField ] = data[ dataField ] || '';

		$select = jQuery( dropdown ).selectWoo( selectWooOptions ).val( data[ dataField ] || jQuery( dropdown ).val() );

		this.container.on( 'change', '.repeater-field select', function( event ) {

			var currentDropdown = jQuery( event.target ),
				row             = currentDropdown.closest( '.repeater-row' ),
				rowIndex        = row.data( 'row' ),
				currentSettings = control.getValue();

			currentSettings[ rowIndex ][ currentDropdown.data( 'field' ) ] = jQuery( this ).val();
			control.setValue( currentSettings );
		} );
	}
} );
wp.customize.controlConstructor['kirki-slider'] = wp.customize.kirkiDynamicControl.extend( {

	initKirkiControl: function() {
		var control      = this,
			changeAction = ( 'postMessage' === control.setting.transport ) ? 'mousemove change' : 'change',
			rangeInput   = control.container.find( 'input[type="range"]' ),
			textInput    = control.container.find( 'input[type="text"]' ),
			value        = control.setting._value;

		// Set the initial value in the text input.
		textInput.attr( 'value', value );

		// If the range input value changes copy the value to the text input.
		rangeInput.on( 'mousemove change', function() {
			textInput.attr( 'value', rangeInput.val() );
		} );

		// Save the value when the range input value changes.
		// This is separate from the above because of the postMessage differences.
		// If the control refreshes the preview pane,
		// we don't want a refresh for every change
		// but 1 final refresh when the value is changed.
		rangeInput.on( changeAction, function() {
			control.setting.set( rangeInput.val() );
		} );

		// If the text input value changes,
		// copy the value to the range input
		// and then save.
		textInput.on( 'input paste change', function() {
			rangeInput.attr( 'value', textInput.val() );
			control.setting.set( textInput.val() );
		} );

		// If the reset button is clicked,
		// set slider and text input values to default
		// and hen save.
		control.container.find( '.slider-reset' ).on( 'click', function() {
			textInput.attr( 'value', control.params.default );
			rangeInput.attr( 'value', control.params.default );
			control.setting.set( textInput.val() );
		} );
	}
} );wp.customize.controlConstructor['kirki-slider-advanced'] = wp.customize.kirkiDynamicControl.extend( {
	initKirkiControl: function() {
		'use strict';
		
		if ( this.params.choices.use_media_queries )
		{
			this.container.addClass( 'has-switchers' );
		}
		
		this.normalizeDefault();
		this.initSlider();
	},
	
	normalizeDefault: function() {
		var val_unit_arr = function( value, unit )
		{
			return {
				value: value,
				unit: unit
			};
		};
		
		var value           = this.setting._value,
			is_value_object = typeof value === 'object',
			has_units       = !_.isUndefined( this.params.choices.units ),
			default_unit    = '';
			if ( has_units )
			{
				if ( _.isUndefined( this.params.choices.min ) &&
					_.isUndefined( this.params.choices.max ) &&
					_.isUndefined( this.params.choices.step ) )
					default_unit = Object.keys( this.params.choices.units )[0];
				else
					default_unit = this.params.choices.units[0];
			}
		
		if ( this.params.choices.use_media_queries )
		{
			if ( has_units && !is_value_object )
			{
				new_value = {};
				new_value[kirki.util.media_query_devices.desktop] = val_unit_arr( value, default_unit );
				new_value[kirki.util.media_query_devices.tablet]  = val_unit_arr( value, default_unit );
				new_value[kirki.util.media_query_devices.mobile]  = val_unit_arr( value, default_unit );
				value = new_value;
			}
			else
			{
				if ( !is_value_object )
				{
					new_value = {};
					new_value[kirki.util.media_query_devices.desktop] = value;
					new_value[kirki.util.media_query_devices.tablet]  = value;
					new_value[kirki.util.media_query_devices.mobile]  = value;
					value = new_value;
				}
			}
		}
		else
		{
			if ( has_units && !is_value_object )
			{
				value = val_unit_arr( value, default_unit );
			}
		}
		
		this.setting._value = value;
	},
	
	initSlider: function()
	{
		var control           = this,
			has_units         = !_.isUndefined( control.params.choices.units );
			changeAction      = ( 'postMessage' === control.setting.transport ) ? 'mousemove change' : 'change',
			value             = control.setting._value;
			
		var wrappers = kirki.util.helpers.setupMediaQueries( control );
		
		_.each( wrappers.devices, function( device_wrappers )
		{
			var device_wrapper = $( device_wrappers[0] );
			var rangeInput   = device_wrapper.find( 'input[type="range"]' ),
				textInput    = device_wrapper.find( 'input[type="text"]' ),
				suffix       = device_wrapper.find( '.suffix' );
				device       = device_wrapper.attr( 'device' ) || 'desktop',
				device_val   = control.params.default,
				range        = control.params.choices,
				device_unit  = null;
			
			if ( !_.isUndefined( value[device] ) )
			{
				device_val = has_units ? value[device]['value'] : value[device];
				if ( has_units )
					device_unit = value[device]['unit'];
			}
			else if ( has_units || typeof value === 'object' )
			{
				device_val  = value['value'];
				device_unit = value['unit'];
			}
			else if ( !Number.isNaN( value ) )
			{
				device_val = value;
			}
			else
			{
				if ( has_units )
				{
					device_val  = control.params.default['value'];
					device_unit = control.params.default['unit'];
				}
				else
				{
					device_val = control.params.default;
				}
			}
			
			// Set the initial value/ranges/events.
			if ( has_units )
			{
				var unit_wrapper = wrappers.units[device];
				range = control.params.choices['units'][device_unit];
				if ( _.isUndefined( range ) )
					range = control.params.choices;
				kirki.util.helpers.selectUnit( unit_wrapper, device_unit );
				
				unit_wrapper.find ( '.kirki-unit-choice input[type="radio"]').on ( 'change', function( e )
				{
					var $this = $( this ),
						unit  = $this.val(),
						range = control.params.choices['units'][unit];
					if ( _.isUndefined( range ) )
						range = control.params.choices;
					rangeInput.attr( 'min', range.min )
						.attr( 'max', range.max )
						.attr( 'step', range.step );
					textInput.attr( 'value', rangeInput.val() );
					control.save();
				});
			}
			
			rangeInput.attr( 'min', range.min )
				.attr( 'max', range.max )
				.attr( 'step', range.step );
			
			rangeInput.attr( 'value', device_val );
			textInput.attr( 'value', device_val );
			
			rangeInput.on( 'mousemove change', function() {
				textInput.attr( 'value', rangeInput.val() );
			} );
			
			rangeInput.on( changeAction, function() {
				control.save();
			} );
			
			textInput.on( 'input paste change', function() {
				rangeInput.attr( 'value', textInput.val() );
				control.save();
			} );
			
			device_wrapper.find( '.slider-reset' ).on( 'click', function() {
				if ( has_units )
				{
					kirki.util.helpers.selectUnit( unit_wrapper );
				}
				var val = control.params.default;
				if ( !_.isUndefined( control.params.default['value'] ) )
					val = control.params.default['value'];
				textInput.attr( 'value', val );
				rangeInput.attr( 'value', val );
				control.save();
			} );
		});
	},
	
	save: function() {
		var control    = this,
			container  = control.container;
			has_units  = !_.isUndefined( control.params.choices.units ),
			save_value = null;
		
		if ( control.params.choices.use_media_queries )
		{
			save_value = {};
			_.each( kirki.util.media_query_devices, function( device )
			{
				var device_val  = container.find( '.control-wrapper-outer.device-' + device + ' input[type="range"]' ).val(),
					device_unit = container.find( '.kirki-unit-choices-outer.device-' + device + ' input[type="radio"]:checked' ).val();
				
				if ( has_units )
				{
					save_value[device] = {
						value: device_val,
						unit: device_unit
					};
				}
				else
				{
					save_value[device] = device_val;
				}
			});
		}
		else
		{
			var device_val  = container.find( '.control-wrapper-outer input[type="range"]' ).val(),
				device_unit = container.find( '.kirki-unit-choices-outer input[type="radio"]:checked' ).val();
			if ( has_units )
			{
				save_value = {
					value: device_val,
					unit: device_unit
				};
			}
			else
			{
				save_value = device_val;
			}
			
		}
		control.setting.set( save_value );
	}
} );wp.customize.controlConstructor['kirki-sortable'] = wp.customize.Control.extend( {
	ready: function() {
		'use strict';
		var control = this,
			update_tid = 0,
			sortable = control.container.find( 'ul.sortable' );
		
		if ( control.params.mode === 'text' )
			this.initTextItems( sortable );
		else
			this.initCheckboxItems( sortable );
		// Init sortable.
		sortable = jQuery( sortable ).sortable( {
			// Update value when we stop sorting.
			update: function() {
				control.save_values();
			}
		} ).disableSelection().find( 'li' ).each( function() {
			// Enable/disable options when we click on the eye of Thundera.
			jQuery( this ).find( 'i.visibility' ).click( function() {
				jQuery( this ).toggleClass( 'dashicons-visibility-faint' ).parents( 'li:eq(0)' ).toggleClass( 'invisible' );
			} );
		} ).click( function() {
			// Update value on click.
			control.save_values();
		} );
		
		// If we're on the text mode, we need to check for input change.
		if ( control.params.mode === 'text' )
		{
			// Update value on key up, but with a delay.
			control.container.find( '.kirki-sortable-item input' ).on( 'change keyup paste', function()
			{
				clearTimeout( update_tid );
				update_tid = setTimeout( function()
				{
					control.save_values();
				}, 1000 );
			});
		}
	},
	
	save_values: function()
	{
		//Saves the values.
		var control = this,
			val = control.params.mode === 'text' ?
			control.getNewValText() : control.getNewValCheckbox();
		control.setting.set( val );
	},
	
	generateListElement: function ( label, value, visible )
	{
		var control = this;
		var li = jQuery( '<li ' + control.params.inputAttrs + '>' )
			.addClass( 'kirki-sortable-item' )
			.attr( 'data-value', value );
		
		if ( visible === false )
			li.addClass ( 'invisible' );
		
		jQuery( '<i class="dashicons dashicons-menu"></i>' ).appendTo( li );
		jQuery( '<i class="dashicons dashicons-visibility visibility"></i>' ).appendTo( li );
		jQuery( '<span>' + label + '</span>' ).appendTo( li );
		
		//If we're in text mode, we need a text input.
		if ( control.params.mode === 'text' )
			jQuery( '<input type="text">' ).val( value ).appendTo( li );
		
		return li;
	},
	
	initCheckboxItems : function( list )
	{
		var control = this,
			choices = control.params.choices,
			value = control.setting._value;
		_.each( value, function( choiceID )
		{
			control.generateListElement( choices[choiceID], choiceID, true ).appendTo( list );
		});
		_.each( choices, function( choiceLabel, choiceID )
		{
			if ( -1 === value.indexOf( choiceID ) )
				control.generateListElement( choices[choiceID], choiceID, false ).appendTo( list );
		});
	},
	
	initTextItems: function( list )
	{
		var control = this,
			choices = control.params.choices,
			value = control.setting._value;
		_.each( value, function( choiceLabel, choiceID ) {
			var visible = true;
			if ( value[choiceID] && value[choiceID].length === 0 )
				visible = false;
			var li = control.generateListElement( choices[choiceID], value[choiceID], visible );
			li.attr( 'data-id', choiceID );
			li.appendTo( list );
		});
		var keys = Object.keys( value );
		_.each( choices, function( choiceLabel, choiceID ) {
			if ( -1 === keys.indexOf( choiceID ) )
			{
				var li = control.generateListElement( choices[choiceID], '', false );
				li.attr( 'data-id', choiceID );
				li.appendTo( list );
			}
		});
	},

	/**
	 * Gets the new checkbox value.
	 *
	 * @since 3.0.35
	 * @returns {Array}
	 */
	getNewValCheckbox: function() {
		var items  = jQuery( this.container.find( 'li' ) ),
			newVal = [];
		_.each ( items, function( item ) {
			if ( ! jQuery( item ).hasClass( 'invisible' ) )
				newVal.push( jQuery( item ).data( 'value' ) );
		} );
		return newVal;
	},
	
	/**
	 * Gets the new text value.
	 *
	 * @since 3.0.35
	 * @returns {Array}
	 */
	getNewValText: function() {
		var items  = jQuery( this.container.find( 'li' ) ),
			newVal = [];
		_.each ( items, function( item ) {
			if ( ! jQuery( item ).hasClass( 'invisible' ) )
			{
				/* Instead of using an object, a JSON object array was needed so the WordPress customizer base
				would think they were different values. A named object would still think the order is the same.
				*/
				var id = jQuery( item ).attr( 'data-id' ),
					textVal = jQuery( item ).find( 'input' ).val();
				newVal.push(JSON.stringify( { id: id, val: textVal } ));
			}
		} );
		return newVal;
	}
} );wp.customize.controlConstructor['kirki-spacing-advanced'] = wp.customize.kirkiDynamicControl.extend( {

	initKirkiControl: function() {
		'use strict';
		
		if ( this.params.choices.use_media_queries )
		{
			this.container.addClass( 'has-switchers' );
		}
		
		this.initSpacing();
	},
	
	initSpacing: function() {
			var control       = this,
			has_units         = !_.isUndefined( control.params.choices.units );
			changeAction      = ( 'postMessage' === control.setting.transport ) ? 'keyup change' : 'change',
			value             = control.setting._value;
		
		var wrappers = kirki.util.helpers.setupMediaQueries( control );
		
		_.each( wrappers.devices, function( device_wrappers )
		{
			var device_wrapper    = $( device_wrappers[0] );
			var inputs            = device_wrapper.find( '.kirki-control-dimension input' ),
				device            = device_wrapper.attr( 'device' ) || 'desktop',
				device_val        = device === 'desktop' ? control.params.default : null,
				link_inputs_btn   = device_wrapper.find( '.kirki-input-link' ),
				device_unit       = null;
			
			if ( !_.isUndefined( value[device] ) )
			{
				device_val = value[device];
				if ( has_units )
					device_unit = device_val['unit'] || null;
			}
			else if ( has_units )
			{
				device_unit = value['unit'] || null;
			}
			
			if ( device_val )
			{
				inputs.each( function()
				{
					var input = $( this ),
						side = input.attr( 'side' );
					if ( !device_val[side] )
						return false;
					input.val( has_units ? parseFloat( device_val[side] ) : device_val[side] );
				});
			}
			
			// Set the events.
			if ( has_units )
			{
				var unit_wrapper = wrappers.units[device];
				kirki.util.helpers.selectUnit( unit_wrapper, device_unit );
				unit_wrapper.find ( '.kirki-unit-choice input[type="radio"]').on ( 'change', function( e )
				{
					control.save();
				});
			}
			
			inputs.on( changeAction, function()
			{
				var input = $( this );
				if ( link_inputs_btn.hasClass( 'linked' ) )
					inputs.filter(':not(' + input.attr( 'id' ) + '):not(.not-used)' ).val( input.val() );
				
				control.save();
			});
			
			link_inputs_btn.click(function(e){
				e.preventDefault();
				e.stopImmediatePropagation();
				link_inputs_btn.toggleClass( 'unlinked linked' );
			});
			
			if ( control.params.choices.sync_values )
				link_inputs_btn.click();
			
		});
	},
	
	save: function()
	{
		var control    = this,
			container  = control.container;
			has_units  = !_.isUndefined( control.params.choices.units ),
			save_value = {};
		
		if ( control.params.choices.use_media_queries )
		{
			_.each( kirki.util.media_query_devices, function( device )
			{
				var device_vals  = container.find( '.control-wrapper-outer.device-' + device + ' .kirki-control-dimension input' ),
					device_unit  = container.find( '.kirki-unit-choices-outer.device-' + device + ' input[type="radio"]:checked' ).val();
				save_value[device] = {};
				if ( has_units )
				{
					save_value[device] = {
						unit: device_unit
					};
				}
				
				device_vals.each( function()
				{
					var input = $( this ),
						val   = input.val(),
						side  = input.attr( 'side' );
					save_value[device][side] = val;
				});
			});
		}
		else
		{
			var device_vals  = container.find( '.control-wrapper-outer .kirki-control-dimension input' ),
				device_unit  = container.find( '.kirki-unit-choices-outer input[type="radio"]:checked' ).val();
			
			if ( has_units )
			{
				save_value['unit'] = device_unit;
			}
			
			device_vals.each( function()
			{
				var input = $( this ),
					val   = input.val(),
					side  = input.attr( 'side' );
				save_value[side] = val;
			});
		}
		
		//console.log(save_value);
		//return;
		control.setting.set( save_value );
	},
} );wp.customize.controlConstructor['kirki-switch'] = wp.customize.kirkiDynamicControl.extend( {

	initKirkiControl: function() {

		'use strict';

		var control       = this,
			checkboxValue = control.setting._value;

		// Save the value
		this.container.on( 'change', 'input', function() {
			checkboxValue = ( jQuery( this ).is( ':checked' ) ) ? true : false;
			control.setting.set( checkboxValue );
		} );
	}
} );
wp.customize.controlConstructor['toggle-tabs'] = wp.customize.kirkiDynamicControl.extend( {

	initKirkiControl: function() {

		var control = this,
			container = control.container,
			tab_container = container.find( '.kirki-toggle-tabs-outer' ),
			id = control.id,
			choices = control.params.choices;
			
		control.tab_container = tab_container;
		
		tab_container.find( '.tabs li:first' ).addClass( 'active' );
		tab_container.find( '.tab-content:first' ).addClass( 'active' );
		
		for ( var label in choices )
		{
			var label_id = label.replace( ' ', '_' ),
				tab = $( 'li[href="#' + id + '_' + label_id + '"]' ),
				tab_content = $( '#' + id + '_' + label_id );
			control.registerTabEvents ( tab, tab_content );
		}
		
		//TODO FIXME: Think of an event-based way to handle this.
		setInterval( function()
		{
			for ( var label in choices )
			{
				var label_id = label.replace( ' ', '_' ),
					control_ids = choices[label],
					tab_content = $( '#' + id + '_' + label_id );
				
				for ( var control_idx in control_ids )
				{
					var control_id = control_ids[control_idx];
					var wp_control = $( '#customize-control-' + control_id );
					if ( wp_control.parent().hasClass( 'tab-content' ) )
						continue;
					wp_control.detach().appendTo( tab_content );
				}
			}
		}, 500 );
	},
	
	registerTabEvents: function( tab, tab_content )
	{
		var control = this,
			tab_container = control.tab_container;
		
		tab.click( function( e )
		{
			e.preventDefault();
			tab_container.find( '.active' ).removeClass( 'active' );
			tab.addClass( 'active' );
			tab_content.addClass( 'active' );
		});
	}
} );
wp.customize.controlConstructor['kirki-toggle'] = wp.customize.kirkiDynamicControl.extend( {

	initKirkiControl: function() {

		var control = this,
			checkboxValue = control.setting._value;

		// Save the value
		this.container.on( 'change', 'input', function() {
			checkboxValue = ( jQuery( this ).is( ':checked' ) ) ? true : false;
			control.setting.set( checkboxValue );
		} );
	}
} );
/* global kirkiL10n, kirki */
wp.customize.controlConstructor['kirki-typography'] = wp.customize.kirkiDynamicControl.extend( {

	initKirkiControl: function() {

		'use strict';

		var control = this,
			value   = control.setting._value,
			picker;

		control.renderFontSelector();
		control.renderBackupFontSelector();
		control.renderVariantSelector();

		// Font-size.
		if ( 'undefined' !== typeof control.params.default['font-size'] ) {
			this.container.on( 'change keyup paste', '.font-size input', function() {
				control.saveValue( 'font-size', jQuery( this ).val() );
			} );
		}

		// Line-height.
		if ( 'undefined' !== typeof control.params.default['line-height'] ) {
			this.container.on( 'change keyup paste', '.line-height input', function() {
				control.saveValue( 'line-height', jQuery( this ).val() );
			} );
		}

		// Margin-top.
		if ( 'undefined' !== typeof control.params.default['margin-top'] ) {
			this.container.on( 'change keyup paste', '.margin-top input', function() {
				control.saveValue( 'margin-top', jQuery( this ).val() );
			} );
		}

		// Margin-bottom.
		if ( 'undefined' !== typeof control.params.default['margin-bottom'] ) {
			this.container.on( 'change keyup paste', '.margin-bottom input', function() {
				control.saveValue( 'margin-bottom', jQuery( this ).val() );
			} );
		}

		// Letter-spacing.
		if ( 'undefined' !== typeof control.params.default['letter-spacing'] ) {
			value['letter-spacing'] = ( jQuery.isNumeric( value['letter-spacing'] ) ) ? value['letter-spacing'] + 'px' : value['letter-spacing'];
			this.container.on( 'change keyup paste', '.letter-spacing input', function() {
				value['letter-spacing'] = ( jQuery.isNumeric( jQuery( this ).val() ) ) ? jQuery( this ).val() + 'px' : jQuery( this ).val();
				control.saveValue( 'letter-spacing', value['letter-spacing'] );
			} );
		}

		// Word-spacing.
		if ( 'undefined' !== typeof control.params.default['word-spacing'] ) {
			this.container.on( 'change keyup paste', '.word-spacing input', function() {
				control.saveValue( 'word-spacing', jQuery( this ).val() );
			} );
		}

		// Text-align.
		if ( 'undefined' !== typeof control.params.default['text-align'] ) {
			this.container.on( 'change', '.text-align input', function() {
				control.saveValue( 'text-align', jQuery( this ).val() );
			} );
		}

		// Text-transform.
		if ( 'undefined' !== typeof control.params.default['text-transform'] ) {
			jQuery( control.selector + ' .text-transform select' ).selectWoo().on( 'change', function() {
				control.saveValue( 'text-transform', jQuery( this ).val() );
			} );
		}

		// Text-decoration.
		if ( 'undefined' !== typeof control.params.default['text-decoration'] ) {
			jQuery( control.selector + ' .text-decoration select' ).selectWoo().on( 'change', function() {
				control.saveValue( 'text-decoration', jQuery( this ).val() );
			} );
		}

		// Color.
		if ( 'undefined' !== typeof control.params.default.color ) {
			picker = this.container.find( '.kirki-color-control' );
			picker.wpColorPicker( {
				change: function() {
					setTimeout( function() {
						control.saveValue( 'color', picker.val() );
					}, 100 );
				},
				clear: function (event) {
					setTimeout( function() {
						control.saveValue( 'color', '' );
					}, 100 );
				}
			} );
		}
	},

	/**
	 * Adds the font-families to the font-family dropdown
	 * and instantiates selectWoo.
	 */
	renderFontSelector: function() {

		var control         = this,
			selector        = control.selector + ' .font-family select',
			data            = [],
			standardFonts   = [],
			googleFonts     = [],
			value           = control.setting._value,
			fonts           = control.getFonts(),
			fontSelect,
			controlFontFamilies;

		// Format standard fonts as an array.
		if ( ! _.isUndefined( fonts.standard ) ) {
			_.each( fonts.standard, function( font ) {
				standardFonts.push( {
					id: font.family.replace( /&quot;/g, '&#39' ),
					text: font.label
				} );
			} );
		}

		// Format google fonts as an array.
		if ( ! _.isUndefined( fonts.google ) ) {
			_.each( fonts.google, function( font ) {
				googleFonts.push( {
					id: font.family,
					text: font.family
				} );
			} );
		}

		// Do we have custom fonts?
		controlFontFamilies = {};
		if ( ! _.isUndefined( control.params ) && ! _.isUndefined( control.params.choices ) && ! _.isUndefined( control.params.choices.fonts ) && ! _.isUndefined( control.params.choices.fonts.families ) ) {
			controlFontFamilies = control.params.choices.fonts.families;
		}

		// Combine forces and build the final data.
		data = jQuery.extend( {}, controlFontFamilies, {
			default: {
				text: kirkiL10n.defaultCSSValues,
				children: [
					{ id: '', text: kirkiL10n.defaultBrowserFamily },
					{ id: 'initial', text: 'initial' },
					{ id: 'inherit', text: 'inherit' }
				]
			},
			standard: {
				text: kirkiL10n.standardFonts,
				children: standardFonts
			},
			google: {
				text: kirkiL10n.googleFonts,
				children: googleFonts
			}
		} );

		if ( kirkiL10n.isScriptDebug ) {
			console.info( 'Kirki Debug: Font families for control "' + control.id + '":' );
			console.info( data );
		}

		data = _.values( data );

		// Instantiate selectWoo with the data.
		fontSelect = jQuery( selector ).selectWoo( {
			data: data
		} );

		// Set the initial value.
		if ( value['font-family'] || '' === value['font-family'] ) {
			value['font-family'] = kirki.util.parseHtmlEntities( value['font-family'].replace( /'/g, '"' ) );
			fontSelect.val( value['font-family'] ).trigger( 'change' );
		}

		// When the value changes
		fontSelect.on( 'change', function() {

			// Set the value.
			control.saveValue( 'font-family', jQuery( this ).val() );

			// Re-init the font-backup selector.
			control.renderBackupFontSelector();

			// Re-init variants selector.
			control.renderVariantSelector();
		} );
	},

	/**
	 * Adds the font-families to the font-family dropdown
	 * and instantiates selectWoo.
	 */
	renderBackupFontSelector: function() {

		var control       = this,
			selector      = control.selector + ' .font-backup select',
			standardFonts = [],
			value         = control.setting._value,
			fontFamily    = value['font-family'],
			fonts         = control.getFonts(),
			fontSelect;

		if ( _.isUndefined( value['font-backup'] ) || null === value['font-backup'] ) {
			value['font-backup'] = '';
		}

		// Hide if we're not on a google-font.
		if ( 'inherit' === fontFamily || 'initial' === fontFamily || 'google' !== kirki.util.webfonts.getFontType( fontFamily ) ) {
			jQuery( control.selector + ' .font-backup' ).hide();
			return;
		}
		jQuery( control.selector + ' .font-backup' ).show();

		// Format standard fonts as an array.
		if ( ! _.isUndefined( fonts.standard ) ) {
			_.each( fonts.standard, function( font ) {
				standardFonts.push( {
					id: font.family.replace( /&quot;/g, '&#39' ),
					text: font.label
				} );
			} );
		}

		// Instantiate selectWoo with the data.
		fontSelect = jQuery( selector ).selectWoo( {
			data: standardFonts
		} );

		// Set the initial value.
		if ( 'undefined' !== typeof value['font-backup'] ) {
			fontSelect.val( value['font-backup'].replace( /'/g, '"' ) ).trigger( 'change' );
		}

		// When the value changes
		fontSelect.on( 'change', function() {

			// Set the value.
			control.saveValue( 'font-backup', jQuery( this ).val() );
		} );
	},

	/**
	 * Renders the variants selector using selectWoo
	 * Displays font-variants for the currently selected font-family.
	 */
	renderVariantSelector: function() {

		var control    = this,
			value      = control.setting._value,
			fontFamily = value['font-family'],
			selector   = control.selector + ' .variant select',
			data       = [],
			isValid    = false,
			fontType   = kirki.util.webfonts.getFontType( fontFamily ),
			variants   = [ '', 'regular', 'italic', '700', '700italic' ],
			fontWeight,
			variantSelector,
			fontStyle;

		if ( 'google' === fontType ) {
			variants = kirki.util.webfonts.google.getVariants( fontFamily );
		}

		// Check if we've got custom variants defined for this font.
		if ( ! _.isUndefined( control.params ) && ! _.isUndefined( control.params.choices ) && ! _.isUndefined( control.params.choices.fonts ) && ! _.isUndefined( control.params.choices.fonts.variants ) ) {

			// Check if we have variants for this font-family.
			if ( ! _.isUndefined( control.params.choices.fonts.variants[ fontFamily ] ) ) {
				variants = control.params.choices.fonts.variants[ fontFamily ];
			}
		}
		if ( kirkiL10n.isScriptDebug ) {
			console.info( 'Kirki Debug: Font variants for font-family "' + fontFamily + '":' );
			console.info( variants );
		}

		if ( 'inherit' === fontFamily || 'initial' === fontFamily || '' === fontFamily ) {
			value.variant = 'inherit';
			variants      = [ '' ];
			jQuery( control.selector + ' .variant' ).hide();
		}

		if ( 1 >= variants.length ) {
			jQuery( control.selector + ' .variant' ).hide();

			value.variant = variants[0];

			control.saveValue( 'variant', value.variant );

			if ( '' === value.variant || ! value.variant ) {
				fontWeight = '';
				fontStyle  = '';
			} else {
				fontWeight = ( ! _.isString( value.variant ) ) ? '400' : value.variant.match( /\d/g );
				fontWeight = ( ! _.isObject( fontWeight ) ) ? '400' : fontWeight.join( '' );
				fontStyle  = ( value.variant && -1 !== value.variant.indexOf( 'italic' ) ) ? 'italic' : 'normal';
			}

			control.saveValue( 'font-weight', fontWeight );
			control.saveValue( 'font-style', fontStyle );

			return;
		}

		jQuery( control.selector + ' .font-backup' ).show();

		jQuery( control.selector + ' .variant' ).show();
		_.each( variants, function( variant ) {
			if ( value.variant === variant ) {
				isValid = true;
			}
			data.push( {
				id: variant,
				text: variant
			} );
		} );
		if ( ! isValid ) {
			value.variant = 'regular';
		}

		if ( jQuery( selector ).hasClass( 'select2-hidden-accessible' ) ) {
			jQuery( selector ).selectWoo( 'destroy' );
			jQuery( selector ).empty();
		}

		// Instantiate selectWoo with the data.
		variantSelector = jQuery( selector ).selectWoo( {
			data: data
		} );
		variantSelector.val( value.variant ).trigger( 'change' );
		variantSelector.on( 'change', function() {
			control.saveValue( 'variant', jQuery( this ).val() );
			if ( 'string' !== typeof value.variant ) {
				value.variant = variants[0];
			}

			fontWeight = ( ! _.isString( value.variant ) ) ? '400' : value.variant.match( /\d/g );
			fontWeight = ( ! _.isObject( fontWeight ) ) ? '400' : fontWeight.join( '' );
			fontStyle  = ( -1 !== value.variant.indexOf( 'italic' ) ) ? 'italic' : 'normal';

			control.saveValue( 'font-weight', fontWeight );
			control.saveValue( 'font-style', fontStyle );
		} );
	},

	/**
	 * Get fonts.
	 */
	getFonts: function() {
		var control            = this,
			initialGoogleFonts = kirki.util.webfonts.google.getFonts(),
			googleFonts        = {},
			googleFontsSort    = 'alpha',
			googleFontsNumber  = 0,
			standardFonts      = {};

		// Get google fonts.
		if ( ! _.isEmpty( control.params.choices.fonts.google ) ) {
			if ( 'alpha' === control.params.choices.fonts.google[0] || 'popularity' === control.params.choices.fonts.google[0] || 'trending' === control.params.choices.fonts.google[0] ) {
				googleFontsSort = control.params.choices.fonts.google[0];
				if ( ! isNaN( control.params.choices.fonts.google[1] ) ) {
					googleFontsNumber = parseInt( control.params.choices.fonts.google[1], 10 );
				}
				googleFonts = kirki.util.webfonts.google.getFonts( googleFontsSort, '', googleFontsNumber );

			} else {
				_.each( control.params.choices.fonts.google, function( fontName ) {
					if ( 'undefined' !== typeof initialGoogleFonts[ fontName ] && ! _.isEmpty( initialGoogleFonts[ fontName ] ) ) {
						googleFonts[ fontName ] = initialGoogleFonts[ fontName ];
					}
				} );
			}
		} else {
			googleFonts = kirki.util.webfonts.google.getFonts( googleFontsSort, '', googleFontsNumber );
		}

		// Get standard fonts.
		if ( ! _.isEmpty( control.params.choices.fonts.standard ) ) {
			_.each( control.params.choices.fonts.standard, function( fontName ) {
				if ( 'undefined' !== typeof kirki.util.webfonts.standard.fonts[ fontName ] && ! _.isEmpty( kirki.util.webfonts.standard.fonts[ fontName ] ) ) {
					standardFonts[ fontName ] = {};
					if ( 'undefined' !== kirki.util.webfonts.standard.fonts[ fontName ].stack && ! _.isEmpty( kirki.util.webfonts.standard.fonts[ fontName ].stack ) ) {
						standardFonts[ fontName ].family = kirki.util.webfonts.standard.fonts[ fontName ].stack;
					} else {
						standardFonts[ fontName ].family = googleFonts[ fontName ];
					}
					if ( 'undefined' !== kirki.util.webfonts.standard.fonts[ fontName ].label && ! _.isEmpty( kirki.util.webfonts.standard.fonts[ fontName ].label ) ) {
						standardFonts[ fontName ].label = kirki.util.webfonts.standard.fonts[ fontName ].label;
					} else if ( ! _.isEmpty( standardFonts[ fontName ] ) ) {
						standardFonts[ fontName ].label = standardFonts[ fontName ];
					}
				} else {
					standardFonts[ fontName ] = {
						family: fontName,
						label: fontName
					};
				}
			} );
		} else {
			_.each( kirki.util.webfonts.standard.fonts, function( font, id ) {
				standardFonts[ id ] = {
					family: font.stack,
					label: font.label
				};
			} );
		}
		return {
			google: googleFonts,
			standard: standardFonts
		};
	},

	/**
	 * Saves the value.
	 */
	saveValue: function( property, value ) {

		var control = this,
			input   = control.container.find( '.typography-hidden-value' ),
			val     = control.setting._value;

		val[ property ] = value;

		jQuery( input ).attr( 'value', JSON.stringify( val ) ).trigger( 'change' );
		control.setting.set( val );
	}
} );
/* global kirkiL10n, kirki */
wp.customize.controlConstructor['kirki-typography-advanced'] = wp.customize.kirkiDynamicControl.extend( {

	initKirkiControl: function() {
		'use strict';
		var control = this,
			value   = control.setting._value,
			picker;
		
		control.global_types = [
			'font-family',
			'font-backup',
			'font-weight',
			'font-style',
			'variant',
			'text-transform',
			'text-decoration',
			'color',
			'text-align'
		],
		control.media_query_types = [
			'font-size',
			'line-height',
			'margin-top',
			'margin-bottom',
			'letter-spacing',
			'word-spacing'
		];
		
		kirki.util.helpers.setupMediaQueries( control );
		
		if ( control.params.choices.use_media_queries )
		{
			control.container.addClass( 'has-switchers' );
		}
		
		if ( _.isUndefined( value[kirki.util.media_query_devices.desktop] ) )
		{
			value = control.defaultValue();
			control.setting._value = value;
		}
		
		// Setting up the values for tablet/mobile.
		_.each( ['desktop', 'tablet', 'mobile'], function( device )
		{
			if ( !control.params.choices.use_media_queries &&
					device !== kirki.util.media_query_devices.desktop )
			{
				return false;
			}
			_.each( control.media_query_types, function( type )
			{
				if ( _.isUndefined( control.params.default[type] ) )
					return false;
				var device_class = ' .device-' + device + ' ';
				if ( !control.params.choices.use_media_queries )
				{
					device_class = ' ';
				}
				var input = control.container.find( '.' + type + device_class + ' input' );
				var val = control.params.default[type];
				
				if ( !_.isUndefined( value[device] ) && !_.isUndefined( value[device][type] ) )
				{
					val = value[device][type];
				}
				else //If the value for the device is not set
				{
					if ( device !== kirki.util.media_query_devices.desktop )
						val = '';
				}
				
				input.val( val );
			});
		});
		
		control.renderFontSelector();
		control.renderBackupFontSelector();
		control.renderVariantSelector();

		// Font-size.
		if ( 'undefined' !== typeof control.params.default['font-size'] ) {
			this.container.on( 'change keyup paste', '.font-size input', function() {
				control.saveValue( 'font-size', jQuery( this ).val() );
			} );
		}

		// Line-height.
		if ( 'undefined' !== typeof control.params.default['line-height'] ) {
			this.container.on( 'change keyup paste', '.line-height input', function() {
				control.saveValue( 'line-height', jQuery( this ).val() );
			} );
		}

		// Margin-top.
		if ( 'undefined' !== typeof control.params.default['margin-top'] ) {
			this.container.on( 'change keyup paste', '.margin-top input', function() {
				control.saveValue( 'margin-top', jQuery( this ).val() );
			} );
		}

		// Margin-bottom.
		if ( 'undefined' !== typeof control.params.default['margin-bottom'] ) {
			this.container.on( 'change keyup paste', '.margin-bottom input', function() {
				control.saveValue( 'margin-bottom', jQuery( this ).val() );
			} );
		}

		// Letter-spacing.
		if ( 'undefined' !== typeof control.params.default['letter-spacing'] ) {
			var device = control.currentDevice();
			value[device]['letter-spacing'] = ( jQuery.isNumeric( value['letter-spacing'] ) ) ? value['letter-spacing'] + 'px' : value['letter-spacing'];
			this.container.on( 'change keyup paste', '.letter-spacing input', function() {
				value[device]['letter-spacing'] = ( jQuery.isNumeric( jQuery( this ).val() ) ) ? jQuery( this ).val() + 'px' : jQuery( this ).val();
				control.saveValue( 'letter-spacing', value[device]['letter-spacing'] );
			} );
		}

		// Word-spacing.
		if ( 'undefined' !== typeof control.params.default['word-spacing'] ) {
			this.container.on( 'change keyup paste', '.word-spacing input', function() {
				control.saveValue( 'word-spacing', jQuery( this ).val() );
			} );
		}

		// Text-align.
		if ( 'undefined' !== typeof control.params.default['text-align'] ) {
			this.container.on( 'change', '.text-align input', function() {
				control.saveValue( 'text-align', jQuery( this ).val() );
			} );
		}

		// Text-transform.
		if ( 'undefined' !== typeof control.params.default['text-transform'] ) {
			jQuery( control.selector + ' .text-transform select' ).selectWoo().on( 'change', function() {
				control.saveValue( 'text-transform', jQuery( this ).val() );
			} );
		}

		// Text-decoration.
		if ( 'undefined' !== typeof control.params.default['text-decoration'] ) {
			jQuery( control.selector + ' .text-decoration select' ).selectWoo().on( 'change', function() {
				control.saveValue( 'text-decoration', jQuery( this ).val() );
			} );
		}

		// Color.
		if ( 'undefined' !== typeof control.params.default.color ) {
			picker = this.container.find( '.kirki-color-control' );
			picker.wpColorPicker( {
				change: function() {
					setTimeout( function() {
						control.saveValue( 'color', picker.val() );
					}, 100 );
				},
				clear: function (event) {
					setTimeout( function() {
						control.saveValue( 'color', '' );
					}, 100 );
				}
			} );
		}
	},

	/**
	 * Adds the font-families to the font-family dropdown
	 * and instantiates selectWoo.
	 */
	renderFontSelector: function() {

		var control         = this,
			selector        = control.selector + ' .font-family select',
			data            = [],
			standardFonts   = [],
			googleFonts     = [],
			value           = control.setting._value,
			fonts           = control.getFonts(),
			fontSelect,
			controlFontFamilies;

		// Format standard fonts as an array.
		if ( ! _.isUndefined( fonts.standard ) ) {
			_.each( fonts.standard, function( font ) {
				standardFonts.push( {
					id: font.family.replace( /&quot;/g, '&#39' ),
					text: font.label
				} );
			} );
		}

		// Format google fonts as an array.
		if ( ! _.isUndefined( fonts.google ) ) {
			_.each( fonts.google, function( font ) {
				googleFonts.push( {
					id: font.family,
					text: font.family
				} );
			} );
		}

		// Do we have custom fonts?
		controlFontFamilies = {};
		if ( ! _.isUndefined( control.params ) && ! _.isUndefined( control.params.choices ) && ! _.isUndefined( control.params.choices.fonts ) && ! _.isUndefined( control.params.choices.fonts.families ) ) {
			controlFontFamilies = control.params.choices.fonts.families;
		}

		// Combine forces and build the final data.
		data = jQuery.extend( {}, controlFontFamilies, {
			default: {
				text: kirkiL10n.defaultCSSValues,
				children: [
					{ id: '', text: kirkiL10n.defaultBrowserFamily },
					{ id: 'initial', text: 'initial' },
					{ id: 'inherit', text: 'inherit' }
				]
			},
			standard: {
				text: kirkiL10n.standardFonts,
				children: standardFonts
			},
			google: {
				text: kirkiL10n.googleFonts,
				children: googleFonts
			}
		} );

		if ( kirkiL10n.isScriptDebug ) {
			console.info( 'Kirki Debug: Font families for control "' + control.id + '":' );
			console.info( data );
		}

		data = _.values( data );

		// Instantiate selectWoo with the data.
		fontSelect = jQuery( selector ).selectWoo( {
			data: data
		} );

		// Set the initial value.
		if ( value['font-family'] || '' === value['font-family'] ) {
			value['font-family'] = kirki.util.parseHtmlEntities( value['font-family'].replace( /'/g, '"' ) );
			fontSelect.val( value['font-family'] ).trigger( 'change' );
		}

		// When the value changes
		fontSelect.on( 'change', function() {

			// Set the value.
			control.saveValue( 'font-family', jQuery( this ).val() );

			// Re-init the font-backup selector.
			control.renderBackupFontSelector();

			// Re-init variants selector.
			control.renderVariantSelector();
		} );
	},

	/**
	 * Adds the font-families to the font-family dropdown
	 * and instantiates selectWoo.
	 */
	renderBackupFontSelector: function() {

		var control       = this,
			selector      = control.selector + ' .font-backup select',
			standardFonts = [],
			value         = control.setting._value,
			fontFamily    = value['font-family'],
			fonts         = control.getFonts(),
			fontSelect;

		if ( _.isUndefined( value['font-backup'] ) || null === value['font-backup'] ) {
			value['font-backup'] = '';
		}

		// Hide if we're not on a google-font.
		if ( 'inherit' === fontFamily || 'initial' === fontFamily || 'google' !== kirki.util.webfonts.getFontType( fontFamily ) ) {
			jQuery( control.selector + ' .font-backup' ).hide();
			return;
		}
		jQuery( control.selector + ' .font-backup' ).show();

		// Format standard fonts as an array.
		if ( ! _.isUndefined( fonts.standard ) ) {
			_.each( fonts.standard, function( font ) {
				standardFonts.push( {
					id: font.family.replace( /&quot;/g, '&#39' ),
					text: font.label
				} );
			} );
		}

		// Instantiate selectWoo with the data.
		fontSelect = jQuery( selector ).selectWoo( {
			data: standardFonts
		} );

		// Set the initial value.
		if ( 'undefined' !== typeof value['font-backup'] ) {
			fontSelect.val( value['font-backup'].replace( /'/g, '"' ) ).trigger( 'change' );
		}

		// When the value changes
		fontSelect.on( 'change', function() {

			// Set the value.
			control.saveValue( 'font-backup', jQuery( this ).val() );
		} );
	},

	/**
	 * Renders the variants selector using selectWoo
	 * Displays font-variants for the currently selected font-family.
	 */
	renderVariantSelector: function() {

		var control    = this,
			value      = control.setting._value,
			fontFamily = value['font-family'],
			selector   = control.selector + ' .variant select',
			data       = [],
			isValid    = false,
			fontType   = kirki.util.webfonts.getFontType( fontFamily ),
			variants   = [ '', 'regular', 'italic', '700', '700italic' ],
			fontWeight,
			variantSelector,
			fontStyle;

		if ( 'google' === fontType ) {
			variants = kirki.util.webfonts.google.getVariants( fontFamily );
		}

		// Check if we've got custom variants defined for this font.
		if ( ! _.isUndefined( control.params ) && ! _.isUndefined( control.params.choices ) && ! _.isUndefined( control.params.choices.fonts ) && ! _.isUndefined( control.params.choices.fonts.variants ) ) {

			// Check if we have variants for this font-family.
			if ( ! _.isUndefined( control.params.choices.fonts.variants[ fontFamily ] ) ) {
				variants = control.params.choices.fonts.variants[ fontFamily ];
			}
		}
		if ( kirkiL10n.isScriptDebug ) {
			console.info( 'Kirki Debug: Font variants for font-family "' + fontFamily + '":' );
			console.info( variants );
		}

		if ( 'inherit' === fontFamily || 'initial' === fontFamily || '' === fontFamily ) {
			value.variant = 'inherit';
			variants      = [ '' ];
			jQuery( control.selector + ' .variant' ).hide();
		}

		if ( 1 >= variants.length ) {
			jQuery( control.selector + ' .variant' ).hide();

			value.variant = variants[0];

			control.saveValue( 'variant', value.variant );

			if ( '' === value.variant || ! value.variant ) {
				fontWeight = '';
				fontStyle  = '';
			} else {
				fontWeight = ( ! _.isString( value.variant ) ) ? '400' : value.variant.match( /\d/g );
				fontWeight = ( ! _.isObject( fontWeight ) ) ? '400' : fontWeight.join( '' );
				fontStyle  = ( value.variant && -1 !== value.variant.indexOf( 'italic' ) ) ? 'italic' : 'normal';
			}

			control.saveValue( 'font-weight', fontWeight );
			control.saveValue( 'font-style', fontStyle );

			return;
		}

		jQuery( control.selector + ' .font-backup' ).show();

		jQuery( control.selector + ' .variant' ).show();
		_.each( variants, function( variant ) {
			if ( value.variant === variant ) {
				isValid = true;
			}
			data.push( {
				id: variant,
				text: variant
			} );
		} );
		if ( ! isValid ) {
			value.variant = 'regular';
		}

		if ( jQuery( selector ).hasClass( 'select2-hidden-accessible' ) ) {
			jQuery( selector ).selectWoo( 'destroy' );
			jQuery( selector ).empty();
		}

		// Instantiate selectWoo with the data.
		variantSelector = jQuery( selector ).selectWoo( {
			data: data
		} );
		variantSelector.val( value.variant ).trigger( 'change' );
		variantSelector.on( 'change', function() {
			control.saveValue( 'variant', jQuery( this ).val() );
			if ( 'string' !== typeof value.variant ) {
				value.variant = variants[0];
			}

			fontWeight = ( ! _.isString( value.variant ) ) ? '400' : value.variant.match( /\d/g );
			fontWeight = ( ! _.isObject( fontWeight ) ) ? '400' : fontWeight.join( '' );
			fontStyle  = ( -1 !== value.variant.indexOf( 'italic' ) ) ? 'italic' : 'normal';

			control.saveValue( 'font-weight', fontWeight );
			control.saveValue( 'font-style', fontStyle );
		} );
	},

	/**
	 * Get fonts.
	 */
	getFonts: function() {
		var control            = this,
			initialGoogleFonts = kirki.util.webfonts.google.getFonts(),
			googleFonts        = {},
			googleFontsSort    = 'alpha',
			googleFontsNumber  = 0,
			standardFonts      = {};

		// Get google fonts.
		if ( ! _.isEmpty( control.params.choices.fonts.google ) ) {
			if ( 'alpha' === control.params.choices.fonts.google[0] || 'popularity' === control.params.choices.fonts.google[0] || 'trending' === control.params.choices.fonts.google[0] ) {
				googleFontsSort = control.params.choices.fonts.google[0];
				if ( ! isNaN( control.params.choices.fonts.google[1] ) ) {
					googleFontsNumber = parseInt( control.params.choices.fonts.google[1], 10 );
				}
				googleFonts = kirki.util.webfonts.google.getFonts( googleFontsSort, '', googleFontsNumber );

			} else {
				_.each( control.params.choices.fonts.google, function( fontName ) {
					if ( 'undefined' !== typeof initialGoogleFonts[ fontName ] && ! _.isEmpty( initialGoogleFonts[ fontName ] ) ) {
						googleFonts[ fontName ] = initialGoogleFonts[ fontName ];
					}
				} );
			}
		} else {
			googleFonts = kirki.util.webfonts.google.getFonts( googleFontsSort, '', googleFontsNumber );
		}

		// Get standard fonts.
		if ( ! _.isEmpty( control.params.choices.fonts.standard ) ) {
			_.each( control.params.choices.fonts.standard, function( fontName ) {
				if ( 'undefined' !== typeof kirki.util.webfonts.standard.fonts[ fontName ] && ! _.isEmpty( kirki.util.webfonts.standard.fonts[ fontName ] ) ) {
					standardFonts[ fontName ] = {};
					if ( 'undefined' !== kirki.util.webfonts.standard.fonts[ fontName ].stack && ! _.isEmpty( kirki.util.webfonts.standard.fonts[ fontName ].stack ) ) {
						standardFonts[ fontName ].family = kirki.util.webfonts.standard.fonts[ fontName ].stack;
					} else {
						standardFonts[ fontName ].family = googleFonts[ fontName ];
					}
					if ( 'undefined' !== kirki.util.webfonts.standard.fonts[ fontName ].label && ! _.isEmpty( kirki.util.webfonts.standard.fonts[ fontName ].label ) ) {
						standardFonts[ fontName ].label = kirki.util.webfonts.standard.fonts[ fontName ].label;
					} else if ( ! _.isEmpty( standardFonts[ fontName ] ) ) {
						standardFonts[ fontName ].label = standardFonts[ fontName ];
					}
				} else {
					standardFonts[ fontName ] = {
						family: fontName,
						label: fontName
					};
				}
			} );
		} else {
			_.each( kirki.util.webfonts.standard.fonts, function( font, id ) {
				standardFonts[ id ] = {
					family: font.stack,
					label: font.label
				};
			} );
		}
		return {
			google: googleFonts,
			standard: standardFonts
		};
	},
	
	/**
	 * Saves the value.
	 */
	saveValue: function( property, value ) {

		var control = this,
			input   = control.container.find( '.typography-hidden-value' ),
			device  = control.currentDevice(),
			val     = control.setting._value;
		
		if ( control.media_query_types.includes( property ) )
			val[device][ property ] = value;
		else
			val[ property ] = value;
		
		jQuery( input ).attr( 'value', JSON.stringify( val ) ).trigger( 'change' );
		control.setting.set( val );
	},
	
	defaultValue: function() {
		var control = this,
			value = {};
		control.global_types.forEach( function( type )
		{
			if ( _.isUndefined( control.params.default[type] ) )
				return false;
			value[type] = control.params.default[type];
		});
		_.each( kirki.util.media_query_devices, function( device )
		{
			if ( !control.params.choices.use_media_queries &&
				 device !== kirki.util.media_query_devices.desktop )
			{ 
				return false;
			}
			if ( _.isUndefined( value[device] ) )
				value[device] = {};
			control.media_query_types.forEach( function( type )
			{
				if ( _.isUndefined( control.params.default[type] ) )
					return false;
				if ( device !== kirki.util.media_query_devices.desktop && 
					control.params.choices.use_media_queries )
				{
					value[device][type] = '';
					return false;
				}
				value[device][type] = control.params.default[type];
			});
		});
		return value;
	},
	
	currentDevice: function() {
		return this.container.find( '.kirki-responsive-switchers .active' ).attr( 'device' ) || 'desktop'
	}
} );

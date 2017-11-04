var kirki = kirki || {};
kirki.input = {

	textarea: {

		/**
		 * Get the template for a <textarea> element.
		 *
		 * @since 3.1.0
		 * @param {object} [args] The arguments for the input element.
		 * @returns {string}      The HTML for the input element.
		 */
		template: function( args ) {
			args = _.defaults( args, {
				id: '',
				value: '',
				inputAttrs: ''
			} );
			return '<textarea data-id="' + args.id + '"' + args.inputAttrs + '>' + args.value + '</textarea>';
		}
	},

	select: {

		/**
		 * Get the template for a <select> element.
		 *
		 * @since 3.1.0
		 * @param {object} [args] The arguments for the input element.
		 * @returns {string}      The HTML for the input element.
		 */
		template: function( args ) {
			var html = '';

			args = _.defaults( args, {
				multiple: 1,
				inputAttrs: '',
				choices: {}
			} );
			args.multiple = parseInt( args.multiple, 10 );
			html += '<select data-id="' + args.id + '" ' + args.inputAttrs + ( 1 < args.multiple ? ' data-multiple="' + args.multiple + '" multiple="multiple"' : '' ) + '>';
				_.each( args.choices, function( optionLabel, optionKey ) {

					// Is this option selected?
					var selected = ( args.value === optionKey );
					if ( 1 < args.multiple && args.value ) {
						selected = _.contains( args.value, optionKey );
					}

					// If instead of a label (string) we have an object,
					// then treat this as an optgroup element.
					if ( _.isObject( optionLabel ) ) {
						html += '<optgroup label="' + optionLabel[0] + '">';
						_.each( optionLabel[1], function( optgroupOptionLabel, optgroupOptionKey ) {

							// Is this option selected? (re-loop because of optgroup).
							selected = ( args.value === optgroupOptionKey );
							if ( 1 < args.multiple && args.value ) {
								selected = _.contains( args.value, optgroupOptionKey );
							}

							// Add option in optgroup.
							html += '<option value="' + optgroupOptionKey + '"' + ( selected ? ' selected' : '' ) + '>' + optgroupOptionLabel + '</option>';
						} );
						html += '</optgroup>';
					} else {

						// Add hte option.
						html += '<option value="' + optionKey + '"' + ( selected ? ' selected' : '' ) + '>' + optionLabel + '</option>';
					}
				} );
			html += '</select>';
			return html;
		},

		/**
		 * Init for select2 input fields.
		 *
		 * @since 3.1.0
		 * @param {object} [args] The arguments for the input element.
		 * @returns {void}
		 */
		init: function( args ) {
			var id      = args.id || '',
				element = 'select[data-id=' + id + ']';

			args.multiple = args.multiple || 1;
			args.multiple = parseInt( args.multiple, 10 );

			// Init select2 for this element.
			jQuery( element ).select2( {
				escapeMarkup: function( markup ) {
					return markup;
				},
				maximumSelectionLength: args.multiple
			} ).on( 'change', function() {
				kirki.setting.set( args.id, jQuery( this ).val() );
			} );
		}
	},

	radio: {

		/**
		 * Get the template for a <radio> element.
		 *
		 * @since 3.1.0
		 * @param {object} [args] The arguments for the input element.
		 * @returns {string}      The HTML for the input element.
		 */
		template: function( args ) {
			var html = '';

			args = _.defaults( args, {
				id: '',
				choices: {},
				inputAttrs: '',
				value: ''
			} );

			_.each( args.choices, function( value, key ) {
				html += '<label>';
					html += '<input data-id="' + args.id + '" ' + args.inputAttrs + ' type="radio" value="' + key + '" name="' + args.id + '" ' + ( args.value === key ? ' checked' : '' ) + '/>';
					html += ( _.isArray( value ) ) ? args.value[0] + '<span class="option-description">' + args.value[1] + '</span>' : value;
				html += '</label>';
			} );
			return html;

		},

		/**
		 * Init for radio input.
		 *
		 * @since 3.1.0
		 * @param {object} [args] The arguments.
		 * @returns {void}
		 */
		init: function( args ) {
			jQuery( 'input[data-id=' + args.id + ']' ).on( 'change click', function( event ) {
				var value = jQuery( 'input[data-id=' + args.id + ']:checked' ).val();
				kirki.setting.set( args.id, value );
			} );
		}
	},

	color: {

		/**
		 * Get the template for a <color> element.
		 *
		 * @since 3.1.0
		 * @param {object} [args] The arguments for the input element.
		 * @returns {string}      The HTML for the input element.
		 */
		template: function( args ) {
			args = _.defaults( args, {
				inputAttrs: '',
				'data-palette': args.palette || '',
				'data-default-color': args['default'] || '',
				'data-alpha': args.arpha || true,
				value: '',
				'class': 'kirki-color-control'
			} );
			args.type = 'text';

			return kirki.input.generic.template( args );
		},

		/**
		 * Init for color inputs.
		 *
		 * @since 3.1.0
		 * @param {object} [args] The arguments for the input element.
		 * @returns {void}
		 */
		init: function( args ) {
			var id      = args.id || '',
				element = '.kirki-color-control[data-id=' + id + ']';

			// If we have defined any extra choices, make sure they are passed-on to Iris.
			if ( ! _.isUndefined( args.choices ) ) {
				jQuery( element ).wpColorPicker( args.choices );
			}

			// Tweaks to make the "clear" buttons work.
			// TODO
			setTimeout( function() {
				var clear = jQuery( element ).closest( '.wp-picker-clear' );
				clear.click( function() {
					kirki.setting.set( args.id, '' );
				});
			}, 200 );

			// Saves our settings to the WP API
			jQuery( element ).wpColorPicker({
				change: function() {

					// Small hack: the picker needs a small delay
					setTimeout( function() {
						kirki.setting.set( args.id, jQuery( element ).val() );
					}, 20 );
				}
			});
		}
	},

	checkbox: {

		/**
		 * Get the template for a <checkbox> element.
		 *
		 * @since 3.1.0
		 * @param {object} [args] The arguments for the input element.
		 * @returns {string}      The HTML for the input element.
		 */
		template: function( args ) {
			args = _.defaults( args, {
				id: '',
				inputAttrs: '',
				value: ''
			} );
			return '<input data-id="' + args.id + '" type="checkbox" ' + args.inputAttrs + 'value="' + args.value + '" ' + ( true === args.value ? ' checked' : '' ) + '/>';
		}
	},

	generic: {

		/**
		 * Get the template for a generic input element.
		 *
		 * @since 3.1.0
		 * @param {object} [args] The arguments for the input element.
		 * @returns {string}      The HTML for the input element.
		 */
		template: function( args ) {
			var html = '';

			args = _.defaults( args, {
				element: 'input',
				id: '',
				value: '',
				inputAttrs: '',
				choices: {},
				type: 'text'
			} );

			args.choices.content = args.choices.content || '';

			// Delete blacklisted.
			delete args.content;
			delete args.description;
			delete args.instanceNumber;
			delete args.label;
			delete args.link;
			delete args.output;
			delete args.priority;
			delete args.section;
			delete args.settings;
			delete args.ajaxurl;

			html += '<' + args.element;
			_.each( args, function( val, key ) {
				if ( 'link' === key || 'inputattrs' === key || 'element' === key ) {
					return;
				}
				if ( _.isString( val ) ) {
					key = ( 'id' === key ) ? 'data-id' : key;
					html += ' ' + key + '="' + val + '"';
				}
			} );
			_.each( args.choices, function( value, key ) {
				html += ' ' + key + '="' + value + '"';
			} );
			html += ( '' !== args.choices.content ) ? '>' + args.choices.content + '</' + args.element + '>' : '/>';
			return html;
		},

		/**
		 * Init for radio input.
		 *
		 * @since 3.1.0
		 * @param {object} [args] The arguments.
		 * @returns {void}
		 */
		init: function( args ) {
			jQuery( 'input[data-id=' + args.id + ']' ).on( 'change keyup paste', function( event ) {
				var value = jQuery( 'input[data-id=' + args.id + ']' ).val();
				kirki.setting.set( args.id, jQuery );
			} );
		}
	},

	image: {

		/**
		 * Get the template for a generic input element.
		 *
		 * @since 3.1.0
		 * @param {object} [args] The arguments for the input element.
		 * @returns {string}      The HTML for the input element.
		 */
		template: function( args ) {
			var self      = this,
			    html      = '',
			    saveAs    = self.getSaveAs( args ),
			    isDefault = false,
			    url;

			args = _.defaults( args, {
				id: '',
				value: '',
				'default': ''
			} );

			url = ( _.isObject( args.value ) && ! _.isUndefined( args.value.url ) ) ? args.value.url : args.value;

			html += '<div class="image-wrapper attachment-media-view image-upload" data-id="' + args.id + '">';
				if ( args.value.url || '' !== url ) {
					html += '<div class="thumbnail thumbnail-image">';
						html += '<img src="' + url + '" alt="" />';
					html += '</div>';
				} else {
					html += '<div class="placeholder">';
						html += 'No File Selected';
					html += '</div>';
				}
				html += '<div class="actions">';
					html += '<button class="button image-upload-remove-button' + ( ( '' === url ) ? ' hidden' : '' ) + '">';
						html += 'Remove';
					html += '</button>';
					if ( args['default'] && '' !== args['default'] ) {
						isDefault = ( args['default'] === args.value || ( ! _.isUndefined( args.value.url ) && args['default'] === args.value.url ) );
						html += '<button type="button" class="button image-default-button"' + ( isDefault ? ' style="display:none;"' : '' ) + '>';
							html += 'Default';
						html += '</button>';
					}
					html += '<button type="button" class="button image-upload-button">';
						html += 'Select File';
					html += '</button>';
				html += '</div>';
			html += '</div>';

			return html;
		},

		/**
		 * Init for image input.
		 *
		 * @since 3.1.0
		 * @param {object} [args] The arguments.
		 * @returns {void}
		 */
		init: function( args ) {
			var self           = this,
			    saveAs         = self.getSaveAs( args ),
			    inputContainer = jQuery( '.image-wrapper[data-id=' + args.id + ']' ),
			    preview        = inputContainer.find( '.placeholder, .thumbnail' ),
			    removeButton   = inputContainer.find( '.image-upload-remove-button' ),
			    defaultButton  = inputContainer.find( '.image-default-button' ),
			    previewImage;

			args = _.defaults( args, {
				id: '',
				value: '',
				'default': ''
			} );

			previewImage = ( 'array' === saveAs ) ? args.value.url : args.value;

			// Tweaks for save_as = id.
			// This will get the image URL from the ID and add it in the template.
			if ( ( 'id' === saveAs || 'ID' === saveAs ) && '' !== args.value ) {
				wp.media.attachment( args.value ).fetch().then( function( mediaData ) {
					setTimeout( function() {
						var url = wp.media.attachment( args.value ).get( 'url' );
						preview.removeClass().addClass( 'thumbnail thumbnail-image' ).html( '<img src="' + url + '" alt="" />' );
					}, 700 );
				} );
			}

			// If value is not empty, hide the "default" button.
			if ( ( ( 'url' === saveAs || 'id' === saveAs ) && '' !== args.value ) || ( 'array' === saveAs && ! _.isUndefined( args.value.url ) && '' !== args.value.url ) ) {
				inputContainer.find( 'image-default-button' ).hide();
			}

			// If value is empty, hide the "remove" button.
			if ( ( 'url' === saveAs && '' === args.value ) || ( 'array' === saveAs && ( _.isUndefined( args.value.url ) || '' === args.value.url ) ) ) {
				removeButton.hide();
			}

			// If value is default, hide the default button.
			if ( args.value === args['default'] ) {
				inputContainer.find( 'image-default-button' ).hide();
			}

			if ( '' !== previewImage ) {
				preview.removeClass().addClass( 'thumbnail thumbnail-image' ).html( '<img src="' + previewImage + '" alt="" />' );
			}

			self.uploadButton( args );
			self.removeButton( args );
			self.defaultButton( args );

		},

		/**
		 * Handle clicking on the upload button.
		 *
		 * @since 3.1.0
		 * @param {object} [args] The arguments.
		 * @returns {void}
		 */
		uploadButton: function( args ) {
			var self           = this,
				saveAs         = self.getSaveAs( args ),
				inputContainer = jQuery( '.image-wrapper[data-id=' + args.id + ']' ),
				preview        = inputContainer.find( '.placeholder, .thumbnail' ),
				removeButton   = inputContainer.find( '.image-upload-remove-button' ),
				defaultButton  = inputContainer.find( '.image-default-button' ),
				previewImage;

			inputContainer.on( 'click', '.image-upload-button', function( e ) {
				var image = wp.media({ multiple: false }).open().on( 'select', function() {

						// This will return the selected image from the Media Uploader, the result is an object.
						var uploadedImage = image.state().get( 'selection' ).first(),
							previewImage  = uploadedImage.toJSON().sizes.full.url;

						if ( ! _.isUndefined( uploadedImage.toJSON().sizes.medium ) ) {
							previewImage = uploadedImage.toJSON().sizes.medium.url;
						} else if ( ! _.isUndefined( uploadedImage.toJSON().sizes.thumbnail ) ) {
							previewImage = uploadedImage.toJSON().sizes.thumbnail.url;
						}

						if ( 'array' === saveAs ) {
							kirki.setting.set( args.id, uploadedImage.toJSON().id, 'id' );
							kirki.setting.set( args.id, uploadedImage.toJSON().sizes.full.url, 'url' );
							kirki.setting.set( args.id, uploadedImage.toJSON().width, 'width' );
							kirki.setting.set( args.id, uploadedImage.toJSON().height, 'height' );
						} else if ( 'id' === saveAs ) {
							kirki.setting.set( args.id, uploadedImage.toJSON().id, 'id' );
						} else {
							kirki.setting.set( args.id, uploadedImage.toJSON().sizes.full.url, 'url' );
						}

						if ( preview.length ) {
							preview.removeClass().addClass( 'thumbnail thumbnail-image' ).html( '<img src="' + previewImage + '" alt="" />' );
						}
						if ( removeButton.length ) {
							removeButton.show();
							defaultButton.hide();
						}
					});

				e.preventDefault();
			});
		},

		/**
		 * Handle clicking on the remove button.
		 *
		 * @since 3.1.0
		 * @param {object} [args] The arguments.
		 * @returns {void}
		 */
		removeButton: function( args ) {
			var self           = this,
				saveAs         = self.getSaveAs( args ),
				inputContainer = jQuery( '.image-wrapper[data-id=' + args.id + ']' ),
				preview        = inputContainer.find( '.placeholder, .thumbnail' ),
				removeButton   = inputContainer.find( '.image-upload-remove-button' ),
				defaultButton  = inputContainer.find( '.image-default-button' ),
				previewImage;

			inputContainer.on( 'click', '.image-upload-remove-button', function( e ) {

				var preview,
					removeButton,
					defaultButton;

				e.preventDefault();

				if ( 'array' === saveAs ) {
					kirki.setting.set( args.id, '', 'id' );
					kirki.setting.set( args.id, '', 'url' );
					kirki.setting.set( args.id, '', 'width' );
					kirki.setting.set( args.id, '', 'height' );
				} else {
					kirki.setting.set( args.id, '' );
				}

				preview       = inputContainer.find( '.placeholder, .thumbnail' );
				removeButton  = inputContainer.find( '.image-upload-remove-button' );
				defaultButton = inputContainer.find( '.image-default-button' );

				if ( preview.length ) {
					preview.removeClass().addClass( 'placeholder' ).html( 'No file selected' );
				}
				if ( removeButton.length ) {
					removeButton.hide();
					if ( jQuery( defaultButton ).hasClass( 'button' ) ) {
						defaultButton.show();
					}
				}
			});
		},

		/**
		 * Handle clicking on the default button.
		 *
		 * @since 3.1.0
		 * @param {object} [args] The arguments.
		 * @returns {void}
		 */
		defaultButton: function( args ) {
			var self           = this,
				saveAs         = self.getSaveAs( args ),
				inputContainer = jQuery( '.image-wrapper[data-id=' + args.id + ']' ),
				preview        = inputContainer.find( '.placeholder, .thumbnail' ),
				removeButton   = inputContainer.find( '.image-upload-remove-button' ),
				defaultButton  = inputContainer.find( '.image-default-button' ),
				previewImage;

			inputContainer.on( 'click', '.image-default-button', function( e ) {

				var preview,
					removeButton,
					defaultButton;

				e.preventDefault();

				kirki.setting.set( args.id, args['default'], 'url' );

				preview       = inputContainer.find( '.placeholder, .thumbnail' );
				removeButton  = inputContainer.find( '.image-upload-remove-button' );
				defaultButton = inputContainer.find( '.image-default-button' );

				if ( preview.length ) {
					preview.removeClass().addClass( 'thumbnail thumbnail-image' ).html( '<img src="' + args['default'] + '" alt="" />' );
				}
				if ( removeButton.length ) {
					removeButton.show();
					defaultButton.hide();
				}
			});
		},

		/**
		 * Figure out what we're saving this as (array|url|id).
		 *
		 * @since 3.1.0
		 * @param {object} [args] The arguments.
		 * @returns {string}
		 */
		getSaveAs: function( args ) {
			if ( _.isUndefined( args.save_as ) ) {
				args.save_as = 'url';
				if ( ! _.isUndefined( args.choices ) && ! _.isUndefined( args.choices.save_as ) ) {
					args.save_as = args.choices.save_as;
				}
			}
			args.save_as = ( 'ID' === args.save_as ) ? 'id' : args.save_as;
			args.save_as = ( 'url' !== args.save_as && 'array' !== args.save_as && 'id' !== args.save_as ) ? 'url' : args.save_as;
			return args.save_as;
		}
	}
};

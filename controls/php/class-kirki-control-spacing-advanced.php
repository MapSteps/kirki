<?php
/**
 * Customizer Control: slider.
 *
 * Creates a jQuery slider control.
 *
 * @package     Kirki
 * @subpackage  Controls
 * @copyright   Copyright (c) 2017, Aristeides Stathopoulos
 * @license     http://opensource.org/licenses/https://opensource.org/licenses/MIT
 * @since       1.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Slider control (range).
 */
class Kirki_Control_Spacing_Advanced extends Kirki_Control_Base {

	/**
	 * The control type.
	 *
	 * @access public
	 * @var string
	 */
	public $type = 'kirki-spacing-advanced';
	
	/**
	 * Refresh the parameters passed to the JavaScript via JSON.
	 *
	 * @see WP_Customize_Control::to_json()
	 */
	public function to_json() {
		parent::to_json();
		$this->json['choices'] = wp_parse_args( $this->json['choices'], array(
			'use_media_queries' => true,
			'sync_values' => true
		));
	}

	/**
	 * An Underscore (JS) template for this control's content (but not its container).
	 *
	 * Class variables for this control class are available in the `data` JS object;
	 * export custom variables by overriding {@see WP_Customize_Control::to_json()}.
	 *
	 * @see WP_Customize_Control::print_template()
	 *
	 * @access protected
	 */
	protected function content_template() {
		?>
		<label>
			<# if ( data.choices.units ) { #>
			<div class="kirki-units-choices-outer">
				<# _.each( data.choices.units, function( unit ) { #>
				<div class="kirki-units-choices">
					<input id="{{ data.id }}_{{ unit }}" type="radio" name="{{ data.id }}_unit" data-setting="unit" value="{{ unit }}">
					<label class="kirki-units-choices-label" for="{{ data.id }}_{{ unit }}">{{ unit }}</label>
				</div>
				<# }); #>
			</div>
			<# } #>
			<# if ( data.label ) { #><span class="customize-control-title">{{{ data.label }}}</span><# } #>
			<# if ( data.description ) { #><span class="description customize-control-description">{{{ data.description }}}</span><# } #>
			<# if ( data.choices.use_media_queries ) { #>
			<ul class="kirki-responsive-switchers">
				<li class="desktop"><span class="eicon-device-desktop"></span></li>
				<li class="tablet hidden"><span class="eicon-device-tablet"></span></li>
				<li class="mobile hidden"><span class="eicon-device-mobile"></span></li>
			</ul>
			<# } #>
			<div class="kirki-control-type-dimensions">
				<ul class="kirki-control-dimensions">
					<# _.each( ['top', 'right', 'bottom', 'left'], function( side ) {
						if ( data.default && _.isUndefined( data.default[side] ) )
							return false;
						var label = side.charAt( 0 ).toUpperCase() + side.substring( 1 );
					#>
					<li class="kirki-control-dimension">
						<input type="number" id="{{{ data.id }}}-{{{ side }}}" data-side="{{{ side }}}">
						<label for="{{{ data.id }}}-{{{ side }}}" class="kirki-control-dimension-label"><?php _e('{{{ label }}}', 'kirki') ?></span>
					</li>
					<# }); #>
					<# if ( data.choices.sync_values ) { #>
					<li>
						<button class="kirki-input-link tooltip-target unlinked" data-tooltip="<?php _e( 'Link values together', 'kirki' ); ?>" original-title="">
							<span class="kirki-linked">
								<span class="dashicons dashicons-admin-links" aria-hidden="true"></span>
								<span class="kirki-screen-only"><?php _e( 'Link values together', 'kirki' );?></span>
							</span>
							<span class="kirki-unlinked">
								<span class="dashicons dashicons-editor-unlink" aria-hidden="true"></span>
								<span class="kirki-screen-only"><?php _e( 'Unlinked values', 'kirki' );?></span>
							</span>
						</button>
					</li>
					<# } #>
				</ul>
			</div>
			<input class="spacing-hidden-value" type="hidden" value="" {{{ data.link }}} />
		</label>
		<?php
	}
}
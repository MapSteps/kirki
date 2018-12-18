<?php
/**
 * Customizer Control: slider-advanced.
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
class Kirki_Control_Slider_Advanced extends Kirki_Control_Base {

	/**
	 * The control type.
	 *
	 * @access public
	 * @var string
	 */
	public $type = 'kirki-slider-advanced';
	
	/**
	 * Media queries toggle
	 */
	
	public $use_media_queries = true;
	
	/**
	 * Refresh the parameters passed to the JavaScript via JSON.
	 *
	 * @see WP_Customize_Control::to_json()
	 */
	public function to_json() {
		parent::to_json();
		$this->json['use_media_queries'] = $this->use_media_queries;
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
			<# if ( data.choices.units ) {#>
			<div class="kirki-unit-choices-outer">
				<# for ( unit_id in data.choices.units ) {
					var unit = data.choices.units[unit_id];
					if ( typeof unit !== 'object' )
					{
						unit_id = unit;
						unit = {
							min: data.choices.min || 0,
							max: data.choices.max || 0,
							step: data.choices.step || 0
						};
					}
				#>
				<div class="kirki-unit-choice">
					<input id="{{ data.id }}_{{ unit_id }}" type="radio" name="{{ data.id }}_unit" data-setting="unit" value="{{ unit_id }}" min="{{ unit['min'] }}" max="{{ unit['max'] }}" step="{{ unit['step'] }}">
					<label class="kirki-unit-choice-label" for="{{ data.id }}_{{ unit_id }}">{{ unit_id }}</label>
				</div>
				<# } #>
			</div>
			<# } #>
			<span class="customize-control-title">
				<span>{{{ data.label }}}</span>
				<# if ( data.use_media_queries ) { #>
				<?php Kirki_Helper::responsive_switcher_template(); ?>
				<# } #>
			</span>
			<# if ( data.description ) { #><span class="description customize-control-description">{{{ data.description }}}</span><# } #>
			<div class="control-wrapper-outer">
				<div class="control-wrapper">
					<input {{{ data.inputAttrs }}} type="range" min="0" max="100" step="1" value="" />
					<span class="slider-reset dashicons dashicons-image-rotate"><span class="screen-reader-text"><?php esc_attr_e( 'Reset', 'kirki' ); ?></span></span>
					<span class="value">
						<input {{{ data.inputAttrs }}} type="text"/>
						<span class="suffix">{{ data.choices['suffix'] }}</span>
					</span>
				</div>
			</div>
			<input class="slider-hidden-value" type="hidden" value="" {{{ data.link }}} />
		</label>
		<?php
	}
}
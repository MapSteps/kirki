<?php
/**
 * Customizer Control: border.
 *
 * Creates a new custom control.
 * Custom controls contains all border-related options.
 *
 * @package     Kirki
 * @subpackage  Controls
 * @copyright   Copyright (c) 2017, Aristeides Stathopoulos
 * @license     http://opensource.org/licenses/https://opensource.org/licenses/MIT
 * @since       1.0
 */

/**
 * Adds multiple input fields that combined make up the border control.
 */
class Kirki_Control_Border extends Kirki_Control_Base {

	/**
	 * The control type.
	 *
	 * @access public
	 * @var string
	 */
	public $type = 'kirki-border';
	
	/**
	 * The all units mode
	 */
	public $all_units = false;
	
	public function to_json() {
		parent::to_json();
		$this->json['all_units'] = $this->all_units;
		$this->json['choices'] = wp_parse_args( $this->json['choices'], array(
			'style'  => '',
			'top'    => '',
			'right'  => '',
			'bottom' => '',
			'left'   => '',
			'color'  => '',
			'units' => array( 'px' ),
		) );
	}
	
	protected function content_template() 
	{
		?>
		<label>
			<div class="kirki-units-choices-outer">
				<#
				if ( data.choices.units || data.all_units ) {
					if ( _.isUndefined( data.choices ) )
						data.choices = [];
					if ( data.all_units )
						data.choices.units.push ( 'all' );
					_.each( data.choices.units, function( unit ) {
				#>
					<div class="kirki-units-choices">
						<input id="{{ data.id }}_{{ unit }}" type="radio" name="{{ data.id }}_unit" data-setting="unit" value="{{ unit }}">
						<label class="kirki-units-choices-label" for="{{ data.id }}_{{ unit }}">{{ unit }}</label>
					</div>
				<# }); } #>
			</div>
			<span class="customize-control-title">{{{ data.label }}}</span>
			<# if ( data.description ) { #><span class="description customize-control-description">{{{ data.description }}}</span><# } #>
		</label>
		<div class="kirki-group-outer border">
			<h5><?php _e( 'Border Type', 'kirki' ) ?></h5>
			<div class="border-type">
				<select>
					<option value="none"><?php _e( 'None', 'kirki' ); ?></option>
					<option value="solid"><?php _e( 'Solid', 'kirki' ); ?></option>
					<option value="double"><?php _e( 'Double', 'kirki' ); ?></option>
					<option value="dotted"><?php _e( 'Dotted', 'kirki' ); ?></option>
					<option value="dashed"><?php _e( 'Dashed', 'kirki' ); ?></option>
					<option value="groove"><?php _e( 'Groove', 'kirki' ); ?></option>
				</select>
			</div>
			<div class="size">
				<h5><?php _e( 'Size', 'kirki' ) ?></h5>
				<div class="kirki-control-type-dimensions">
					<ul class="kirki-control-dimensions">
						<li class="kirki-control-dimension">
							<input type="number" id="{{{ data.id }}}-top" data-border-position="top">
							<label for="{{{ data.id }}}-top" class="kirki-control-dimension-label"><?php _e('Top', 'kirki') ?></span>
						</li>
						<li class="kirki-control-dimension">
							<input type="number" id="{{{ data.id }}}-right" data-border-position="right">
							<label for="{{{ data.id }}}-right" class="kirki-control-dimension-label"><?php _e('Right', 'kirki') ?></span>
						</li>
						<li class="kirki-control-dimension">
							<input type="number" id="{{{ data.id }}}-bottom" data-border-position="bottom">
							<label for="{{{ data.id }}}-bottom" class="kirki-control-dimension-label"><?php _e('Bottom', 'kirki') ?></span>
						</li>
						<li class="kirki-control-dimension">
							<input type="number" id="{{{ data.id }}}-left" data-border-position="left">
							<label for="{{{ data.id }}}-left" class="kirki-control-dimension-label"><?php _e( 'Left', 'kirki' ) ?></span>
						</li>
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
					</ul>
				</div>
			</div>
			<div class="color">
				<h5><?php _e( 'Color', 'kirki' ) ?></h5>
				<input type="text" class="color-picker" data-alpha="true" value="" />
			</div>
		</div>
		<input class="border-hidden-value" type="hidden" value="{{ data.value }}" {{{ data.link }}}>
		<?php
	}
}

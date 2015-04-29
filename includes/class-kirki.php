<?php

/**
 * Class Kirki
 *
 * The main Kirki object
 */
class Kirki {

	public static $instances = array();

	/** @var string Version number */
	public static $version = '0.9-dev';

	public $config  = null;
	public $fonts   = null;
	public $scripts = null;
	public $builder = null;

	public $fields  = null;
	/**
	 * Access the single instance of this class
	 * @return Kirki
	 */
	public static function get_instance( $instance = null ) {

		if ( empty( self::$instances ) || ! isset( self::$instances[$instance] ) ) {
			self::$instances[$instance] = new Kirki( $instance );
		}

		return self::$instances[$instance];

	}

	/**
	 * Shortcut method to call the Field class
	 */
	public static function fields( $instance = null ) {
		return self::get_instance( $instance )->fields;
	}

	/**
	 * Shortcut method to get the configuration of the single instance.
	 */
	public static function config( $instance = null ) {
		return self::get_instance( $instance )->config;
	}

	/**
	 * Shortcut method to get the translation strings
	 */
	public static function i18n( $instance = null ) {
		$config  = self::config( $instance );
		$options = $config->get_all();
		return $options['i18n'];
	}

	/**
	 * Shortcut method to get the font registry.
	 */
	public static function fonts( $instance = null ) {
		return self::get_instance( $instance )->fonts;
	}

	/**
	 * Adds configution for an instance
	 */
	public static function add_config( $instance_id = '', $config = array() ) {
		self::$instances[$instance_id] = ( isset( self::$instances[$instance_id] ) ) ? self::$instances[$instance_id] : array();
		self::$instances[$instance_id]['config'] = $config;
	}

	/**
	 * Adds panel to an instance
	 */
	public static function add_panel( $instance_id = '', $panel = array() ) {
		self::$instances[$instance_id] = ( isset( self::$instances[$instance_id] ) ) ? self::$instances[$instance_id] : array();
		self::$instances[$instance_id]['panels'][$panel['id']] = $panel;
	}

	/**
	 * Adds a section to an instance
	 */
	public static function add_section( $instance_id = '', $section = array() ) {
		self::$instances[$instance_id] = ( isset( self::$instances[$instance_id] ) ) ? self::$instances[$instance_id] : array();
		self::$instances[$instance_id]['sections'][$section['id']] = $section;
	}

	/**
	 * Adds a field to an instance
	 */
	public static function add_field( $instance_id = '', $field = array() ) {
		self::$instances[$instance_id] = ( isset( self::$instances[$instance_id] ) ) ? self::$instances[$instance_id] : array();
		self::$instances[$instance_id]['fields'][$field['settings']] = $field;
	}

	/**
	 * Constructor is private, should only be called by get_instance()
	 */
	private function __construct( $instance = null ) {
	}

}

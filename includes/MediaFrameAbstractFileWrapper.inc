<?php
abstract class MediaFrameAbstractFileWrapper {
	protected $element;
	protected $attributes;
	protected $cssStyle;

	public function __construct($element, $attributes) {
		$this->element = $element;
		$this->attributes = $attributes;

		$this->cssStyle = MediaFrameAbstractFileWrapper::parseCss($this->getCssStyleText());
		$this->normalizeCssStyle();
	}

	public static function getWrapper($element, $attributes) {
		if (isset($element['#file'])) {
			// WYSIWYG -> $file is an Object
			return new MediaFrameFileObjectWrapper($element, $attributes);
		}
		if (isset($element['#item'])) {
			// Image field -> $file is an Array
			return new MediaFrameFileArrayWrapper($element, $attributes);
		}
		return NULL;
	}

	/**
	 * Get a field value(s), in the most appropriate language.
	 * This method should seriously be defined in Drupal.
	 * It's a lot of code to do something very common.
	 */
	public static function getArrayValues($objArray, $fieldName) {
		// Interface language (usually 'en');
		//     http://api.drupal.org/api/drupal/developer%21globals.php/global/language/7
		global $language;

		// Get a valid langcode from the language object.
		$langcode = field_valid_language($language->language, FALSE);

		if ($objArray !== NULL && isset($objArray[$fieldName])) {
			$valueArray = $objArray[$fieldName];

			// Get the more appropriate language for the current value:
			//     First, try to get it in the interface language ('en').
			//     If not available, get default language ('und').
			//     This is basically what "field_language" does.
			//         http://api.drupal.org/api/drupal/modules%21field%21field.multilingual.inc/function/field_language/7
			//     NOTE: "field_language" can not be used here since
			//         file_entity do not define a usable entity object.
			$lang = isset($valueArray[$langcode]) ? $langcode : LANGUAGE_NONE;

			if (isset($valueArray[$lang]) && is_array($valueArray[$lang])) {

				$values = array();
				foreach ($valueArray[$lang] as $value) {
					if (isset($value['value']) &&
							$value['value'] !== NULL &&
							$value['value'] !== '') {
						array_push($values, $value['value']);
					} else if (isset($value['safe_value']) &&
							$value['safe_value'] !== NULL &&
							$value['safe_value'] !== '') {
						array_push($values, $value['safe_value']);
					}
				}
				if (!empty($values)) {
					return $values;
				}
			}
		}

		return NULL;
	}
	public static function getArrayValue($objArray, $fieldName, $defaultValue = NULL) {
		$values = MediaFrameAbstractFileWrapper::getArrayValues($objArray, $fieldName);
		if ($values !== NULL && $values[0]) {
			return $values[0];
		}
		return $defaultValue;
	}

	public static function getArrayAttributeValues($objArray, $fieldName, $attribute) {
		// Interface language (usually 'en');
		//     http://api.drupal.org/api/drupal/developer%21globals.php/global/language/7
		global $language;

		// Get a valid langcode from the language object.
		$langcode = field_valid_language($language->language, FALSE);

		if ($objArray !== NULL && isset($objArray[$fieldName])) {
			$valueArray = $objArray[$fieldName];

			// Get the more appropriate language for the current value:
			//     First, try to get it in the interface language ('en').
			//     If not available, get default language ('und').
			//     This is basically what "field_language" does.
			//         http://api.drupal.org/api/drupal/modules%21field%21field.multilingual.inc/function/field_language/7
			//     NOTE: "field_language" can not be used here since
			//         file_entity do not define a usable entity object.
			$lang = isset($valueArray[$langcode]) ? $langcode : LANGUAGE_NONE;

			if (isset($valueArray[$lang]) && is_array($valueArray[$lang])) {

				$values = array();
				foreach ($valueArray[$lang] as $value) {
					if (isset($value[$attribute]) &&
							$value[$attribute] !== NULL &&
							$value[$attribute] !== '') {
						array_push($values, $value[$attribute]);
					}
				}
				if (!empty($values)) {
					return $values;
				}
			}
		}

		return NULL;
	}
	public static function getArrayAttributeValue($objArray, $fieldName, $attribute, $defaultValue = NULL) {
		$values = MediaFrameAbstractFileWrapper::getArrayAttributeValues($objArray, $fieldName, $attribute);
		if ($values !== NULL && $values[0]) {
			return $values[0];
		}
		return $defaultValue;
	}

	/**
	 * Retrieve pseudo-fields value(s) from the file.
	 * NOTE: The proper way to do this would be to use a
	 *     entity_metadata_wrapper. For some reason, this
	 *     function do not work with "file" entities.
	 *     The only solution left is to use the field_get_items.
	 */
	public static function getFileObjectValues($file, $fieldName) {
		$valueArray = field_get_items('file', $file, $fieldName);
		if ($valueArray !== NULL && is_array($valueArray)) {

			$values = array();
			foreach ($valueArray as $value) {
				if (isset($value['value']) &&
						$value['value'] !== NULL &&
						$value['value'] !== '') {
					array_push($values, $value['value']);
				} else if (isset($value['safe_value']) &&
						$value['safe_value'] !== NULL &&
						$value['safe_value'] !== '') {
					array_push($values, $value['safe_value']);
				}
			}
			if (!empty($values)) {
				return $values;
			}
		}
		return NULL;
	}
	public static function getFileObjectValue($file, $fieldName, $defaultValue = NULL) {
		$values = MediaFrameAbstractFileWrapper::getFileObjectValues($file, $fieldName);
		if ($values !== NULL && $values[0]) {
			return $values[0];
		}
		return $defaultValue;
	}

	public static function getFileObjectAttributeValues($file, $fieldName, $attribute) {
		$valueArray = field_get_items('file', $file, $fieldName);
		if ($valueArray !== NULL && is_array($valueArray)) {

			$values = array();
			foreach ($valueArray as $value) {
				if (isset($value[$attribute]) &&
						$value[$attribute] !== NULL &&
						$value[$attribute] !== '') {
					array_push($values, $value[$attribute]);
				}
			}
			if (!empty($values)) {
				return $values;
			}
		}
		return NULL;
	}
	public static function getFileObjectAttributeValue($file, $fieldName, $attribute, $defaultValue = NULL) {
		$values = MediaFrameAbstractFileWrapper::getFileObjectAttributeValues($file, $fieldName, $attribute);
		if ($values !== NULL && $values[0]) {
			return $values[0];
		}
		return $defaultValue;
	}

	/**
	 * Parameter:
	 * $cssStyle: Css input containing one of the following:
	 *     string: A string containing the style.
	 *         Example: "width:10px;height:10px;"
	 *     hash map: key / value pairs containing the styles.
	 *         Example: { width: '10px', height: '10px' }
	 *     object containing a cssText attribute.
	 *         Example: { cssText: "width:10px;height:10px;" }
	 * Return
	 *     hash map: key / value pairs containing the styles.
	 *         Example: { width: '10px', height: '10px' }
	 */
	private static function parseCss($cssStyle) {
		if (!$cssStyle) {
			return array();
		}

		$cssStyleMap = $cssStyle;
		if (!is_string($cssStyle) && isset($cssStyle['cssText'])) {
			$cssStyle = $cssStyle['cssText'];
		}
		if (is_string($cssStyle)) {
			$cssStyleMap = array();
			$cssStyleParts = explode(';', $cssStyle);
			foreach($cssStyleParts as $cssStylePart) {
				$cssStylePart = trim($cssStylePart);
				if (strlen($cssStylePart) > 0) {
					$sepPos = strpos($cssStylePart, ':');
					$key = trim(substr($cssStylePart, 0, $sepPos));
					$value = trim(substr($cssStylePart, $sepPos+1));

					if (strlen($key) > 0 && strlen($value) > 0) {
						$cssStyleMap[$key] = $value;
					}
				}
			}
		}
		return $cssStyleMap;
	}

	public function getCssStyle() {
		return $this->cssStyle;
	}

	public function showMetadata() {
		return isset($this->attributes['showMetadata']) ? !!$this->attributes['showMetadata'] : TRUE;
	}

	public function getStyleName() {
		if (isset($this->element['#view_mode'])) {
			return $this->element['#view_mode'];
		}
		if (isset($this->element['#style_name'])) {
			return $this->element['#style_name'];
		}
		if (isset($this->element['#image_style'])) {
			return $this->element['#image_style'];
		}
		return NULL;
	}

	abstract public function getFid();
	abstract public function getType();
	abstract public function getUri();
	abstract public function getUrl();
	abstract public function getTitle();
	abstract public function getPreview();
	abstract public function isDescriptionHidden();
	abstract public function isEnlargePrivate();
	abstract public function isLicenseHidden();
	abstract public function getDescriptionPrefix();
	abstract public function getDescription();
	// Return an array of node type "person"
	abstract public function getAttribution();
	abstract public function getCustomAttribution();
	abstract public function getLicense();
	abstract public function getCustomLicense();
	abstract public function getNotes();
	abstract public function getCssClass();
	abstract public function getAlt();

	abstract protected function getCssStyleText();
	abstract protected function getDefinedWidth();
	abstract protected function getDefinedHeight();

	private function normalizeCssStyle() {
		$dimensions = $this->getDimensions();

		if ($dimensions['width']) {
			$this->cssStyle['width'] = $dimensions['width'] . 'px';
		}
		if ($dimensions['height']) {
			$this->cssStyle['height'] = $dimensions['height'] . 'px';
		}
	}

	private function getDimensions() {
		// $element['#attributes'] is unreliable (sometime contains width / height, sometime style...)
		$dimensions = array(
			'width' => NULL,
			'height' => NULL
		);

		if (isset($this->element['#attributes'])) {
			// Usually the path taken by $file Object (WYSIWYG)
			if (isset($this->element['#attributes']['width'])) {
				$dimensions['width'] = intval($this->element['#attributes']['width']);
			}
			if (isset($this->element['#attributes']['height'])) {
				$dimensions['height'] = intval($this->element['#attributes']['height']);
			}
		}

		if (isset($this->cssStyle['width'])) {
			$dimensions['width'] = intval($this->cssStyle['width']);
		}

		if (isset($this->cssStyle['height'])) {
			$dimensions['height'] = intval($this->cssStyle['height']);
		}

		if (!$dimensions['width'] || !$dimensions['height']) {
			// Usually the path taken by $file Array (image field)

			// Find image dimensions for $imgStyleName
			// First, get the original image dimensions.
			$dimensions = array(
				'width' => $this->getDefinedWidth(),
				'height' => $this->getDefinedHeight()
			);
			// Sometime the $file do not contains it's dimensions (occur with node preview)
			if (!$dimensions['width'] || !$dimensions['height']) {
				// Ask Drupal to calculate the image size
				//     http://api.drupal.org/api/drupal/includes%21image.inc/function/image_get_info/7
				$dimensions = image_get_info($this->getUri());
			}

			// Then, transform those dimensions using the algo for the image style.
			// (Drupal API)
			if ($dimensions) {
				image_style_transform_dimensions($this->getStyleName(), $dimensions);
			}
			// Finally, retrieve the calculated dimensions.
		}

		return $dimensions;
	}

}
?>

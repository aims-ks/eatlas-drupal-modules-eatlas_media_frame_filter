<?php
class MediaFrameFileArrayWrapper extends MediaFrameAbstractFileWrapper {
	private $fileArray;

	public function __construct($element, $attributes) {
		$this->fileArray = $element['#item'];
		parent::__construct($element, $attributes);
	}

	public function getFid() {
		return isset($this->fileArray['fid']) ? $this->fileArray['fid'] : NULL;
	}

	public function getType() {
		return isset($this->fileArray['type']) ? $this->fileArray['type'] : NULL;
	}

	public function getUri() {
		return isset($this->fileArray['uri']) ? $this->fileArray['uri'] : NULL;
	}

	public function getUrl() {
		return isset($this->fileArray['url']) ? $this->fileArray['url'] : NULL;
	}

	public function getTitle() {
		return MediaFrameAbstractFileWrapper::getArrayValue($this->fileArray, 'media_title', NULL);
	}

	public function getPreview() {
		return NULL; // TODO
	}

	public function isDescriptionHidden() {
		return !!MediaFrameAbstractFileWrapper::getArrayValue($this->fileArray, 'media_hidedesc', FALSE);
	}

	public function isLicenseHidden() {
		return !!MediaFrameAbstractFileWrapper::getArrayValue($this->fileArray, 'media_hidelicense', FALSE);
	}

	public function getDescriptionPrefix() {
		return MediaFrameAbstractFileWrapper::getArrayValue($this->fileArray, 'media_descprefix', NULL);
	}

	public function getDescription() {
		$description = NULL;

		if (isset($this->attributes['media_description'])) {
			// The HTML is encoded in the wiki string
			$description = htmlspecialchars_decode($this->attributes['media_description'], ENT_QUOTES);
		}
		if (!$description) {
			$longDescription = MediaFrameAbstractFileWrapper::getArrayValue($this->fileArray, 'media_description', NULL);
			$description = MediaFrameAbstractFileWrapper::getArrayValue($this->fileArray, 'field_short_description', NULL);
			$description = $description ? $description : $longDescription;
		}

		$description = trim($description);
		if (strncmp($description, '<', 1)) {
			$description = '<p>'.$description.'</p>';
		}
		return $description;
	}

	public function getAttribution() {
		$attributionNids = MediaFrameAbstractFileWrapper::getArrayAttributeValues($this->fileArray, 'field_attribution', 'nid');
		return node_load_multiple($attributionNids);
	}

	public function getCustomAttribution() {
		return MediaFrameAbstractFileWrapper::getArrayAttributeValue($this->fileArray, 'field_custom_attribution', 'value', NULL);
	}

	public function getLicense() {
		return MediaFrameAbstractFileWrapper::getArrayValue($this->fileArray, 'field_license', NULL);
	}

	public function getCustomLicense() {
		return MediaFrameAbstractFileWrapper::getArrayValue($this->fileArray, 'field_custom_license', NULL);
	}

	public function getNotes() {
		return MediaFrameAbstractFileWrapper::getArrayValue($this->fileArray, 'field_notes', NULL);
	}

	public function isEnlargePrivate() {
		return MediaFrameAbstractFileWrapper::getArrayValue($this->fileArray, 'field_restricted_access', FALSE);
	}

	public function getStyleName() {
		return isset($this->attributes['styleName']) && $this->attributes['styleName'] ? $this->attributes['styleName'] : parent::getStyleName();
	}

	public function getCssClass() {
		return NULL;
	}

	public function getAlt() {
		return NULL; // TODO Use the same as normal image
	}

	protected function getCssStyleText() {
		return isset($this->attributes['media_cssstyle']) && $this->attributes['media_cssstyle'] ? $this->attributes['media_cssstyle'] : NULL;
	}

	protected function getDefinedWidth() {
		return isset($this->fileArray['width']) ? $this->fileArray['width'] : NULL;
	}

	protected function getDefinedHeight() {
		return isset($this->fileArray['height']) ? $this->fileArray['height'] : NULL;
	}

	public function showMetadata() {
		return isset($this->fileArray['showMetadata']) ?  $this->fileArray['showMetadata'] : parent::showMetadata();
	}
}
?>

<?php
class MediaFrameFileObjectWrapper extends MediaFrameAbstractFileWrapper {
	private $fileObject;

	public function __construct($element, $attributes) {
		$this->fileObject = $element['#file'];
		parent::__construct($element, $attributes);
	}

	public function getFid() {
		return isset($this->fileObject->fid) ? $this->fileObject->fid : NULL;
	}

	public function getType() {
		return isset($this->fileObject->type) ? $this->fileObject->type : NULL;
	}

	public function getUri() {
		return isset($this->fileObject->uri) ? $this->fileObject->uri : NULL;
	}

	public function getUrl() {
		return isset($this->fileObject->url) ? $this->fileObject->url : NULL;
	}

	public function getTitle() {
		$title = NULL;
		if (isset($this->attributes['media_title'])) {
			// The HTML is encoded in the wiki string
			$title = htmlspecialchars_decode($this->attributes['media_title'], ENT_QUOTES);
		}
		if (!$title) {
			$title = MediaFrameAbstractFileWrapper::getFileObjectValue($this->fileObject, 'media_title', NULL);
		}
		return $title;
	}

	public function getPreview() {
		$previews = field_get_items('file', $this->fileObject, 'field_preview');
		return $previews[0];
	}

	public function isDescriptionHidden() {
		return isset($this->attributes['media_hidedesc']) && $this->attributes['media_hidedesc'];
	}

	public function isLicenseHidden() {
		return isset($this->attributes['media_hidelicense']) && $this->attributes['media_hidelicense'];
	}

	public function getDescriptionPrefix() {
		return isset($this->attributes['media_descprefix']) ? htmlspecialchars_decode($this->attributes['media_descprefix'], ENT_QUOTES) : NULL;
	}

	public function getDescription() {
		$description = NULL;
		if (isset($this->attributes['media_description'])) {
			// The HTML is encoded in the wiki string
			$description = htmlspecialchars_decode($this->attributes['media_description'], ENT_QUOTES);
		}
		if (!$description) {
			$longDescription = MediaFrameAbstractFileWrapper::getFileObjectValue($this->fileObject, 'media_description', NULL);
			$description = MediaFrameAbstractFileWrapper::getFileObjectValue($this->fileObject, 'field_short_description', NULL);
			$description = $description ? $description : $longDescription;
		}

		$description = trim($description);
		if (strncmp($description, '<', 1)) {
			$description = '<p>'.$description.'</p>';
		}
		return $description;
	}

	public function getAttribution() {
		$attributionNids = MediaFrameAbstractFileWrapper::getFileObjectAttributeValues($this->fileObject, 'field_attribution', 'nid');
		return node_load_multiple($attributionNids);
	}

	public function getCustomAttribution() {
		return MediaFrameAbstractFileWrapper::getFileObjectAttributeValue($this->fileObject, 'field_custom_attribution', 'value', NULL);
	}

	public function getLicense() {
		return MediaFrameAbstractFileWrapper::getFileObjectValue($this->fileObject, 'field_license', NULL);
	}

	public function getCustomLicense() {
		return MediaFrameAbstractFileWrapper::getFileObjectValue($this->fileObject, 'field_custom_license', NULL);
	}

	public function getNotes() {
		return MediaFrameAbstractFileWrapper::getFileObjectValue($this->fileObject, 'field_notes', NULL);
	}

	public function isEnlargePrivate() {
		return MediaFrameAbstractFileWrapper::getFileObjectValue($this->fileObject, 'field_restricted_access', FALSE);
	}

	public function getStyleName() {
		return isset($this->attributes['styleName']) && $this->attributes['styleName'] ? $this->attributes['styleName'] : parent::getStyleName();
	}

	public function getCssClass() {
		return (isset($this->fileObject->override['class']) && $this->fileObject->override['class'] ? $this->fileObject->override['class'] : NULL);
	}

	public function getAlt() {
		return (isset($this->fileObject->override['alt']) && $this->fileObject->override['alt'] ? $this->fileObject->override['alt'] : NULL); // TODO Use the same as normal image
	}

	protected function getCssStyleText() {
		return isset($this->attributes['media_cssstyle']) && $this->attributes['media_cssstyle'] ? $this->attributes['media_cssstyle'] :
				(isset($this->fileObject->override['style']) && $this->fileObject->override['style'] ? $this->fileObject->override['style'] : NULL);
	}

	protected function getDefinedWidth() {
		return property_exists($this->fileObject, 'width') ? $this->fileObject->width : 0;
	}

	protected function getDefinedHeight() {
		return property_exists($this->fileObject, 'height') ? $this->fileObject->height : 0;
	}

	public function showMetadata() {
		return property_exists($this->fileObject, 'showMetadata') ? $this->fileObject->showMetadata : parent::showMetadata();
	}
}
?>

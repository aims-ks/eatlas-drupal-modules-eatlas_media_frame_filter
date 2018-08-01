/**
 * Add a media tab to the image properties dialog.
 *
 * This process as to be executed in a precise time frame;
 *     After CKEditor is loaded, but before it's executed.
 * 
 * It tooks me some time to find out a stable way to define this.
 * There is how I understand the loading process:
 *
 * Drupal Page:
 *     * Drupal Module A JS
 *     * Drupal Module B JS
 *     * ...
 *     * Drupal Module eatlas_media_frame_filter JS (CKEditor do not exists yet)
 *     * ...
 *     * Drupal Module N JS
 *     (some inconsistant loading delay)
 *     * CKEditor is created (*)
 *
 * (*) Wysiwyg JS (the javascript related to the wysiwyg module, the one
 *     that trigger the loading of CKEditor) is inserted somewhere in this
 *     process, maybe before, maybe after eatlas_media_frame_filter JS, so I
 *     can't rely on the existance of that module. I suppose the module
 *     dependencies defined in eatlas_media_frame_filter info file help to
 *     define the loading order, but this is not THE issue we are dealing
 *     with.
 *     Wysiwyg PHP module read the config and determine that the page will
 *     need CKEditor, so it add CKEditor to the page. At this point, maybe
 *     CKEditor is executed, maybe not, but at lease the variable CKEditor
 *     exists so I can listen to the instanceReady event.
 * 
 * Since my JS as already been load, I have to defer it's execution to be
 * able to listen to CKEditor events (I can't listen to those events
 * before the CKEditor variable has been created). Defering it after the
 * page load seems to be enough to push it's execution after CKEditor get
 * created, changing the workflow to:
 *
 * Page:
 *     * Module A JS
 *     * Module B JS
 *     * ...
 *     * eatlas_media_frame_filter JS loaded but execution defered
 *     * ...
 *     * Module N JS
 *     (some inconsistant loading delay)
 *     * CKEditor is loaded, but maybe not executed yet (that's why I listen to instanceReady)
 *     (page load event is fired)
 *     * eatlas_media_frame_filter JS is executed
 *
 * Pseudo code:
 * when all JS are in place (page load event):
 *     if CKEditor exists:
 *         When 'instanceReady' event is called:
 *             Add media tab to CKEditor's image properties dialog
 *     else
 *         Assume that the page do not have an instance of CKEditor => nothing to do.
 */

/**
 * Waiting for the page load event to execute the script.
 * Using JQuery to enforce compatibilities across browsers JS API.
 * NOTE: This script use variables from Drupal, passed to JavaScript by
 *     the variable Drupal.settings.eatlas_media_frame_filter.drupal_custom_image_styles
 *     defined in eatlas_media_frame_filter.module.
 */
(function ($) {
	$(document).ready(function(){
		if (typeof(CKEDITOR) !== 'undefined') {
			// Example: http://docs.cksource.com/CKEditor_3.x/Developers_Guide/Dialog_Customization
			// API: http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dialog.definitionObject.html
			CKEDITOR.on('dialogDefinition', function(ev) {
				// Take the dialog name and its definition from the event data.
				var dialogName = ev.data.name;
				var dialogDefinition = ev.data.definition;

				if (dialogName == 'image') {
					dialogDefinition.addContents(
						_eatlas_media_frame_ckeditor_create_media_tab(), // Tab Definition
						'Link' // Next element
					);
				}
			});
		}
	});

	/**
	 * Return the definition of the media tab.
	 * See - ckeditor/plugins/image/dialogs/image.js
	 */
	function _eatlas_media_frame_ckeditor_create_media_tab() {
		// As defined in imageDialog function
		var IMAGE = 1,
			LINK = 2,
			PREVIEW = 4,
			CLEANUP = 8;

		var IMAGESTYLE_CLASS_PREFIX = 'img__view_mode__';
		var IMAGEID_CLASS_PREFIX = 'img__fid__';

		var onMediaStyleChange = function() {
			// This = input element.
			var value = this.getValue(),
				dialog = this.getDialog();
			var enable = value && value != 'enlarge';
			toggleInput(dialog, 'chkHideDesc', enable);
			toggleInput(dialog, 'chkHideLicense', enable);
			toggleInput(dialog, 'txtMediaTitle', enable);
			toggleInput(dialog, 'txtMediaDescPrefix', enable);
			toggleInput(dialog, 'txtMediaDescription', enable);
		};

		var onImageStyleChange = function() {
			var newMediaStyle = this.getValue(),
				dialog = this.getDialog();

			if (!newMediaStyle) {
				newMediaStyle = 'media_original'
			}

			// The media styles are inconsistent with image styles. It's okay
			// with most of them, but a mapping has to be done for the
			// 'hardcoded' one.
			var newImageStyle = newMediaStyle;
			if (newImageStyle === 'media_preview') {
				newImageStyle = 'square_thumbnail';
			} else if (newImageStyle === 'media_large') {
				newImageStyle = 'large';
			} else if (newImageStyle === 'media_original') {
				newImageStyle = '';
			}

			// API http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dialog.html
			//
			// pageId: 'info', 'media', 'Link', 'Upload', 'advanced'
			// elementId:
			//     info:
			//         'txtUrl' (cke_75_uiElement),
			//         'browse' (cke_77_uiElement) (disabled 'Browse Server' button to the right of URL field),
			//         'txtAlt' (cke_82_uiElement),
			//         'txtWidth' (cke_85_uiElement),
			//         'txtHeight' (cke_88_uiElement),
			//         undefined (cke_89_uiElement) (container for Width and Height),
			//         'ratioLock' (cke_90_uiElement) (both lock and reset),
			//         'txtBorder' (cke_94_uiElement),
			//         'txtHSpace' (cke_97_uiElement),
			//         'txtVSpace' (cke_100_uiElement),
			//         'cmbAlign' (cke_103_uiElement),
			//         'basic' (cke_105_uiElement) (container for Width, Height, Border, HSpace, VSpace and Alignment),
			//         'htmlPreview' (cke_106_uiElement)
			//     media:
			//         'lstImageStyle' (cke_113_uiElement),
			//         'lstMediaStyle' (cke_116_uiElement),
			//         'lstMediaLink' (...),
			//         'txtMediaTitle' (...),
			//         'txtMediaDescPrefix' (...),
			//         'txtMediaDescription' (cke_119_uiElement),
			//         undefined (cke_120_uiElement) (metadata info),
			//     Link:
			//         'txtUrl' (cke_125_uiElement),
			//         'browse' (cke_127_uiElement) (disabled 'Browse Server' button to the right of URL field),
			//         'cmbTarget' (cke_130_uiElement)
			//     Upload:
			//         'upload' (cke_135_uiElement),
			//         'uploadButton' (cke_137_uiElement)
			//     advanced:
			//         'linkId' (cke_142_uiElement),
			//         'cmbLangDir' (cke_145_uiElement),
			//         'txtLangCode' (cke_148_uiElement),
			//         'txtGenLongDescr' (cke_152_uiElement),
			//         'txtGenClass' (cke_155_uiElement),
			//         'txtGenTitle' (cke_158_uiElement),
			//         undefined (cke_159_uiElement) (container for Stylesheet Classes and Advisory Title),
			//         'txtdlgGenStyle' (cke_162_uiElement)
			//
			// Snipet to display the mapping DOM ID => CKEditor element ID:
			//     dialog.foreach(function(el) {
			//         console.log('DOM ID: ' + el.domId + '    ID: ' + el.id);
			//     });

			// *** CSS Classes ***

			// Get actual image CSS Classes, as defined in the dialog field
			// API: dialog.getValueOf(pageId, elementId);
			var classes = dialog.getValueOf('advanced', 'txtGenClass');
			classes = classes ? classes.split(/\s+/) : [];

			// Remove previous 'image style' class and find the image ID
			var newClasses = [];
			for (var i=0, len=classes.length; i<len; i++) {
				if (classes[i].substring(0, IMAGESTYLE_CLASS_PREFIX.length) !== IMAGESTYLE_CLASS_PREFIX) {
					newClasses.push(classes[i]);
				}
			}

			// Add new 'image style' class
			newClasses.push(IMAGESTYLE_CLASS_PREFIX + newMediaStyle);

			// Set the new image CSS Classes in the dialog field
			// API: dialog.setValueOf(pageId, elementId, value);
			dialog.setValueOf('advanced', 'txtGenClass', newClasses.join(' '));

			// *** Image URL ***

			// Async request to the file URL service (only works when logged)
			// IMPORTANT: The Drupal API must be used to get the image URL
			//     because it need to add the "itok" token to the URL.
			//     That token has been added to avoid an easy DDoS.
			//     See: http://berk.es/2013/03/04/drupal-imagecache-security-vulnarability-with-ddos-attack-explained/
			if (typeof this.fid !== 'undefined') {
				$.getJSON("/eatlas_mediaframe_fileurl/" + this.fid + "/" + newImageStyle, function(json){ 
					if (typeof json.url !== 'undefined') {
						// Set the new image URL in the dialog field
						var currentUrl = dialog.getValueOf('info', 'txtUrl');
						if (currentUrl != json.url) {
							dialog.setValueOf('info', 'txtUrl', json.url);
						}
					}
				});
			}
		};

		var getImageStyle = function(element) {
			var classes = element.getAttribute('class');
			if (!classes) {
				return null;
			}
			classes = classes.split(/\s+/);
			for (var i=0, len=classes.length; i < len; i++) {
				if (classes[i].substring(0, IMAGESTYLE_CLASS_PREFIX.length) === IMAGESTYLE_CLASS_PREFIX) {
					return classes[i].substring(IMAGESTYLE_CLASS_PREFIX.length);
				}
			}
		};

		var getMediaFileId = function(element) {
			var classes = element.getAttribute('class');
			if (!classes) {
				return null;
			}
			classes = classes.split(/\s+/);
			for (var i=0, len=classes.length; i < len; i++) {
				if (classes[i].substring(0, IMAGEID_CLASS_PREFIX.length) === IMAGEID_CLASS_PREFIX) {
					return classes[i].substring(IMAGEID_CLASS_PREFIX.length);
				}
			}
		};

		var toggleInput = function(dialog, inputID, active) {
			var inputEl = dialog.getContentElement('media', inputID).getInputElement();
			if (active) {
				inputEl.removeAttribute('readonly');
				inputEl.removeClass('disabled');
			} else {
				inputEl.setAttribute('readonly', true);
				inputEl.addClass('disabled');
			}
		};

		var imageStyles = [
			['Original', 'media_original'],
			['Link', 'media_link'],
			['Preview', 'media_preview'],
			['Large', 'media_large']
		];

		// NOTE: Drupal.settings.eatlas_media_frame_filter.drupal_custom_image_styles is defined in eatlas_media_frame_filter.module
		if (typeof Drupal.settings.eatlas_media_frame_filter === 'object' && typeof Drupal.settings.eatlas_media_frame_filter.drupal_custom_image_styles === 'object') {
			var customStyles = Drupal.settings.eatlas_media_frame_filter.drupal_custom_image_styles;
			for (customStyleId in customStyles) {
				if (customStyles.hasOwnProperty(customStyleId)) {
					imageStyles.push([customStyles[customStyleId], customStyleId]);
				}
			}
		}

		// CKEditor API: http://docs.ckeditor.com/#!/api/CKEDITOR.dialog.definition.checkbox
		return {
			id: 'media',
			label: 'Frame info',
			padding: 0,
			elements: [
				{
					id: 'lstImageStyle',
					type: 'select',
					label: 'Image style',
					// NOTE: This CSS class hide the field when it's disabled.
					className: 'eatlas-media-frame-filter-image-style-select',
					items: imageStyles,
					onChange: onImageStyleChange,
					setup: function(type, element) {
						// element => CKEDITOR.dom.element
						if (type == IMAGE) {
							var currentImageStyle = getImageStyle(element);
							this.fid = getMediaFileId(element);
							this.setValue(currentImageStyle);
							// Disable the field when it's set to "Original"
							//   We don't want users to be able to choose something else
							//   but still give the ability to fix broken images.
							if (currentImageStyle === 'media_original') {
								this.disable();
							}
						}
					},
					commit: function(type, element) {}
				}, {
					// API: http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dialog.definition.select.html
					id: 'lstMediaStyle',
					type: 'select',
					label: 'Frame style',
					items: [
						['- No frame -', ''],
						['Wikipedia style', 'wikipedia'],
						['Info on image', 'onImage'],
						['Tile', 'tile']
					],
					'default': '', // The default must match the default in "eatlas_media_frame_filter.module"
					onChange: onMediaStyleChange,
					setup: function(type, element) {
						// element => CKEDITOR.dom.element
						if (type == IMAGE) {
							// noframe, with default true
							var frameStyle = element.getAttribute('media_style');
							if (frameStyle !== null) {
								this.setValue(frameStyle);
							}
						}
					},
					commit: function(type, element) {
						// element => CKEDITOR.dom.element
						if (type == IMAGE) {
							var frameStyle = this.getValue();
							element.setAttribute('media_style', frameStyle);
						}
					}
				}, {
					// API: http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dialog.definition.select.html
					id: 'lstMediaLink',
					type: 'select',
					label: 'Link to media page',
					items: [
						['- No link to media page -', 'none'],
						['Magnifier', 'magnifier'],
						['Image linked to media page', 'direct']
					],
					'default': 'none',
					setup: function(type, element) {
						// element => CKEDITOR.dom.element
						if (type == IMAGE) {
							// noframe, with default true
							var mediaLinkStyle = element.getAttribute('media_link');
							if (mediaLinkStyle !== null) {
								this.setValue(mediaLinkStyle);
							}
						}
					},
					commit: function(type, element) {
						// element => CKEDITOR.dom.element
						if (type == IMAGE) {
							var mediaLinkStyle = this.getValue();
							element.setAttribute('media_link', mediaLinkStyle);
						}
					}
				}, {
					id: 'chkHideDesc',
					type: 'checkbox',
					label: 'Hide description',
					readonly: true,
					setup: function(type, element) {
						if (type == IMAGE) {
							var hidedesc = element.getAttribute('media_hidedesc');
							if (hidedesc) {
								this.setValue(true);
							}
						}
					},
					commit: function(type, element) {
						if (type == IMAGE) {
							var hidedesc = this.getValue();
							if (hidedesc) {
								element.setAttribute('media_hidedesc', true);
							} else {
								element.removeAttribute('media_hidedesc');
							}
						}
					}
				}, {
					id: 'chkHideLicense',
					type: 'checkbox',
					label: 'Hide license',
					readonly: true,
					setup: function(type, element) {
						if (type == IMAGE) {
							var hidelicense = element.getAttribute('media_hidelicense');
							if (hidelicense) {
								this.setValue(true);
							}
						}
					},
					commit: function(type, element) {
						if (type == IMAGE) {
							var hidelicense = this.getValue();
							if (hidelicense) {
								element.setAttribute('media_hidelicense', true);
							} else {
								element.removeAttribute('media_hidelicense');
							}
						}
					}
				}, {
					id: 'txtMediaTitle',
					type: 'text',
					label: 'Title overwrite',
					style: 'width: 100%',
					'default': '',
					readonly: true,
					setup: function(type, element) {
						if (type == IMAGE) {
							var title = _decode(element.getAttribute('media_title'));
							if (title) {
								this.setValue(title);
							}
						}
					},
					commit: function(type, element) {
						if (type == IMAGE) {
							var title = _encode(this.getValue());
							if (title) {
								element.setAttribute('media_title', title);
							} else {
								element.removeAttribute('media_title');
							}
						}
					}
				}, {
					id: 'txtMediaDescPrefix',
					type: 'text',
					label: 'Description prefix',
					style: 'width: 100%',
					'default': '',
					readonly: true,
					setup: function(type, element) {
						if (type == IMAGE) {
							var prefix = _decode(element.getAttribute('media_descprefix'));
							if (prefix) {
								this.setValue(prefix);
							}
						}
					},
					commit: function(type, element) {
						if (type == IMAGE) {
							var prefix = _encode(this.getValue());
							if (prefix) {
								element.setAttribute('media_descprefix', prefix);
							} else {
								element.removeAttribute('media_descprefix');
							}
						}
					}
				}, {
					id: 'txtMediaDescription',
					type: 'textarea',
					label: 'Description overwrite',
					style: 'width: 100%',
					'default': '',
					readonly: true,
					setup: function(type, element) {
						if (type == IMAGE) {
							var description = _decode(element.getAttribute('media_description'));
							if (description) {
								this.setValue(description);
							}
						}
					},
					commit: function( type, element ) {
						if (type == IMAGE) {
							var description = _encode(this.getValue());
							if (description) {
								element.setAttribute('media_description', description);
							} else {
								element.removeAttribute('media_description');
							}
						}
					}
				}, {
					type: 'html',
					html: '<div role="presentation">' +
								'<label>Metadata</label>' +
								'<div id="eatlas_media_frame_info"><span class="loading">Loading...</span></div>' +
							'</div>',
					setup: function(type, element) {
						// element => CKEDITOR.dom.element
						if (type == IMAGE) {
							var domElement = document.getElementById('eatlas_media_frame_info');
							var fid = _eatlas_media_frame_ckeditor_get_fid(element);
							if (fid !== null) {
								domElement.innerHTML = '<iframe class="iframe-mediaframe-fileinfo" src="/?q=eatlas_mediaframe_fileinfo/' + fid + '"/>';
							} else {
								domElement.innerHTML = '<span class="noinfo">No information available</span>';
							}
						}
					}
				}
			]
		};

		function _encode(htmlStr) {
			// Create a in-memory div, set it's inner text (which jQuery automatically encodes)
			// then grab the encoded contents back out. The div never exists on the page.
			return $('<div/>').text(htmlStr).html();
		}
		function _decode(str) {
			return $('<div/>').html(str).text();
		}

		/**
		 * element: CKEDITOR.dom.element
		 * The file ID is store in the class of the element:
		 *     class="... img__fid__12 ...";
		 */
		function _eatlas_media_frame_ckeditor_get_fid(element) {
			var classesStr = element.getAttribute('class');
			var fidClassPrefix = 'img__fid__';
			if (classesStr) {
				var classes = classesStr.split(" ");
				var _class = null;
				for (var i=0, len=classes.length; i<len; i++) {
					_class = classes[i];
					if (_class && _class.indexOf(fidClassPrefix) === 0) {
						return parseInt(_class.substring(fidClassPrefix.length));
					}
				}
			}

			return null;
		}

	}
})(jQuery);

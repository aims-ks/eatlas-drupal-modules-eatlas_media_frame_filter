(function ($) {
	$(document).ready(function(){
		if (typeof(Drupal) !== 'undefined' &&
				typeof(Drupal.wysiwyg) !== 'undefined' &&
				typeof(Drupal.wysiwyg.plugins) !== 'undefined' &&
				typeof(Drupal.wysiwyg.plugins.media) !== 'undefined') {



			/**
			 * Attach function, called when a rich text editor loads.
			 * This finds all [[tags]] and replaces them with the html
			 * that needs to show in the editor.
			 *
			 * Modified copy of: media/js/wysiwyg-media.js - attach()
			 *
			 * The modification add the media attributes (attributes
			 * that starts with 'media_') from the JSON string (wiki
			 * format created by the media module) to the image object
			 * (CKEDITOR.dom.element).
			 */
			Drupal.wysiwyg.plugins.media.attach = function (content, settings, instanceId) {
				var matches = content.match(/\[\[.*?\]\]/g);
				this.initializeTagMap();
				var tagmap = Drupal.settings.tagmap;
				if (matches) {
					var inlineTag = "";
					for (i = 0; i < matches.length; i++) {
						inlineTag = matches[i];
						if (tagmap[inlineTag]) {
							// This probably needs some work...
							// We need to somehow get the fid propogated here.
							// We really want to
							var tagContent = tagmap[inlineTag];
							var mediaMarkup = this.stripDivs(tagContent); // THis is <div>..<img>

							var _tag = inlineTag;
							_tag = _tag.replace('[[','');
							_tag = _tag.replace(']]','');
							try {
								mediaObj = JSON.parse(_tag);
							}
							catch(err) {
								mediaObj = null;
							}
							if(mediaObj) {
								var imgElement = $(mediaMarkup);
								this.addImageAttributes(imgElement, mediaObj.fid, mediaObj.view_mode);

								// ******************************
								// ********** ADDED *************
								for (var j=0, len=imgElement.length; j<len; j++) {
									for (attrName in mediaObj.attributes) {
										if (mediaObj.attributes.hasOwnProperty(attrName) &&
												attrName.indexOf('media_') === 0) {
											// API: http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dom.element.html
											imgElement[j].setAttribute(attrName, mediaObj.attributes[attrName]);
										}
									}
								}
								// ********** ADDED *************
								// ******************************

								var toInsert = this.outerHTML(imgElement);
								content = content.replace(inlineTag, toInsert);
							}
						}
						else {
							debug.debug("Could not find content for " + inlineTag);
						}
					}
				}
				return content;
			};

		}
	});
})(jQuery);

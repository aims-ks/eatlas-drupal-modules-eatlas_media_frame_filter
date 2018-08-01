<div class="tags <?php print $classes; ?>"<?php print $attributes; ?>>
	<?php if (!$label_hidden): ?>
		<div class="field-label"<?php print $title_attributes; ?>><?php print $label ?>:&nbsp;</div>
	<?php endif; ?>

	<?php foreach ($items as $delta => $item): ?>
		<?php if (isset($item['#file'])): ?>
			<figure class="field-item <?php print $delta % 2 ? 'odd' : 'even'; ?>"<?php print $item_attributes[$delta]; ?>>

				<?php
					$file = $item['#file'];

					$element = isset($item['file']) ? $item['file'] : $item;

					if (isset($item['#media_gallery_entity'])) {
						// The images are displayed differently in the Gallery
						// See media_gallery.theme.inc
						$gallery_id = $item['#media_gallery_entity']->nid;
						$media_id = $file->fid;
						$fileGalleryURL = url("media-gallery/detail/$gallery_id/$media_id");

						if (module_exists('eatlas_media_frame_filter')) {
							print eatlas_media_frame_decorate(
								$element,
								array(
									'showMetadata' => false,
									'media_style' => 'gallery',
									'media_cssstyle' => 'float: left; margin: 0 0.5em 0.5em 0'
								),
								$fileGalleryURL
							);
						} else {
							// TODO Test
							print l(render($element), $fileGalleryURL, array('html' => TRUE));
						}
					} else {
						// Use with article preview image, for example
						if (module_exists('eatlas_media_frame_filter')) {
							print eatlas_media_frame_decorate(
								$element,
								array(
									'showMetadata' => false,
									'styleName' => 'medium',
									'media_style' => 'wikipedia'
								)
							);
						} else {
							// TODO Test
							print render($element);
						}
					}

					/*
					// Suggestion to print a linked image without the Media frame module

					$imageStyle = 'medium';
					$title = '';

					if (class_exists('MediaFrameAbstractFileWrapper')) {
						$title = MediaFrameAbstractFileWrapper::getFileObjectValue($file, 'media_title');
					}

					$image_conf = array(
						'style_name' => $imageStyle,
						'path' => image_style_url($imageStyle, $file->uri),
						'width' => '',
						'height' => '',
						'alt' => $title,
						'title' => $title
					);

					print '<a href="' . $fileGalleryURL . '" style="float: left; margin: 0 0.5em 0.5em 0">' . theme('image', $image_conf) . '</a>';
					*/
				?>

				<?php if (property_exists($item['#file'], 'title') && $item['#file']->title): ?>
					<figcaption><?php print $item['#file']->title; ?></figcaption>
				<?php endif; ?>
			</figure>
		<?php else: ?>
			<!-- Default behaviour -->
			<div class="field-item <?php print $delta % 2 ? 'odd' : 'even'; ?>"<?php print $item_attributes[$delta]; ?>><?php print render($item); ?></div>
		<?php endif; ?>
	<?php endforeach; ?>
</div>

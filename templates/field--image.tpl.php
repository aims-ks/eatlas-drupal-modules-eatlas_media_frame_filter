<?php
/*
$nodeUrl = NULL;
if (isset($element['#object'])) {
	// The 'object' might not be a node, but because every Drupal
	// instance is a stdClass, there is no easy way to verify...
	// Lets assume it's a node.
	$node = $element['#object'];
	$nodeUri = node_uri($node);       // Returns: {path => 'node/92'}
	$nodeUrl = url($nodeUri['path']); // Returns: '/?q=node/92'
}
*/
?>

<div class="<?php print $classes; ?>"<?php print $attributes; ?>>
	<?php if (!$label_hidden): ?>
		<h2 class="field-label"<?php print $title_attributes; ?>><?php print $label ?></h2>
	<?php endif; ?>
	<?php foreach ($items as $delta => $item): ?>
		<?php if (isset($item['#item'])): ?>
			<figure class="field-item <?php print $delta % 2 ? 'odd' : 'even'; ?>"<?php print $item_attributes[$delta]; ?>>
				<?php

				$element = isset($item['file']) ? $item['file'] : $item;

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
				?>

				<?php if ($item['#item']['title']): ?>
					<figcaption><?php print $item['#item']['title']; ?></figcaption>
				<?php endif; ?>
			</figure>
		<?php else: ?>
			<!-- Default behaviour -->
			<div class="field-item <?php print $delta % 2 ? 'odd' : 'even'; ?>"<?php print $item_attributes[$delta]; ?>><?php print render($item); ?></div>
		<?php endif; ?>
	<?php endforeach; ?>
</div>

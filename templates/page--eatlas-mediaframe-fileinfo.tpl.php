<?php
	$file = null;
	$fileNodeURL = null;

	$title = null;
	$shortDescription = null;
	$longDescription = null;

	if (isset($page['content']['system_main']['file'])) {
		$file = $page['content']['system_main']['file'];
		$fileNodeURL = url("media/" . $file->fid);

		$title = MediaFrameAbstractFileWrapper::getFileObjectValue($file, 'media_title', null);
		$longDescription = MediaFrameAbstractFileWrapper::getFileObjectValue($file, 'media_description', null);
		$shortDescription = MediaFrameAbstractFileWrapper::getFileObjectValue($file, 'field_short_description', null);
	}
?>

<?php if ($page['content']): ?>
	<article>
		<?php if ($file) { ?>
			<div class="description">
				<?php print _eatlas_media_frame_getLabeledAttribute('Title:', $title, true); ?>
				<?php print _eatlas_media_frame_getLabeledAttribute('Long description:', $longDescription, true); ?>
				<?php print _eatlas_media_frame_getLabeledAttribute('Short description:', $shortDescription, true); ?>
			</div>

			<?php if ($fileNodeURL) { ?>
				<div class="more">
					<p><a href="<?php print $fileNodeURL ?>" target="_blank">Metadata page</a></p>
				</div>
			<?php } ?>
		<?php } else { ?>
			<p class="noinfo">
				<em>No information available</em>
			</p>
		<?php } ?>
	</article>
<?php endif; ?>

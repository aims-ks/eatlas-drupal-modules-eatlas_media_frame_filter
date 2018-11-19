(function ($) {
	var initImageHoverListener = function(mediaframeTileImage) {
		var mediaframeTileImageCell = mediaframeTileImage.find('.image-cell');
		var mediaframeTileImageEl = mediaframeTileImageCell.find('img');

		if (mediaframeTileImageEl && mediaframeTileImageEl.attr('eatlas_media_frame_filter') !== 'ready') {
			// Find the image cell element and set its overflow to hidden,
			//   so the image won't increase the size of the frame element
			//   when it's zoomed in
			mediaframeTileImageCell.css('overflow', 'hidden');

			// Fix the cell dimensions to prevent it from changing when
			//   we zoom the image
			mediaframeTileImageCell.css('width', mediaframeTileImage.width());
			mediaframeTileImageCell.css('height', mediaframeTileImageEl.height());

			// Animate the image
			// - opacity,
			// - zoom (using width, the height is updated automatically),
			// - and center the image using negative margins
			mediaframeTileImageEl.hover(
				// Mouse over
				function() {
					$(this).stop().animate(
						{
							'opacity': '0.75',
							'width': '110%',
							'margin-left': '-5%',
							'margin-top': Math.round($(this).height() / -20)
						},
						400
					);
				},

				// Mouse out
				function() {
					$(this).stop().animate(
						{
							'opacity': '1',
							'width': '100%',
							'margin-left': '0',
							'margin-top': '0'
						},
						400
					);
				}
			);

			mediaframeTileImageEl.attr('eatlas_media_frame_filter', 'ready');
		}
	};

	var zoomInTileImage = function() {
		// Slightly zoom on the image and change its opacity
		//   when the mouse move over it.
		var mediaframeTileImages = $('.mediaframe_tile .image');
		if (mediaframeTileImages && mediaframeTileImages.length > 0) {
			mediaframeTileImages.each(function(index, domMediaframeTileImage) {
				var mediaframeTileImage = $(domMediaframeTileImage);
				var mediaframeTileImageCell = mediaframeTileImage.find('.image-cell');

				// Find the image element and wait until it's loaded
				var mediaframeTileImageEl = mediaframeTileImageCell.find('img');
				// Set the image width to 100%, to prevent it from
				//   expending its container when the page is too small
				//   for the image to fit in.
				mediaframeTileImageEl.css('width', '100%');

				if (mediaframeTileImageEl[0].complete) {
					// The image is already loaded, run the init function
					initImageHoverListener(mediaframeTileImage);
				} else {
					// The image is loading. Wait until it's fully loaded
					mediaframeTileImageEl.load(function() {
						// Run the init function
						initImageHoverListener(mediaframeTileImage);
					});
				}
			});
		}
	};

	$(document).ready(function() {
		// Reset all animation when the browser window changes
		//   (to avoid glitches on mobile devices when the screen orientation is changed in the middle of an animation)
		$(window).resize(function() {
			var mediaframeTileImages = $('.mediaframe_tile .image');
			if (mediaframeTileImages && mediaframeTileImages.length > 0) {
				mediaframeTileImages.each(function(index, domMediaframeTileImage) {
					var mediaframeTileImage = $(domMediaframeTileImage);
					var mediaframeTileImageCell = mediaframeTileImage.find('.image-cell');

					// Find the image element and wait until it's loaded
					var mediaframeTileImageEl = mediaframeTileImageCell.find('img');

					// Cancel animations / reset image CSS style
					mediaframeTileImageEl.stop();
					mediaframeTileImageEl.css('opacity', '1');
					mediaframeTileImageEl.css('width', '100%');
					mediaframeTileImageEl.css('margin-left', '0');
					mediaframeTileImageEl.css('margin-top', '0');

					// Re-size the image Cell to the new image dimensions
					mediaframeTileImageCell.css('width', mediaframeTileImage.width());
					mediaframeTileImageCell.css('height', mediaframeTileImageEl.height());
				});
			}
		});

		// Activate tiles zooming events on mouse over
		zoomInTileImage();

		// Activate tiles zooming events on mouse over, when the content of the pages is rendered using the eatlas_spatial_publisher
		$('.eatlas_spatial_publisher_map .map_panel').bind('content-change', function() {
			zoomInTileImage();
		});
	});
})(jQuery);

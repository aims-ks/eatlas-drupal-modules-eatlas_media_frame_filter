I could not find a way to define an override for files used in views.

If you want to use the frame filter in images defined in views,
link the view template in your theme:
	1. Go to your theme folder
		cd www/sites/all/themes/MY_THEME
	2. Create a link to the template
		ln -s ../../modules/eatlas_media_frame_filter/templates/views-view-field.tpl.php .

Not all files defined in views can have a frame. Some setup will only contain partial information.
To setup your file field properly,
	1. Edit your view
	2. Edit the file field:
		Fields > My file field
	3. Provide proper configuration.
		Formatter: [Rendered file]
		View mode: [Default]
	NOTE: You can choose the view mode you like.
	4. Apply (the field modification)
	5. Save (the changes to the view)


<?php
/**
 * @file
 * This template is used to print a single field in a view.
 *
 * It is not actually used in default Views, as this is registered as a theme
 * function which has better performance. For single overrides, the template is
 * perfectly okay.
 *
 * Variables available:
 * - $view: The view object
 * - $field: The field handler object that can process the input
 * - $row: The raw SQL result that can be used
 * - $output: The processed output that will normally be used.
 *
 * When fetching output from the $row, this construct should be used:
 * $data = $row->{$field->field_alias}
 *
 * The above will guarantee that you'll always get the correct data,
 * regardless of any changes in the aliasing that might happen if
 * the view is modified.
 */

// NOTE: Those massive IF statements validate the existance and type of variables before use,
//     to avoid exceptions or unexpected output.
if (isset($field) && is_object($field) &&
		isset($field->field_info) && is_array($field->field_info) &&
		isset($field->field_info['type']) && is_string($field->field_info['type'])) {

	$field_type = $field->field_info['type'];

	if ($field_type === 'file') {
		$field_name = $field->field_info['field_name'];
		if ($field_name && is_string($field_name) &&
				isset($row) && is_object($row) &&
				isset($row->{"field_$field_name"}) &&
				is_array($row->{"field_$field_name"})) {

			$decorate_output = '';
			// Loop through all the elements (in case of a multiple value field)
			foreach ($row->{"field_$field_name"} as $file_field) {
				if ($file_field && is_array($file_field) &&
						isset($file_field['rendered']) &&
						is_array($file_field['rendered']) &&
						isset($file_field['rendered']['file']) &&
						$file_field['rendered']['file']) {

					// The style (medium, large, etc.) is defined in the ['file']
					if (module_exists('eatlas_media_frame_filter')) {
						$decorate_output .= eatlas_media_frame_decorate(
							$file_field['rendered']['file'],
							array(
								'showMetadata' => FALSE,
								'media_style' => 'wikipedia',
								'media_link' => 'none'
							)
						);
					} else {
						// TODO Test
						$decorate_output .= render($file_field['rendered']['file']);
					}
				}
			}

			if ($decorate_output) {
				$output = $decorate_output;
			}
		}
	}
} elseif (isset($field->original_value) && is_numeric($field->original_value)) {
	$file = file_load($field->original_value);
	$decorate_output = NULL;
	if (module_exists('eatlas_media_frame_filter')) {
		$decorate_output = eatlas_media_frame_decorate(
			array('#file' => $file),
			array(
				'showMetadata' => FALSE,
				'styleName' => 'medium',
				'media_style' => 'wikipedia'
			)
		);
	} else {
		// TODO Test
		$decorate_output = '<img src="' . image_style_url('medium', $file->uri) . '" />';
	}
	if ($decorate_output) {
		$output = $decorate_output;
	}
}

print $output;

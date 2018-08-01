Reference:
http://definitivedrupal.org/suggestions/how-make-custom-input-filter


DEBUG:

if (!function_exists('_DELETE_error_log')) {
	function _DELETE_error_log($msg) {
		if (!is_string($msg)) {
			$msg = print_r($msg, true);
		}
		
		$lines = explode("\n", $msg);
		foreach($lines as $line) {
			error_log($line);
		}
	}
}

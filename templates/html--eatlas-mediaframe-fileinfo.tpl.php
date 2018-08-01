<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml"
		lang="<?php print $language->language; ?>"
		xml:lang="<?php print $language->language; ?>"
		version="XHTML+RDFa 1.0"
		dir="<?php print $language->dir; ?>"
		<?php print $rdf_namespaces; ?>>

<head profile="<?php print $grddl_profile; ?>">
	<?php print $head; ?>
	<title><?php print $head_title; ?></title>
	<?php print $styles; ?>
	<!--[if lte IE 7]>
		<link href="/sites/all/themes/eatlas/css/IE/lteIE7.css" rel="stylesheet" type="text/css" />
	<![endif]-->
	<!--[if lte IE 8]>
		<link href="/sites/all/themes/eatlas/css/IE/lteIE8.css" rel="stylesheet" type="text/css" />
	<![endif]-->
	<?php print $scripts; ?>
</head>
<body class="<?php print $classes; ?> eatlas-mediaframe-fileinfo" <?php print $attributes;?>>
	<?php print $page; ?>
</body>
</html>

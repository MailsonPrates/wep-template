<?php

use App\App;

include_once("../vendor/autoload.php");

$app = App::start(include_once("../config/app.php"));

date_default_timezone_set("America/Sao_Paulo");
        
if ( ENV == "DEV" ){
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
}

/**
 * OC Helpers
 */

 function utf8_substr($string, $offset, $length = null) {
    if ($length === null) {
        return iconv_substr($string, $offset, utf8_strlen($string), 'UTF-8');
    } else {
        return iconv_substr($string, $offset, $length, 'UTF-8');
    }
}

function utf8_strlen($string) {
    return mb_strlen($string);
}

function utf8_strrpos($string, $needle, $offset = 0) {
    return mb_strrpos($string, $needle, $offset);
}


$app->run();
<?php

use App\App;

include_once("../vendor/autoload.php");

$app = App::start(include_once("../config/app.php"));

date_default_timezone_set("America/Sao_Paulo");
        
if ( ENV == "DEV" ){
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
}

$app->run();
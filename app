#!/usr/bin/env php

<?php

include_once("vendor/autoload.php");

use App\Core\Engine\Commands;

Commands::run($argv, include_once("config/app.php"));
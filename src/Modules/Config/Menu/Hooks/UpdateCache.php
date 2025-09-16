<?php

namespace App\Modules\Config\Menu\Hooks;

use App\Modules\Config\Menu\Services\MenuService;

class UpdateCache
{
    public function handle()
    {
        MenuService::buildMenusCache();
    }
}
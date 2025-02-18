import RouteMaps from "route-maps";
import React, { Suspense} from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes} from "react-router";
import { ToastProvider } from 'ui/ToastContext';
import { SidebarProvider } from "ui/templates/main/SidebarContext";
import App from "app";

document.addEventListener('DOMContentLoaded', function(event) {
    const root = createRoot(document.getElementById('app'));
    const basename = `/${App.data("basename", "")}`;
    
    root.render(
        <ToastProvider>
            <SidebarProvider>
                <BrowserRouter basename={basename}>
                    <Suspense>
                        <Routes>
                           {RouteMaps()}
                        </Routes>
                    </Suspense>
                </BrowserRouter>
            </SidebarProvider>
        </ToastProvider>
    );
});

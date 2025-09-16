import RouteMaps from "route-maps";
import React, { Suspense} from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route} from "react-router";
import { ToastProvider } from 'ui/ToastContext';
import { SidebarProvider } from "ui/templates/main/SidebarContext";
import App from "app";
import ProgressBar from "ui/ProgressBar";
import Error404 from "ui/error/Error404";
import { ErrorProvider } from "ui/error/ErrorContext";

document.addEventListener('DOMContentLoaded', function(event) {
    const root = createRoot(document.getElementById('app'));
    const basename = `/${App.data("basename", "")}`;
    
    root.render(
        <ToastProvider>
            <SidebarProvider>
                <BrowserRouter basename={basename}>
                    <ProgressBar />
                    <Suspense>
                        <ErrorProvider>
                            <Routes>
                                {RouteMaps()}
                                <Route path="*" element={<Error404 />} />
                            </Routes>
                        </ErrorProvider>
                    </Suspense>
                </BrowserRouter>
            </SidebarProvider>
        </ToastProvider>
    );
});

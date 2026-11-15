import RouteMaps from "route-maps";
import React, { Suspense} from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route} from "react-router";
import { ToastProvider, SidebarProvider, ErrorProvider } from 'contexts';
import App from "app";
import {ProgressBar, Error404} from "components";

document.addEventListener('DOMContentLoaded', function(event) {
    const root = createRoot(document.getElementById('app'));
    const basename = `/${App.config("basename", "")}`;
    
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

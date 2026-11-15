import { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import RouteMaps from "route-maps";
import { ToastProvider, SidebarProvider, ErrorProvider } from "contexts";
import config from "core/config";
import { ProgressBar, Error404 } from "components";

function mount() {
    const element = document.getElementById("app");

    if (!element) return;

    const basename = `/${String(config("basename", "") || "").replace(/^\/+|\/+$/g, "")}`;

    createRoot(element).render(
        <ToastProvider>
            <SidebarProvider>
                <BrowserRouter basename={basename}>
                    <ErrorProvider>
                        <Suspense fallback={<ProgressBar />}>
                            <Routes>
                                {RouteMaps()}
                                <Route path="*" element={<Error404 />} />
                            </Routes>
                        </Suspense>
                    </ErrorProvider>
                </BrowserRouter>
            </SidebarProvider>
        </ToastProvider>
    );
}

// os scripts usam `defer`, mas monta também se o DOM já estiver pronto
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
} else {
    mount();
}

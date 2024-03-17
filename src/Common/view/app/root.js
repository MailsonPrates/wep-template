import App from "app";
import {Jeact, Router} from "jeact";
import RouteMaps from "route-maps";

const env = App.data("env");

Jeact({
    elements: []
});

Router({
    container: "#app",
    routes: RouteMaps,
    fallback: () => import(`/src/Common/view/ui/404.js`),
    env
});

import RecommenderPage from "./pages/recommenderPage/RecommenderPage";
import Admin from "./pages/Admin";
import SteamLinkPage from "./pages/steamLinkPage/SteamLinkPage";
import {ADMIN_ROUTE, MAIN_ROOT} from "./utils/consts";

export const publicRoutes = [
    {
        path: MAIN_ROOT + '/:id',
        Component: <RecommenderPage />
    },
    {
        path: MAIN_ROOT,
        Component: <SteamLinkPage />
    }
]

export const authRoutes = [
    {
        path: ADMIN_ROUTE,
        Component: <Admin />
    }
]
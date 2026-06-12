import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import ContentLayout from "../components/layout/ContentLayout";
import ContentPage from "../components/layout/ContentPage";
import Sidebar from "../components/layout/Sidebar";
import ErrorPage from "../pages/error/ErrorPage";
import HomePage from "../pages/HomePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "duty/",
        element: <ContentLayout sidebar={<Sidebar source="duty" />} />,
        children: [{ path: ":slug", element: <ContentPage source="duty" /> }],
      },
    ],
  },
]);

export default router;

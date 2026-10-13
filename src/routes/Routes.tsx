import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import NotFound from "../pages/NotFound";
import Home from "../pages/Home";
import Signup from "@/pages/Signup";
import Login from "@/pages/Login"; // ✅
import OnboardingSuccess from "@/pages/OnboardingSuccess";

import AdminLayout from "@/Layout/AdminLayout";

import AdminDashboardPage from "@/pages/Admin/AdminDashboardPage";
import UsersPage from "@/pages/Admin/UsersPage";
import SellerApprovalPage from "@/pages/Admin/SellerApprovalPage";
import PaymentsPage from "@/pages/Admin/PaymentsPage";
import SupportPage from "@/pages/Admin/SupportPage";
import ServiceReviewPage from "@/pages/Admin/ServiceReviewPage";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/onboarding-success",
        element: <OnboardingSuccess />,
      },
    ],
  },

  /* Admin Dashboard */
  {
    path: "/admin-dashboard",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: "dashboard", element: <AdminDashboardPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "seller-approval", element: <SellerApprovalPage /> },
      { path: "payments", element: <PaymentsPage /> },
      { path: "support", element: <SupportPage /> },
      { path: "service-review", element: <ServiceReviewPage /> },
    ],
  },

  {
    path: "*",
    element: <NotFound />,
  },
]);

export default routes;

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/login.tsx";
import Signup from "./pages/auth/signup.tsx";
import ForgotPassword from "./pages/auth/forgotPassword.tsx";
import ResetPassword from "./pages/auth/reset-password.tsx";
import ToastProvider from "./components/ToasterProvider.tsx";
import ProtectedRoute from "./components/ProtectedRoute";

// Admin pages
import AdminDashboard from "./pages/admin/dashboard.tsx";
import RecentlyOnboardedPage from "./pages/admin/recently-onboarded.tsx";
import RestaurantsDashboard from "./pages/admin/restaurants/restaurantsdashboard.tsx";
import Plans from "./pages/admin/plans/plans.tsx";
import AddPlan from "./pages/admin/plans/add-plans.tsx";
import EditPlan from "./pages/admin/plans/edit-plans.tsx";
import AddRestaurant from "./pages/admin/restaurants/add-restaurants.tsx";
import EditRestaurant from "./pages/admin/restaurants/edit-restaurants.tsx";
import Restaurants from "./pages/admin/restaurants/restaurants.tsx";

// Subadmin pages
import SubadminDashboard from "./pages/subadmin/dashboard.tsx";
import RecentlyCalls from "./pages/subadmin/recently-calls.tsx";
import AddMenu from "./pages/subadmin/menu/add-menu.tsx";
import Menu from "./pages/subadmin/menu/menu.tsx";
import EditMenu from "./pages/subadmin/menu/edit-menu.tsx";
import VoiceBotDashboard from "./pages/subadmin/voicebot/page.tsx";
// import BillingPage from "./pages/subadmin/billingsub/page.tsx";
import UpdateReturn from "./pages/subadmin/updatereturn/page.tsx";
import ManageLinkList from "./pages/subadmin/managelinklist/page.tsx";
import Managelinks from "./pages/subadmin/managelinks/page.tsx";
import PlansDetails from "./pages/subadmin/plan/plan.tsx";
import PlansDet from "./pages/subadmin/plan/plandetails.tsx";
import PaymentSuccess from "./pages/subadmin/paymentSuccess/page.tsx";
import MenuItems from "./pages/subadmin/menu-items/page.tsx";
import AddMenuItems from "./pages/subadmin/menu-items/add-menu-items.tsx";
import EditMenuItems from "./pages/subadmin/menu-items/edit-menu-items.tsx";
import BusinessHour from "./pages/subadmin/business-hour/page.tsx";
import EditBusinessHour from "./pages/subadmin/business-hour/edit-business-hour.tsx";
import AddBusinessHour from "./pages/subadmin/business-hour/add-business-hour.tsx";
import Unauthorized from "./pages/unauthorized.tsx";
import PaymentCancel from "./pages/subadmin/paymentCancel/page.tsx";
import PlanHistorydetail from "./pages/subadmin/plan/planHistorydetail.tsx";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <ToastProvider />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRole="admin" element={<AdminDashboard />} />
          }
        />
        <Route
          path="/admin/recently-onboarded"
          element={
            <ProtectedRoute
              allowedRole="admin"
              element={<RecentlyOnboardedPage />}
            />
          }
        />
        <Route
          path="/admin/plans"
          element={<ProtectedRoute allowedRole="admin" element={<Plans />} />}
        />
        <Route
          path="/admin/plans/add-plans"
          element={<ProtectedRoute allowedRole="admin" element={<AddPlan />} />}
        />
        <Route
          path="/admin/plans/edit-plans/:id"
          element={
            <ProtectedRoute allowedRole="admin" element={<EditPlan />} />
          }
        />
        <Route
          path="/admin/restaurants"
          element={
            <ProtectedRoute allowedRole="admin" element={<Restaurants />} />
          }
        />
        <Route
          path="/admin/restaurantsdashboard"
          element={
            <ProtectedRoute
              allowedRole="admin"
              element={<RestaurantsDashboard />}
            />
          }
        />
        <Route
          path="/admin/restaurants/add-restaurants"
          element={
            <ProtectedRoute allowedRole="admin" element={<AddRestaurant />} />
          }
        />
        <Route
          path="/admin/restaurants/edit-restaurants/:id"
          element={
            <ProtectedRoute allowedRole="admin" element={<EditRestaurant />} />
          }
        />

        {/* Subadmin Routes */}
        <Route
          path="/subadmin/dashboard"
          element={
            <ProtectedRoute
              allowedRole="subdir"
              element={<SubadminDashboard />}
            />
          }
        />
        <Route
          path="/subadmin/recently-calls"
          element={
            <ProtectedRoute allowedRole="subdir" element={<RecentlyCalls />} />
          }
        />
        <Route
          path="/subadmin/menu"
          element={<ProtectedRoute allowedRole="subdir" element={<Menu />} />}
        />
        <Route
          path="/subadmin/add-menu"
          element={
            <ProtectedRoute allowedRole="subdir" element={<AddMenu />} />
          }
        />
        <Route
          path="/subadmin/edit/:id"
          element={
            <ProtectedRoute allowedRole="subdir" element={<EditMenu />} />
          }
        />
        <Route
          path="/subadmin/voice-bot"
          element={
            <ProtectedRoute
              allowedRole="subdir"
              element={<VoiceBotDashboard />}
            />
          }
        />
        {/* <Route path="/subadmin/billing" element={<ProtectedRoute allowedRole="subdir" element={<BillingPage />} />} /> */}
        <Route
          path="/subadmin/update-profile"
          element={
            <ProtectedRoute allowedRole="subdir" element={<UpdateReturn />} />
          }
        />
        <Route
          path="/subadmin/list"
          element={
            <ProtectedRoute allowedRole="subdir" element={<ManageLinkList />} />
          }
        />
        <Route
          path="/subadmin/manage-restaurants"
          element={
            <ProtectedRoute allowedRole="subdir" element={<Managelinks />} />
          }
        />
        <Route
          path="/subadmin/plan"
          element={
            <ProtectedRoute allowedRole="subdir" element={<PlansDetails />} />
          }
        />
        <Route
          path="/subadmin/plan/plandetails/:id"
          element={
            <ProtectedRoute allowedRole="subdir" element={<PlansDet />} />
          }
        />
        <Route
          path="/subadmin/payment-success"
          element={
            <ProtectedRoute allowedRole="subdir" element={<PaymentSuccess />} />
          }
        />
        <Route
          path="/subadmin/menu-items"
          element={
            <ProtectedRoute allowedRole="subdir" element={<MenuItems />} />
          }
        />
        <Route
          path="/subadmin/menu-items/add-menu-items"
          element={
            <ProtectedRoute allowedRole="subdir" element={<AddMenuItems />} />
          }
        />
        <Route
          path="/subadmin/edit-menu-items/:id"
          element={
            <ProtectedRoute allowedRole="subdir" element={<EditMenuItems />} />
          }
        />
        <Route
          path="/subadmin/business-hour"
          element={
            <ProtectedRoute allowedRole="subdir" element={<BusinessHour />} />
          }
        />
        <Route
          path="/subadmin/business-hour/add-business-hour"
          element={
            <ProtectedRoute
              allowedRole="subdir"
              element={<AddBusinessHour />}
            />
          }
        />
        <Route
          path="/subadmin/business-hour/edit-business-hour/:id"
          element={
            <ProtectedRoute
              allowedRole="subdir"
              element={<EditBusinessHour />}
            />
          }
        />
        <Route
          path="/subadmin/payment-cancelled"
          element={
            <ProtectedRoute allowedRole="subdir" element={<PaymentCancel />} />
          }
        />
        <Route
          path="/subadmin/all-history-invoices/:id"
          element={
            <ProtectedRoute
              allowedRole="subdir"
              element={<PlanHistorydetail />}
            />
          }
        />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;

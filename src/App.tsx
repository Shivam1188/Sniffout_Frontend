import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/login.tsx";
import Signup from "./pages/auth/signup.tsx";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/auth/forgotPassword.tsx";
import ResetPassword from "./pages/auth/reset-password.tsx";
import ToastProvider from "./components/ToasterProvider.tsx";
import Cookies from "js-cookie";

// Admin pages
import Plans from "./pages/admin/plans/plans.tsx";
import AddPlan from "./pages/admin/plans/add-plans.tsx";
import AdminDashboard from "./pages/admin/dashboard.tsx";
import EditPlan from "./pages/admin/plans/edit-plans.tsx";
import Restaurants from "./pages/admin/restaurants/restaurants.tsx";
import RecentlyOnboardedPage from "./pages/admin/recently-onboarded.tsx";
import AddRestaurant from "./pages/admin/restaurants/add-restaurants.tsx";
import EditRestaurant from "./pages/admin/restaurants/edit-restaurants.tsx";
import RestaurantsDashboard from "./pages/admin/restaurants/restaurantsdashboard.tsx";

// Subadmin pages
import Layout from "./components/Layout.tsx";
import Menu from "./pages/subadmin/menu/menu.tsx";
import Unauthorized from "./pages/unauthorized.tsx";
import AddMenu from "./pages/subadmin/menu/add-menu.tsx";
import PlansDetails from "./pages/subadmin/plan/plan.tsx";
import EditMenu from "./pages/subadmin/menu/edit-menu.tsx";
import PlansDet from "./pages/subadmin/plan/plandetails.tsx";
import MenuItems from "./pages/subadmin/menu-items/page.tsx";
import SubadminDashboard from "./pages/subadmin/dashboard.tsx";
import RecentlyCalls from "./pages/subadmin/recently-calls.tsx";
import Managelinks from "./pages/subadmin/managelinks/page.tsx";
import VoiceBotDashboard from "./pages/subadmin/voicebot/page.tsx";
// import BillingPage from "./pages/subadmin/billingsub/page.tsx";
import UpdateReturn from "./pages/subadmin/updatereturn/page.tsx";
import BusinessHour from "./pages/subadmin/business-hour/page.tsx";
import PaymentCancel from "./pages/subadmin/paymentCancel/page.tsx";
import ManageLinkList from "./pages/subadmin/managelinklist/page.tsx";
import PaymentSuccess from "./pages/subadmin/paymentSuccess/page.tsx";
import AddMenuItems from "./pages/subadmin/menu-items/add-menu-items.tsx";
import EditMenuItems from "./pages/subadmin/menu-items/edit-menu-items.tsx";
import PlanHistorydetail from "./pages/subadmin/plan/planHistorydetail.tsx";
import EditBusinessHour from "./pages/subadmin/business-hour/edit-business-hour.tsx";
import AddBusinessHour from "./pages/subadmin/business-hour/add-business-hour.tsx";
import Feedback from "./pages/subadmin/feedback/page.tsx";
import AddFeedback from "./pages/subadmin/feedback/add-feedback/page.tsx";
import EditFeedback from "./pages/subadmin/feedback/edit-feedback/page.tsx";
import Reservation from "./pages/subadmin/reservation/page.tsx";
import CraeteTables from "./pages/subadmin/create-tables/page.tsx";
import AddTables from "./pages/subadmin/create-tables/add-tables/page.tsx";
import SetTableCounting from "./pages/subadmin/set-table-counting/page.tsx";
import AddTableCounting from "./pages/subadmin/set-table-counting/add-table-counting/page.tsx";
import Catering from "./pages/subadmin/catering/page.tsx";
import Subscribe from "./pages/subadmin/subscribe/page.tsx";
import AddCatering from "./pages/subadmin/catering/add-catering/page.tsx";
import EditCatering from "./pages/subadmin/catering/edit-catering/page.tsx";
import Upsells from "./pages/subadmin/upsells/page.tsx";
import AddUpsells from "./pages/subadmin/upsells/add-upsells/page.tsx";
import EditUpsells from "./pages/subadmin/upsells/edit-upsells/page.tsx";
import TwilloRecord from "./pages/admin/twillo-records/page.tsx";
import GetDetails from "./pages/admin/twillo-records/get-details/page.tsx";
import EnterPriseRequests from "./pages/admin/enterprise-requests/page.tsx";
import OnetoOneScheduling from "./pages/auth/one-on-one-scheduling.tsx";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <ToastProvider />

      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            Cookies.get("token") && Cookies.get("role") ? (
              Cookies.get("role") === "admin" ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <Navigate to="/subadmin/dashboard" replace />
              )
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/one-on-one-scheduling" element={<OnetoOneScheduling />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route
          element={<ProtectedRoute allowedRole="admin" element={<Layout />} />}
        >
          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute
                allowedRole="admin"
                element={<AdminDashboard />}
              />
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
          />{" "}
          <Route
            path="/admin/enterprise-requests"
            element={
              <ProtectedRoute
                allowedRole="admin"
                element={<EnterPriseRequests />}
              />
            }
          />
          <Route
            path="/admin/plans/add-plans"
            element={
              <ProtectedRoute allowedRole="admin" element={<AddPlan />} />
            }
          />
          <Route
            path="/admin/plans/edit-plans/:id"
            element={
              <ProtectedRoute allowedRole="admin" element={<EditPlan />} />
            }
          />
          <Route
            path="/admin/twillo-records/get-details/:id"
            element={
              <ProtectedRoute allowedRole="admin" element={<GetDetails />} />
            }
          />
          <Route
            path="/admin/restaurants"
            element={
              <ProtectedRoute allowedRole="admin" element={<Restaurants />} />
            }
          />
          <Route
            path="/admin/twillo-records"
            element={
              <ProtectedRoute allowedRole="admin" element={<TwilloRecord />} />
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
              <ProtectedRoute
                allowedRole="admin"
                element={<EditRestaurant />}
              />
            }
          />
        </Route>

        <Route
          element={<ProtectedRoute allowedRole="subdir" element={<Layout />} />}
        >
          {/* Subadmin Routes */}
          <Route
            path="/subadmin/reservation"
            element={
              <ProtectedRoute allowedRole="subdir" element={<Reservation />} />
            }
          />
          <Route
            path="/subadmin/upsells"
            element={
              <ProtectedRoute allowedRole="subdir" element={<Upsells />} />
            }
          />
          <Route
            path="/subadmin/subscribe"
            element={
              <ProtectedRoute allowedRole="subdir" element={<Subscribe />} />
            }
          />

          <Route
            path="/subadmin/create-tables"
            element={
              <ProtectedRoute allowedRole="subdir" element={<CraeteTables />} />
            }
          />

          <Route
            path="/subadmin/upsells/add-upsells"
            element={
              <ProtectedRoute allowedRole="subdir" element={<AddUpsells />} />
            }
          />
          <Route
            path="/subadmin/upsells/edit-upsells/:id"
            element={
              <ProtectedRoute allowedRole="subdir" element={<EditUpsells />} />
            }
          />
          <Route
            path="/subadmin/set-table-counting"
            element={
              <ProtectedRoute
                allowedRole="subdir"
                element={<SetTableCounting />}
              />
            }
          />

          <Route
            path="/subadmin/catering"
            element={
              <ProtectedRoute allowedRole="subdir" element={<Catering />} />
            }
          />
          <Route
            path="/subadmin/catering/add-catering"
            element={
              <ProtectedRoute allowedRole="subdir" element={<AddCatering />} />
            }
          />
          <Route
            path="/subadmin/catering/edit-catering/:id"
            element={
              <ProtectedRoute allowedRole="subdir" element={<EditCatering />} />
            }
          />
          <Route
            path="/subadmin/set-table-counting/add-table-counting"
            element={
              <ProtectedRoute
                allowedRole="subdir"
                element={<AddTableCounting />}
              />
            }
          />
          <Route
            path="/subadmin/create-tables/add-tables"
            element={
              <ProtectedRoute allowedRole="subdir" element={<AddTables />} />
            }
          />

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
              <ProtectedRoute
                allowedRole="subdir"
                element={<RecentlyCalls />}
              />
            }
          />
          <Route
            path="/subadmin/feedback"
            element={
              <ProtectedRoute allowedRole="subdir" element={<Feedback />} />
            }
          />
          <Route
            path="/subadmin/add-feedback"
            element={
              <ProtectedRoute allowedRole="subdir" element={<AddFeedback />} />
            }
          />
          <Route
            path="/subadmin/edit-feedback/:id"
            element={
              <ProtectedRoute allowedRole="subdir" element={<EditFeedback />} />
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
              <ProtectedRoute
                allowedRole="subdir"
                element={<ManageLinkList />}
              />
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
              <ProtectedRoute
                allowedRole="subdir"
                element={<PaymentSuccess />}
              />
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
              <ProtectedRoute
                allowedRole="subdir"
                element={<EditMenuItems />}
              />
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
              <ProtectedRoute
                allowedRole="subdir"
                element={<PaymentCancel />}
              />
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
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;

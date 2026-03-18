import { Routes, Route } from "react-router-dom";
import Register from "../auth/Register";
import Login from "../auth/Login";
import ForgotPassword from '../auth/ForgotPassword'; // পাথ তোমার ফোল্ডার অনুযায়ী ঠিক করে নিও
import ResetPassword from '../auth/ResetPassword';
import Home from "../home/Home";
import ServicesPage from "../services/ServicesPage";
import Gallery from "../gallery/Gallery";
import About from "../common/About";
import Contact from "../common/Contact";
import FloatingWhatsApp from "../common/FloatingWhatsApp";
import Reviews from "../reviews/Reviews";
import CartPage from '../shop/CartPage';

// --- User Dashboard Components ---
import DashboardLayout from "../user/DashboardLayout";
import UserProfile from "../user/profile/UserProfile";
import BookService from "../user/bookings/BookService";
import BookingHistory from "../user/bookings/BookingHistory";
// import UserInvoiceList from "../user/invoices/InvoiceList";
import UserBikeTrade from "../user/bike/UserBikeTrade"; 
import UserPartsBookings from "../user/bookings/UserPartsBookings"; 

import UserInvoiceDetails from '../user/invoices/UserInvoiceDetails';
import UserInvoiceList from '../user/invoices/InvoiceList';

// Admin Components
import AdminLayout from "../admin/AdminLayout";
import Dashboard from "../admin/dashboard/Dashboard";
import AddImage from "../admin/gallery/AddImage";
// import AddVideo from "../admin/gallery/AddVideo";
import EditImage from "../admin/gallery/EditImage";
import GalleryList from "../admin/gallery/GalleryList";
import OrderManagement from "../admin/orders/OrderManagement";
import AddParts from "../admin/parts/AddParts";
import PartsLists from "../admin/parts/PartsLists";
import ManageServices from "../admin/services/ManageServices";
import Settings from "../admin/settings/Settings";

import StaffRoles from "../admin/staff/StaffRoles";
import StaffManagementGuard from '../admin/staff/StaffManagementGuard';
import ManageReviews from "../admin/reviews/ManageReviews";
import AdminPartsBookings from '../admin/bookings/AdminPartsBookings';
import ManageSecondHand from "../admin/secondhand/ManageSecondHand";


import CreateInvoice from '../admin/invoices/CreateInvoice';
import InvoiceDetails from '../admin/invoices/InvoiceDetails'; 
import InvoiceList from '../admin/invoices/InvoiceList'; 
import EditInvoice from '../admin/invoices/EditInvoice'; // তোমার ফোল্ডার অনুযায়ী পাথ ঠিক করে নিও


// EV Service Components
import EVOverview from "../services/evService/EvOverview";

// Modification Components

import ModificationOverview from "../services/modification/ModificationOverview";
import ModificationDynamic from "../services/modification/ModificationDynamic";

// Parts Components
import ProductList from "../services/purchaseBikeParts/ProductList";
// Second Hand Bike Components
import BuyBike from "../services/secondHandBike/BuyBike";
import SellBike from "../services/secondHandBike/SellBike";
import Inspection from "../services/secondHandBike/Inspection";
import SecondHandOverview from "../services/secondHandBike/SecondHandOverview";

// Washing Components
import WashingOverview from '../services/washing/WashingOverview';
import WashingBooking from '../services/washing/WashingBooking';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Main Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/floating-whatsapp" element={<FloatingWhatsApp />} />
      <Route path="/reviews" element={<Reviews />} />
      <Route path="/cart" element={<CartPage />} />
      
    {/* ================= USER DASHBOARD ROUTES ================= */}
      {/* User routes are wrapped in DashboardLayout */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<UserProfile />} />
        <Route path="/book-service" element={<BookService />} />
        <Route path="/my-bookings" element={<BookingHistory />} />
        {/* <Route path="/my-invoices" element={<UserInvoiceList />} /> */}

          {/* ================= USER INVOICE ROUTES ================= */}
         {/* User tar nijer bill dekhbe */}
         <Route path="/my-invoices" element={<UserInvoiceList />} />
         <Route path="/my-invoices/view/:id" element={<UserInvoiceDetails />} />
        
        {/* ✅ ২. নতুন রাউট যোগ করা হলো */}
        <Route path="/user/parts-bookings" element={<UserPartsBookings />} />
        <Route path="/user/bike-trade" element={<UserBikeTrade />} />
      </Route>

      {/* EV Services Routes */}
      <Route path="/services/ev-overview" element={<EVOverview />} />

      {/* Modifications Routes */}
      <Route path="/services/modifications" element={<ModificationOverview />} />
      <Route path="/services/modification/:type" element={<ModificationDynamic />} />

      {/* Parts Routes */}
      <Route path="/shop/:category" element={<ProductList />} />

      {/* Second Hand Bike Routes */}
      <Route path="/services/second-hand/buy" element={<BuyBike />} />
      <Route path="/services/second-hand/sell" element={<SellBike />} />
      <Route path="/services/second-hand/inspection" element={<Inspection />} />
      <Route path="/services/second-hand/overview" element={<SecondHandOverview />} />

      {/* Washing Routes */}
      <Route path="/services/washing" element={<WashingOverview />} />
      <Route path="/services/washing/book/:id" element={<WashingBooking />} />

      {/* Admin Routes - Wrapped with AdminLayout */}
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/gallery/add" element={<AddImage />} />
        <Route path="/admin/gallery/edit/:id" element={<EditImage />} />
        <Route path="/admin/gallery/list" element={<GalleryList />} />
        <Route path="/admin/invoices/create" element={<CreateInvoice />} />
        <Route path="/admin/invoices/details/:id" element={<InvoiceDetails />} />
        <Route path="/admin/invoices/list" element={<InvoiceList />} />
        <Route path="/admin/invoices/edit/:id" element={<EditInvoice />} />
        <Route path="/admin/orders" element={<OrderManagement />} />
        <Route path="/admin/parts/add" element={<AddParts />} />
        <Route path="/admin/parts/list" element={<PartsLists />} />
        <Route path="/admin/services/manage" element={<ManageServices />} />
        <Route path="/admin/settings" element={<Settings />} />
        <Route path="/admin/staff/roles" element={<StaffRoles />} />
        <Route path="/admin/staff" element={<StaffManagementGuard />} />
        <Route path="/admin/reviews" element={<ManageReviews />} />
        <Route path="/admin/parts-bookings" element={<AdminPartsBookings />} />
        <Route path="/admin/secondhand/manage" element={<ManageSecondHand />} />



          {/* ================= ADMIN INVOICE ROUTES ================= */}
  {/* Bill Create kora */}
  <Route path="/admin/invoices/create" element={<CreateInvoice />} />
  
  {/* Sob Bill er list dekha */}
  <Route path="/admin/invoices/list" element={<InvoiceList />} />
  
  {/* Bill Print ba View kora (Specific ID diye) */}
  <Route path="/admin/invoices/view/:id" element={<InvoiceDetails />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
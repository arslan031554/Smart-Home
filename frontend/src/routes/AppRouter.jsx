import { createBrowserRouter, RouterProvider, Navigate, useParams } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminLayout from '../layouts/AdminLayout';
import { RootErrorPage } from '../components/common/ErrorBoundary';

import HomePage from '../pages/HomePage';
import ConfiguratorPage from '../pages/ConfiguratorPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import VerifyEmailPage from '../pages/VerifyEmailPage';
import VerifyOtpPage from '../pages/VerifyOtpPage';
import ChooseVerificationMethodPage from '../pages/ChooseVerificationMethodPage';
import TermsOfServicePage from '../pages/TermsOfServicePage';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';
import CookiesPolicyPage from '../pages/CookiesPolicyPage';
import DashboardHome from '../pages/DashboardHome';
import ProfilePage from '../pages/ProfilePage';
import OffersListPage from '../pages/OffersListPage';
import OfferDetailPage from '../pages/OfferDetailPage';
import ProjectsListPage from '../pages/ProjectsListPage';
import ProjectDetailPage from '../pages/ProjectDetailPage';
import NotFoundPage from '../pages/NotFoundPage';
import PresentationLayout from '../presentation/PresentationLayout';
import PresentationHomePage from '../presentation/pages/HomePage';
import PresentationAboutPage from '../presentation/pages/AboutPage';
import PresentationServicesPage from '../presentation/pages/ServicesPage';
import PresentationPortfolioPage from '../presentation/pages/PortfolioPage';
import PresentationMediaPage from '../presentation/pages/MediaPage';
import PresentationContactPage from '../presentation/pages/ContactPage';
import PresentationServicePage from '../presentation/pages/ServicePage';

// Admin Pages
import AdminDashboard from '../pages/AdminDashboard';
import ProductsManagement from '../pages/ProductsManagement';
import MasterDataManagement from '../pages/MasterDataManagement';
import AdminOffersMonitor from '../pages/AdminOffersMonitor';
import EmployeeManagement from '../pages/EmployeeManagement';
import PermissionsManagement from '../pages/PermissionsManagement';
import AdminSettingsPage from '../pages/AdminSettingsPage';
import UsersManagement from '../pages/UsersManagement';
import { Store, Layers, Zap, Box, Palette, Briefcase, Percent, FileText, AlertCircle, Bell } from 'lucide-react';

import { useSelector } from 'react-redux';
import { hasAdminAccess, hasPermission } from '../constants/adminPermissions';

const ProtectedRoute = ({ children, role = 'user' }) => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace />;
    }

    if (role === 'admin' && !hasAdminAccess(user)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

const AdminPermissionRoute = ({ children, permission }) => {
    const { user } = useSelector((state) => state.auth);

    if (permission && !hasPermission(user, permission)) {
        return <Navigate to="/admin" replace />;
    }

    return children;
};

const PresentationServiceRoute = () => {
    const { slug } = useParams();
    return <PresentationServicePage slug={slug} />;
};

const router = createBrowserRouter([
    {
        path: '/',
        element: <PresentationLayout />,
        errorElement: <RootErrorPage />,
        children: [
            { index: true, element: <PresentationHomePage /> },
            { path: 'despre', element: <PresentationAboutPage /> },
            { path: 'servicii', element: <PresentationServicesPage /> },
            { path: 'servicii/:slug', element: <PresentationServiceRoute /> },
            { path: 'portofoliu', element: <PresentationPortfolioPage /> },
            { path: 'media', element: <PresentationMediaPage /> },
            { path: 'contact', element: <PresentationContactPage /> },
        ],
    },
    {
        path: '/',
        element: <RootLayout />,
        errorElement: <RootErrorPage />,
        children: [
            { path: 'smart-home', element: <HomePage /> },
            { path: 'configurator', element: <ConfiguratorPage /> },
            { path: 'offers', element: <OffersListPage /> },
            { path: 'legal/terms', element: <TermsOfServicePage /> },
            { path: 'legal/privacy', element: <PrivacyPolicyPage /> },
            { path: 'legal/cookies', element: <CookiesPolicyPage /> },
        ],
    },
    {
        path: '/auth',
        element: <AuthLayout />,
        errorElement: <RootErrorPage />,
        children: [
            { path: 'login', element: <LoginPage /> },
            { path: 'register', element: <RegisterPage /> },
            { path: 'forgot-password', element: <ForgotPasswordPage /> },
            { path: 'reset-password', element: <ResetPasswordPage /> },
            { path: 'verify', element: <VerifyEmailPage /> },
            { path: 'verify-otp', element: <VerifyOtpPage /> },
            { path: 'choose-verification', element: <ChooseVerificationMethodPage /> },
            { index: true, element: <Navigate to="/auth/login" replace /> },
        ],
    },
    {
        path: '/dashboard',
        element: (
            <ProtectedRoute>
                <DashboardLayout />
            </ProtectedRoute>
        ),
        errorElement: <RootErrorPage />,
        children: [
            { index: true, element: <DashboardHome /> },
            { path: 'projects', element: <ProjectsListPage /> },
            { path: 'projects/:id', element: <ProjectDetailPage /> },
            { path: 'profile', element: <ProfilePage /> },
            { path: 'offers', element: <OffersListPage /> },
            { path: 'offers/:id', element: <OfferDetailPage /> },
            { path: 'settings', element: <ProfilePage /> },
        ],
    },
    {
        path: '/admin',
        element: (
            <ProtectedRoute role="admin">
                <AdminLayout />
            </ProtectedRoute>
        ),
        errorElement: <RootErrorPage />,
        children: [
            { index: true, element: <AdminDashboard /> },
            { path: 'products', element: <AdminPermissionRoute permission="view_hardware"><ProductsManagement /></AdminPermissionRoute> },
            { path: 'offers', element: <AdminPermissionRoute permission="view_offers"><AdminOffersMonitor /></AdminPermissionRoute> },
            { path: 'employees', element: <AdminPermissionRoute permission="manage_employees"><EmployeeManagement /></AdminPermissionRoute> },
            { path: 'users', element: <AdminPermissionRoute permission="manage_employees"><UsersManagement /></AdminPermissionRoute> },
            { path: 'permissions', element: <AdminPermissionRoute permission="manage_employees"><PermissionsManagement /></AdminPermissionRoute> },
            { path: 'building-types', element: <AdminPermissionRoute permission="view_master"><MasterDataManagement title="Building Types" entityName="Building Type" icon={Store} storeKey="buildingTypes" /></AdminPermissionRoute> },
            { path: 'room-types', element: <AdminPermissionRoute permission="view_master"><MasterDataManagement title="Room Types" entityName="Room Type" icon={Layers} storeKey="roomTypes" extraFields={[{ name: 'buildingTypes', label: 'Assigned Building Types', type: 'multiselect', sourceKey: 'buildingTypes' }]} /></AdminPermissionRoute> },
            { path: 'functions', element: <AdminPermissionRoute permission="view_master"><MasterDataManagement title="Smart Functions" entityName="Function" icon={Zap} storeKey="smartFunctions" extraFields={[
                { name: 'roomTypes', label: 'Assigned Room Types', type: 'multiselect', sourceKey: 'roomTypes' },
                { name: 'channelType', label: 'Scope / Logic Tier', type: 'select', options: [
                    {id: 'IN', name: 'IN (Per Room)'}, 
                    {id: 'OUT', name: 'OUT (Per Level)'}, 
                    {id: 'GENERAL', name: 'GENERAL (Per Project)'}
                ]},
                { name: 'inputChannelCount', label: 'Input Channels / Selection', type: 'number', placeholder: '0' },
                { name: 'outputChannelCount', label: 'Output Channels / Selection', type: 'number', placeholder: '0' },
                { name: 'generalChannelCount', label: 'General Channels / Selection', type: 'number', placeholder: '0' },
                { name: 'sortOrder', label: 'Display Order', type: 'number', placeholder: '0' },
                { name: 'icon', label: 'Visual Identity (Icon)', type: 'select', options: [
                    {id: 'Sun', name: 'Sun (Lighting)'},
                    {id: 'Thermometer', name: 'Thermometer (Climate)'},
                    {id: 'Shield', name: 'Shield (Security)'},
                    {id: 'Monitor', name: 'Monitor (AV/AV)'},
                    {id: 'Layers', name: 'Layers (Shading/Blinds)'},
                    {id: 'Zap', name: 'Zap (Energy)'},
                    {id: 'Key', name: 'Key (Access)'},
                    {id: 'Camera', name: 'Camera (Video)'},
                    {id: 'Droplets', name: 'Droplets (Water/Irrigation)'},
                    {id: 'Waves', name: 'Waves (Pool/Spa)'},
                    {id: 'Activity', name: 'Activity (Sensors)'}
                ]}
            ]} /></AdminPermissionRoute> },
            { path: 'ranges', element: <AdminPermissionRoute permission="view_hardware"><MasterDataManagement title="Product Ranges" entityName="Range" icon={Box} storeKey="productRanges" extraFields={[
                { name: 'imageUrl', label: 'Range Picture', type: 'image', placeholder: 'https://...', uploadEndpoint: '/admin/uploads/range-image' },
                { name: 'priceMultiplier', label: 'Range Price Multiplier', type: 'number', placeholder: '1.0' },
                { name: 'isVisible', label: 'Visible to customer', type: 'toggle', default: true }
            ]} /></AdminPermissionRoute> },
            { path: 'colors', element: <AdminPermissionRoute permission="view_hardware"><MasterDataManagement title="Device Colors" entityName="Color" icon={Palette} storeKey="colors" extraFields={[{ name: 'hex', label: 'Hex Code', type: 'text', placeholder: '#FFFFFF' }, { name: 'isVisible', label: 'Visible to customer', type: 'toggle', default: true }]} /></AdminPermissionRoute> },
            { path: 'services', element: <AdminPermissionRoute permission="view_hardware"><MasterDataManagement title="Professional Services" entityName="Service" icon={Briefcase} storeKey="services" extraFields={[
                { name: 'price', label: 'Service Price', type: 'number', placeholder: '0.00' },
                { name: 'type', label: 'Pricing Mode', type: 'select', options: [
                    {id: 'fixed_project', name: 'Fixed per Project'},
                    {id: 'per_room', name: 'Per Room'},
                    {id: 'per_level', name: 'Per Level'},
                    {id: 'per_product_qty', name: 'Per Product Quantity'},
                    {id: 'per_function_qty', name: 'Per Function Quantity'}
                ] },
                { name: 'smartFunctions', label: 'Assigned Smart Functions', type: 'multiselect', sourceKey: 'smartFunctions' },
                { name: 'isOptionalForCustomer', label: 'Optional for customer', type: 'toggle', default: true },
            ]} /></AdminPermissionRoute> },
            { path: 'discounts', element: <AdminPermissionRoute permission="manage_rules"><MasterDataManagement title="Discount Rules" entityName="Rule" icon={Percent} storeKey="discounts" extraFields={[{ name: 'minMultiplier', label: 'Min Units', type: 'number', placeholder: '0' }, { name: 'maxMultiplier', label: 'Max Units', type: 'number', placeholder: '1000' }, { name: 'discountPercent', label: 'Discount %', type: 'number', placeholder: '0' }, { name: 'isActive', label: 'Active', type: 'toggle', default: true }]} /></AdminPermissionRoute> },
            { path: 'conditions', element: <AdminPermissionRoute permission="manage_rules"><MasterDataManagement title="Offer Conditions" entityName="Condition" icon={FileText} storeKey="conditions" formFields={[
                { name: 'text', label: 'Condition Content Block', type: 'richtext', placeholder: 'Write the conditions...', required: true, fullWidth: true },
                { name: 'order', label: 'Display Order', type: 'number', placeholder: '0' },
                { name: 'isActive', label: 'Active', type: 'toggle', default: true }
            ]} /></AdminPermissionRoute> },
            { path: 'disclaimers', element: <AdminPermissionRoute permission="manage_rules"><MasterDataManagement title="Public Disclaimers" entityName="Disclaimer" icon={AlertCircle} storeKey="disclaimers" formFields={[
                { name: 'text', label: 'Disclaimer Content Block', type: 'richtext', placeholder: 'Write the disclaimer...', required: true, fullWidth: true },
                { name: 'order', label: 'Display Order', type: 'number', placeholder: '0' },
                { name: 'isActive', label: 'Active', type: 'toggle', default: true }
            ]} /></AdminPermissionRoute> },
            { path: 'followup-templates', element: <AdminPermissionRoute permission="manage_rules"><MasterDataManagement title="Follow-up Templates" entityName="Template" icon={Bell} storeKey="followupTemplates" formFields={[
                { name: 'name', label: 'Template Name', type: 'text', placeholder: 'e.g. Reminder #1 Email (EN)', required: true },
                { name: 'channel', label: 'Channel', type: 'select', options: [{id: 'email', name: 'Email'}, {id: 'sms', name: 'SMS'}], required: true },
                { name: 'step', label: 'Reminder Step', type: 'number', placeholder: '1', required: true },
                { name: 'language', label: 'Language', type: 'select', options: [{id: 'en', name: 'English'}, {id: 'ro', name: 'Romanian'}] },
                { name: 'subject', label: 'Email Subject (email only)', type: 'text', placeholder: 'Subject line...' },
                { name: 'body', label: 'Message Body', type: 'richtext', placeholder: 'Use {name}, {offerNumber}, {offerUrl}', required: true, fullWidth: true },
                { name: 'isActive', label: 'Active', type: 'toggle', default: true }
            ]} /></AdminPermissionRoute> },
            { path: 'offers/:id', element: <AdminPermissionRoute permission="view_offers"><OfferDetailPage /></AdminPermissionRoute> },
            { path: 'settings', element: <AdminSettingsPage /> },
        ],
    },
    {
        path: '*',
        element: <NotFoundPage />
    }
]);

export default function AppRouter() {
    return <RouterProvider router={router} />;
}

import { createBrowserRouter } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import ClientLayout from '../layouts/ClientLayout'
import DisplayLayout from '../layouts/DisplayLayout'
import KioskLayout from '../layouts/KioskLayout'
import PosLayout from '../layouts/PosLayout'
import CartPage from '../pages/CartPage'
import Checkout from '../pages/Checkout'
import Display from '../pages/Display'
import Home from '../pages/Home'
import Kiosk from '../pages/Kiosk'
import Menu from '../pages/Menu'
import OrderTracking from '../pages/OrderTracking'
import Pos from '../pages/Pos'
import AdminEmployees from '../pages/admin/AdminEmployees'
import AdminOrders from '../pages/admin/AdminOrders'
import AdminProducts from '../pages/admin/AdminProducts'
import AdminSchedule from '../pages/admin/AdminSchedule'
import AdminSettings from '../pages/admin/AdminSettings'
import Dashboard from '../pages/admin/Dashboard'
import NotFound from '../pages/NotFound'


export const router = createBrowserRouter([
  {
    element: <ClientLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/menu', element: <Menu /> },
      { path: '/panier', element: <CartPage /> },
      { path: '/commande', element: <Checkout /> },
      { path: '/commande/:orderId', element: <OrderTracking /> },
    ],
  },
  { element: <KioskLayout />, children: [{ path: '/borne', element: <Kiosk /> }] },
  { element: <PosLayout />, children: [{ path: '/caisse', element: <Pos /> }] },
  { element: <DisplayLayout />, children: [{ path: '/affichage', element: <Display /> }] },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'commandes', element: <AdminOrders /> },
      { path: 'produits', element: <AdminProducts /> },
      { path: 'employes', element: <AdminEmployees /> },
      { path: 'horaires', element: <AdminSchedule /> },
      { path: 'parametres', element: <AdminSettings /> },
    ],
  },
  { path: '*', element: <NotFound /> },
])

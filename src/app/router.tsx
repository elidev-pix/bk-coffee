import { createBrowserRouter } from 'react-router-dom'
import Pending from '../components/Pending'
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
import NotFound from '../pages/NotFound'

const L3 = 'Lot 3'

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
      { index: true, element: <Pending title="Dashboard" lot={L3} /> },
      { path: 'commandes', element: <Pending title="Commandes" lot={L3} /> },
      { path: 'produits', element: <Pending title="Produits" lot={L3} /> },
      { path: 'employes', element: <Pending title="Employés" lot={L3} /> },
      { path: 'horaires', element: <Pending title="Horaires" lot={L3} /> },
      { path: 'parametres', element: <Pending title="Paramètres" lot={L3} /> },
    ],
  },
  { path: '*', element: <NotFound /> },
])

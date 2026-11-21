import { createBrowserRouter } from 'react-router-dom'
import Pending from '../components/Pending'
import AdminLayout from '../layouts/AdminLayout'
import ClientLayout from '../layouts/ClientLayout'
import DisplayLayout from '../layouts/DisplayLayout'
import KioskLayout from '../layouts/KioskLayout'
import PosLayout from '../layouts/PosLayout'
import Home from '../pages/Home'
import NotFound from '../pages/NotFound'

const L2 = 'Lot 2'
const L3 = 'Lot 3'

export const router = createBrowserRouter([
  {
    element: <ClientLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/menu', element: <Pending title="Menu" lot={L2} /> },
      { path: '/panier', element: <Pending title="Panier" lot={L2} /> },
      { path: '/commande', element: <Pending title="Commande" lot={L2} /> },
      { path: '/commande/:orderId', element: <Pending title="Suivi de commande" lot={L2} /> },
    ],
  },
  { element: <KioskLayout />, children: [{ path: '/borne', element: <Pending title="Borne de commande" lot={L2} /> }] },
  { element: <PosLayout />, children: [{ path: '/caisse', element: <Pending title="Caisse POS" lot={L2} /> }] },
  { element: <DisplayLayout />, children: [{ path: '/affichage', element: <Pending title="Affichage public" lot={L2} /> }] },
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

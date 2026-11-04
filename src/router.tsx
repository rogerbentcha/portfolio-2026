import { createBrowserRouter } from 'react-router'
import { HomePage } from '@/pages/home/home-page'
import { NotFoundPage } from '@/pages/not-found/not-found-page'
import { RouteErrorPage } from '@/pages/route-error/route-error-page'
import { RootLayout } from '@/root-layout'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    ErrorBoundary: RouteErrorPage,
    children: [
      { index: true, Component: HomePage },
      { path: '*', Component: NotFoundPage },
    ],
  },
])

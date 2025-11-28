import Example from 'pages/Example';
import { useRoutes } from 'react-router';

export const PageRouter = () =>
  useRoutes([
    {
      path: '/',
      element: <Example />,
    },

    {
      path: '*',
      element: <Example />,
    },
  ]);

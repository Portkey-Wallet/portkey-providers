import { HashRouter } from 'react-router-dom';

export default function ContextProviders({
  children,
  pageType = 'Popup',
}: {
  children?: React.ReactNode;
  pageType?: 'Popup' | 'Prompt';
}) {
  return (
    <HashRouter>
      <div className={pageType}>{children}</div>
    </HashRouter>
  );
}

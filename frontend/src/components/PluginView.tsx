import { ButtonItem, ErrorBoundary, Focusable, PanelSection, PanelSectionRow } from '@decky/ui';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FaEyeSlash } from 'react-icons/fa';

import { useDeckyState } from './DeckyState';
import NotificationBadge from './NotificationBadge';
import { useQuickAccessVisible } from './QuickAccessVisibleState';
import TitleView from './TitleView';

interface PluginViewProps {
  desktop?: boolean;
  popup?: Window;
}

const PluginView: FC<PluginViewProps> = ({ desktop = false, popup }) => {
  const { plugins, hiddenPlugins, updates, activePlugin, pluginOrder, setActivePlugin, closeActivePlugin } =
    useDeckyState();
  const visible = useQuickAccessVisible() || desktop;
  const { t } = useTranslation();

  const pluginList = useMemo(() => {
    console.log('updating PluginView after changes');

    return [...plugins]
      .sort((a, b) => pluginOrder.indexOf(a.name) - pluginOrder.indexOf(b.name))
      .filter((p) => p.content)
      .filter(({ name }) => !hiddenPlugins.includes(name));
  }, [plugins, pluginOrder]);

  if (activePlugin) {
    return (
      <Focusable
        onCancelButton={closeActivePlugin}
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <TitleView desktop={desktop} popup={popup} />
        <div style={{ flexGrow: 1, paddingTop: '16px', overflowY: 'auto' }}>
          <ErrorBoundary>{(visible || activePlugin.alwaysRender) && activePlugin.content}</ErrorBoundary>
        </div>
      </Focusable>
    );
  }
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TitleView desktop={desktop} popup={popup} />
      <div
        style={{
          paddingTop: '16px',
          flexGrow: '1',
          overflowY: 'auto',
        }}
      >
        <PanelSection>
          {pluginList.map(({ name, icon }) => (
            <PanelSectionRow key={name}>
              <ButtonItem layout="below" onClick={() => setActivePlugin(name)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {icon}
                  <div>{name}</div>
                  <NotificationBadge show={updates?.has(name)} style={{ top: '-5px', right: '-5px' }} />
                </div>
              </ButtonItem>
            </PanelSectionRow>
          ))}
          {hiddenPlugins.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', marginTop: '10px' }}>
              <FaEyeSlash />
              <div>{t('PluginView.hidden', { count: hiddenPlugins.length })}</div>
            </div>
          )}
        </PanelSection>
      </div>
    </div>
  );
};

export default PluginView;

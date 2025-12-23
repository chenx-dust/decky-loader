import { DialogButton, Focusable, Navigation, staticClasses } from '@decky/ui';
import { CSSProperties, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { BsGearFill } from 'react-icons/bs';
import { FaArrowLeft, FaStore } from 'react-icons/fa';

import { useDeckyState } from './DeckyState';
import { TitleBar } from './desktop/TitleBar';

interface TitleViewProps {
  desktop?: boolean;
  popup?: Window;
}

const TitleView: FC<TitleViewProps> = ({ desktop, popup }) => {
  const { activePlugin, closeActivePlugin, setDesktopMenuOpen } = useDeckyState();
  const { t } = useTranslation();

  const titleBarStyles: CSSProperties = {
    height: 'min-content',
  };

  const titleStyles = {
    display: 'flex',
    paddingTop: desktop ? '30px' : '3px',
    paddingRight: '16px',
    position: 'sticky',
    top: '0px',
    '-webkit-app-region': 'drag',
  } as CSSProperties;

  const buttonStyles = {
    height: '28px',
    width: desktop ? '20px' : '40px',
    minWidth: 0,
    padding: desktop ? '' : '10px 12px',
    display: 'flex',
    alignItems: desktop ? 'center' : '',
    justifyContent: desktop ? 'center' : '',
    '-webkit-app-region': 'no-drag',
  } as CSSProperties;

  const onSettingsClick = () => {
    Navigation.Navigate('/decky/settings');
    Navigation.CloseSideMenus();
    setDesktopMenuOpen(false);
  };

  const onStoreClick = () => {
    Navigation.Navigate('/decky/store');
    Navigation.CloseSideMenus();
    setDesktopMenuOpen(false);
  };

  if (activePlugin === null) {
    return (
      <Focusable style={titleStyles} className={staticClasses.Title}>
        {popup && <TitleBar popup={popup} style={titleBarStyles} />}
        <div style={{ marginRight: 'auto', flex: 0.9 }}>Decky</div>
        <DialogButton
          style={buttonStyles}
          onClick={onStoreClick}
          onOKActionDescription={t('TitleView.decky_store_desc')}
        >
          <FaStore style={{ marginTop: '-4px', display: 'block' }} />
        </DialogButton>
        <DialogButton
          style={buttonStyles}
          onClick={onSettingsClick}
          onOKActionDescription={t('TitleView.settings_desc')}
        >
          <BsGearFill style={{ marginTop: '-4px', display: 'block' }} />
        </DialogButton>
      </Focusable>
    );
  }

  return (
    <Focusable className={staticClasses.Title} style={titleStyles}>
      {popup && <TitleBar popup={popup} style={titleBarStyles} />}
      <DialogButton style={buttonStyles} onClick={closeActivePlugin}>
        <FaArrowLeft style={{ marginTop: '-4px', display: 'block' }} />
      </DialogButton>
      {activePlugin?.titleView || <div style={{ flex: 0.9 }}>{activePlugin.name}</div>}
    </Focusable>
  );
};

export default TitleView;

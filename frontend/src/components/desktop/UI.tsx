import { CSSProperties, FC, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import DeckyIcon from '../DeckyIcon';
import { useDeckyState } from '../DeckyState';
import PluginView from '../PluginView';
import { CreatePopup, CreationFlags } from './Popup';

const DeckyDesktopUI: FC = () => {
  const { desktopMenuOpen, setDesktopMenuOpen } = useDeckyState();
  const [externalWindow, setExternalWindow] = useState<Window | null>(null);
  const [externalElement, setExternalElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (desktopMenuOpen) {
      if (!externalWindow || (externalWindow && externalWindow.closed)) {
        const popup = CreatePopup('DeckyPluginView', {
          dimensions: { width: 300, height: 600 },
          minWidth: 250,
          minHeight: 300,
          strRestoreDetails: '1',
          title: 'Decky Loader',
          eCreationFlags: CreationFlags.Resizable,
          owner_window: window,
          html_class: 'fullheight',
          body_class: 'fullheight DesktopUI',
          popup_class: 'fullheight',
        });

        if (popup && popup.popup) {
          const styleElement = popup.popup.document.createElement('style');
          styleElement.textContent = `
            button.DialogButton {
              padding: 0 12px;
            }
            body {
              overflow: hidden;
            }
          `;
          popup.popup.document.head.appendChild(styleElement);

          setExternalWindow(popup.popup);
          setExternalElement(popup.element || null);
          popup.popup.onbeforeunload = () => setDesktopMenuOpen(false);
        } else {
          // popup blocked or failed
          setDesktopMenuOpen(false);
        }
      }
    } else {
      if (externalWindow && !externalWindow.closed) {
        externalWindow.close();
        setExternalWindow(null);
        setExternalElement(null);
      }
    }

    return () => {
      if (externalWindow && !externalWindow.closed) {
        externalWindow.close();
      }
    };
  }, [desktopMenuOpen]);

  return (
    <>
      <style>
        {`
            .deckyDesktopIcon {
                color: #67707b;
            }
            .deckyDesktopIcon:hover {
                color: #fff;
            }
            `}
      </style>
      <DeckyIcon
        className="deckyDesktopIcon"
        width={24}
        height={24}
        onClick={() => setDesktopMenuOpen(!desktopMenuOpen)}
        style={
          {
            position: 'absolute',
            top: '36px', // nav text is 34px but 36px looks nicer to me
            right: '10px', // <- is 16px but 10px looks nicer to me
            width: '24px',
            height: '24px',
            cursor: 'pointer',
            transition: 'color 0.3s linear',
            '-webkit-app-region': 'no-drag',
          } as CSSProperties
        }
      />
      {externalWindow &&
        externalElement &&
        createPortal(<PluginView desktop={true} popup={externalWindow} />, externalElement)}
    </>
  );
};

export default DeckyDesktopUI;

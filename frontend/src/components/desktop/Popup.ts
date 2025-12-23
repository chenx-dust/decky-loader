export enum CreationFlags {
  None = 0,
  Minimized = 1 << 0, // 1
  Hidden = 1 << 1, // 2
  TooltipHint = 1 << 2, // 4
  NoTaskbarIcon = 1 << 3, // 8
  Resizable = 1 << 4, // 16
  ScalePosition = 1 << 5, // 32
  ScaleSize = 1 << 6, // 64
  Maximized = 1 << 7, // 128
  Composited = 1 << 8, // 256
  NotFocusable = 1 << 9, // 512
  FullScreen = 1 << 10, // 1024
  Fullscreen_Exclusive = 1 << 11, // 2048
  ApplyBrowserScaleToDimensions = 1 << 12, // 4096
  AlwaysOnTop = 1 << 13, // 8192
  NoWindowShadow = 1 << 14, // 16384
  NoMinimize = 1 << 15, // 32768
  PopUpMenuHint = 1 << 16, // 65536
  IgnoreSavedSize = 1 << 17, // 131072
  NoRoundedCorners = 1 << 18, // 262144
  ForceRoundedCorners = 1 << 19, // 524288
  OverrideRedirect = 1 << 20, // 1048576
  IgnoreSteamDisplayScale = 1 << 21, // 2097152
  TransparentParentWindow = 1 << 22, // 4194304
  DisableDPIScale = 1 << 23, // 8388608
  ForceBrowserVisible = 1 << 24, // 16777216
}

function getCurrentDocumentStyles(): Record<string, HTMLLinkElement> {
  const styleMap: Record<string, HTMLLinkElement> = {};
  document.querySelectorAll('link[rel="stylesheet"]').forEach((link: any) => {
    styleMap[link.href] = link;
  });
  return styleMap;
}

function syncStylesToWindow(targetWindow: Window, styleMap: Record<string, HTMLLinkElement>): void {
  updateDocumentStyles(targetWindow.document, styleMap, true);
}

function updateDocumentStyles(
  doc: Document,
  styleMap: Record<string, HTMLLinkElement>,
  bRemoveExisting: boolean,
): HTMLLinkElement[] {
  const newStyles = Object.assign({}, styleMap);
  const head = doc.getElementsByTagName('head')[0];
  const existingLinks = head.getElementsByTagName('link');

  for (let i = 0; i < existingLinks.length; ++i) {
    const link = existingLinks[i];
    if (newStyles[link.href]) {
      delete newStyles[link.href];
    } else if (bRemoveExisting && link.parentNode) {
      link.parentNode.removeChild(link);
    }
  }

  const addedLinks: HTMLLinkElement[] = [];
  for (const href in newStyles) {
    const sourceLink = newStyles[href];
    const newLink = doc.createElement('link');

    for (let j = 0; j < sourceLink.attributes.length; j++) {
      const attr = sourceLink.attributes.item(j);
      if (attr) newLink.setAttribute(attr.name, attr.value);
    }
    addedLinks.push(newLink);
  }

  head.prepend(...addedLinks);
  return addedLinks;
}

export interface PopupDimensions {
  width?: number;
  height?: number;
  left?: number;
  top?: number;
}

export interface TargetBrowser {
  m_unPID: number;
  m_nBrowserID: number;
  m_eBrowserType?: number | string;
}

interface SteamWindowContext extends Window {
  SteamClient: {
    Browser: {
      GetBrowserID: () => string | number;
    };
  };
}

export interface PopupOptions {
  dimensions?: PopupDimensions;
  title: string;
  eCreationFlags?: CreationFlags;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  target_browser?: TargetBrowser;
  browserType?: number | string;
  availscreenwidth?: number;
  availscreenheight?: number;
  strVROverlayKey?: string;
  strRestoreDetails?: string;
  window_opener_id?: string | number;
  parent_container_popup_id?: string | number;
  center_on_window?: SteamWindowContext;
  strUserAgent?: string;
  hwndParent?: string | number;
  bPinned?: boolean;
  bModal?: boolean;
  owner_window?: Window;
  html_class?: string;
  body_class?: string;
  body_role?: string;
  popup_class?: string;
}

export interface PopupResult {
  popup: Window;
  element: HTMLElement | null;
}

export const CreatePopup = (windowName: string, options: PopupOptions): PopupResult => {
  const dimensions = options.dimensions || {};
  const width = dimensions.width || 300;
  const height = dimensions.height || 300;
  const title = options.title;

  let windowFeatures = `width=${width},height=${height}`;
  if (dimensions.left !== undefined) {
    windowFeatures += `,left=${dimensions.left}`;
  }
  if (dimensions.top !== undefined) {
    windowFeatures += `,top=${dimensions.top}`;
  }
  windowFeatures += `,resizeable,status=0,toolbar=0,menubar=0,location=0`;

  let url = 'about:blank';
  const queryParams: string[] = [];

  queryParams.push(`createflags=${options.eCreationFlags}`);

  if (options.minWidth) queryParams.push(`minwidth=${options.minWidth}`);
  if (options.minHeight) queryParams.push(`minheight=${options.minHeight}`);

  if (options.maxWidth && options.maxWidth !== Infinity) {
    queryParams.push(`maxwidth=${options.maxWidth}`);
  }
  if (options.maxHeight && options.maxHeight !== Infinity) {
    queryParams.push(`maxheight=${options.maxHeight}`);
  }

  if (options.target_browser) {
    const browser = options.target_browser;
    queryParams.push(`pid=${browser.m_unPID}`);
    queryParams.push(`browser=${browser.m_nBrowserID}`);

    if (browser.m_eBrowserType) {
      queryParams.push(`browserType=${browser.m_eBrowserType}`);
    } else if (options.browserType) {
      queryParams.push(`browserType=${options.browserType}`);
    }

    if (options.availscreenwidth && options.availscreenheight) {
      queryParams.push(`screenavailwidth=${options.availscreenwidth}`);
      queryParams.push(`screenavailheight=${options.availscreenheight}`);
    }
  } else if (options.browserType) {
    queryParams.push(`browserType=${options.browserType}`);
  }

  if (options.strVROverlayKey) queryParams.push(`vrOverlayKey=${options.strVROverlayKey}`);
  if (options.strRestoreDetails) queryParams.push(`restoredetails=${options.strRestoreDetails}`);
  if (options.window_opener_id) queryParams.push(`openerid=${options.window_opener_id}`);
  if (options.parent_container_popup_id)
    queryParams.push(`parentcontainerpopupid=${options.parent_container_popup_id}`);

  if (options.center_on_window && dimensions.left === undefined && dimensions.top === undefined) {
    const parentBrowserID = options.center_on_window.SteamClient.Browser.GetBrowserID();
    queryParams.push(`centerOnBrowserID=${parentBrowserID}`);
  }

  if (options.strUserAgent) queryParams.push(`useragent=${options.strUserAgent}`);
  if (options.hwndParent) queryParams.push(`hwndParent=${options.hwndParent}`);
  if (options.bPinned) queryParams.push('pinned=true');
  if (options.bModal) queryParams.push('modal=true');

  if (queryParams.length > 0) {
    url += '?' + queryParams.join('&');
  }

  const ownerWindow = options.owner_window || window;
  const popupWindow = ownerWindow.open(url, windowName, windowFeatures);

  if (!popupWindow) {
    console.error(`Failed to create popup, browser/CEF may be blocking popups for "${window.location.origin}"`);
    return {} as PopupResult;
  }

  const htmlClassAttr = options.html_class ? `class="${options.html_class}"` : '';
  const bodyClassAttr = options.body_class ? `class="${options.body_class}"` : '';
  const bodyRoleAttr = options.body_role ? `role="${options.body_role}"` : '';
  const popupClassAttr = options.popup_class ? `class="${options.popup_class}"` : '';

  const documentContent = `
        <!DOCTYPE html>
        <html ${htmlClassAttr}>
            <head><title></title></head>
            <body ${bodyClassAttr} ${bodyRoleAttr}>
                <div id="popup_target" ${popupClassAttr}></div>
            </body>
        </html>`;

  popupWindow.document.write(documentContent);
  popupWindow.document.title = title;
  popupWindow.document.close();

  const currentStyles = getCurrentDocumentStyles();
  syncStylesToWindow(popupWindow, currentStyles);

  return {
    popup: popupWindow,
    element: popupWindow.document.getElementById('popup_target'),
  };
};

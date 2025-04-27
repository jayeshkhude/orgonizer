declare global {
  interface Window {
    gapi: {
      load: (api: string, callback: () => void) => void;
      client: {
        init: (config: {
          apiKey: string;
          clientId: string;
          discoveryDocs: string[];
          scope: string;
        }) => Promise<void>;
        drive: {
          files: {
            get: (params: { fileId: string; alt: string }) => Promise<{ body: Blob }>;
          };
        };
      };
      auth2: {
        getAuthInstance: () => {
          isSignedIn: {
            get: () => boolean;
          };
          signIn: () => Promise<void>;
          currentUser: {
            get: () => {
              getAuthResponse: () => {
                access_token: string;
              };
            };
          };
        };
      };
    };
    google: {
      picker: {
        PickerBuilder: new () => {
          addView: (viewId: any) => any;
          setOAuthToken: (token: string) => any;
          setDeveloperKey: (key: string) => any;
          setCallback: (callback: (data: any) => void) => any;
          build: () => {
            setVisible: (visible: boolean) => void;
          };
        };
        ViewId: {
          VIDEOS: any;
        };
        Action: {
          PICKED: string;
        };
      };
    };
  }
}

// This line is important to make the file a module
export {}; 
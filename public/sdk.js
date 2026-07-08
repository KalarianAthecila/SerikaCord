(function () {
  let config = {
    clientId: null,
    apiBaseUrl: window.location.origin,
    token: null,
  };

  const SerikaCord = {
    initialize(options = {}) {
      if (options.clientId) {
        config.clientId = options.clientId;
      }
      if (options.apiBaseUrl) {
        // Strip trailing slash if present
        config.apiBaseUrl = options.apiBaseUrl.replace(/\/$/, "");
      }
      // Attempt to load previously saved token from localStorage
      if (typeof window !== 'undefined' && config.clientId) {
        config.token = localStorage.getItem(`serikacord_token_${config.clientId}`) || null;
      }
      return this;
    },

    setToken(token) {
      config.token = token;
      if (typeof window !== 'undefined' && config.clientId) {
        if (token) {
          localStorage.setItem(`serikacord_token_${config.clientId}`, token);
        } else {
          localStorage.removeItem(`serikacord_token_${config.clientId}`);
        }
      }
    },

    getToken() {
      return config.token;
    },

    login(options = {}) {
      return new Promise((resolve, reject) => {
        if (!config.clientId) {
          return reject(new Error("SerikaCord SDK not initialized. Call initialize({ clientId }) first."));
        }

        const scopes = options.scopes || ["identify"];
        const redirectUri = options.redirectUri || `${config.apiBaseUrl}/oauth2/callback`;
        const state = options.state || "";

        const width = 500;
        const height = 680;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const authUrl = `${config.apiBaseUrl}/api/oauth2/authorize?client_id=${config.clientId}&scope=${encodeURIComponent(scopes.join(" "))}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token${state ? `&state=${encodeURIComponent(state)}` : ""}`;

        const popup = window.open(
          authUrl,
          "SerikaCord Authorization",
          `width=${width},height=${height},left=${left},top=${top},status=0,resizable=1`
        );

        if (!popup) {
          return reject(new Error("Popup blocked. Please enable popups to authenticate."));
        }

        const messageHandler = (event) => {
          // Verify message origin matches config.apiBaseUrl origin
          const expectedOrigin = new URL(config.apiBaseUrl).origin;
          if (event.origin !== expectedOrigin) return;

          const msg = event.data;
          if (msg && msg.type === "SERIKACORD_AUTH_CALLBACK") {
            const token = msg.data.access_token;
            if (token) {
              this.setToken(token);
              window.removeEventListener("message", messageHandler);
              resolve({ token, data: msg.data });
            } else {
              window.removeEventListener("message", messageHandler);
              reject(new Error("No access_token found in callback response."));
            }
          } else if (msg && msg.type === "SERIKACORD_AUTH_CANCEL") {
            window.removeEventListener("message", messageHandler);
            reject(new Error("User cancelled the authorization."));
          }
        };

        window.addEventListener("message", messageHandler);

        // Check if window gets closed by user
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener("message", messageHandler);
            // Give it a tiny delay in case message handler ran right before closing
            setTimeout(() => {
              if (!config.token) {
                reject(new Error("Authorization popup closed."));
              }
            }, 100);
          }
        }, 500);
      });
    },

    async request(path, options = {}) {
      if (!config.token) {
        throw new Error("No token available. Call login() first.");
      }

      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.token}`,
        ...options.headers,
      };

      const res = await fetch(`${config.apiBaseUrl}${path}`, {
        ...options,
        headers,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed with status ${res.status}`);
      }

      return res.json();
    },

    getUser() {
      return this.request("/api/users/@me");
    },

    getGuilds() {
      return this.request("/api/users/@me/guilds");
    },

    updatePresence(presenceData) {
      // presenceData can be: { activities: [ { name, details, ... } ] } OR a single activity object
      const body = presenceData.activities
        ? presenceData
        : { activities: [presenceData] };

      return this.request("/api/users/me/rich-presence", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },

    clearPresence() {
      return this.request("/api/users/me/rich-presence", {
        method: "DELETE",
      });
    }
  };

  // Export globally
  if (typeof window !== "undefined") {
    window.SerikaCord = SerikaCord;
  }
})();

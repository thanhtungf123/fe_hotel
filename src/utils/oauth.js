export function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

export function decodeJwt(token) {
  try {
    const [, payload] = token.split('.');
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

export async function googleGetProfile() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error('Thiếu VITE_GOOGLE_CLIENT_ID');

  await loadScript('https://accounts.google.com/gsi/client');

  return new Promise((resolve, reject) => {
    /* global google */
    /* eslint-disable no-undef */
    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'openid email profile',
      callback: (resp) => {
        if (!resp || !resp.access_token) return reject(new Error('Không lấy được access token'));
        // Prefer ID token flow to read name/picture/email
        try {
          const idClient = google.accounts.id;
          if (idClient) {
            // Use one-tap to get ID token silently if possible
          }
        } catch {}
        // Fallback: call userinfo endpoint
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${resp.access_token}` },
        })
          .then(r => r.ok ? r.json() : Promise.reject(new Error('Lỗi lấy hồ sơ Google')))
          .then(profile => {
            resolve({
              provider: 'google',
              providerId: profile.sub,
              email: profile.email,
              fullName: profile.name,
              avatarUrl: profile.picture,
            });
          })
          .catch(reject);
      },
    });
    client.requestAccessToken();
  });
}

export async function facebookGetProfile() {
  const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
  if (!appId) throw new Error('Thiếu VITE_FACEBOOK_APP_ID');

  // Load SDK
  await loadScript('https://connect.facebook.net/en_US/sdk.js');

  return new Promise((resolve, reject) => {
    window.fbAsyncInit = function () {
      window.FB.init({ appId, cookie: true, xfbml: false, version: 'v19.0' });
      doLogin();
    };

    function doLogin() {
      window.FB.login((response) => {
        if (response.status === 'connected') {
          const { accessToken } = response.authResponse;
          window.FB.api('/me', { fields: 'id,name,email,picture.type(large)' }, (profile) => {
            if (!profile || profile.error) return reject(new Error('Lỗi lấy hồ sơ Facebook'));
            resolve({
              provider: 'facebook',
              providerId: profile.id,
              email: profile.email || '',
              fullName: profile.name,
              avatarUrl: profile?.picture?.data?.url,
            });
          });
        } else {
          reject(new Error('Người dùng hủy Facebook login'));
        }
      }, { scope: 'public_profile,email' });
    }
  });
}







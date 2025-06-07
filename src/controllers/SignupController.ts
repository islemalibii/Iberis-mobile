import { ref } from "vue";
import { useRouter } from "vue-router";
import { signup } from "@/services/authentification";
import { AxiosError} from "axios"; 

interface GoogleAccountsId {
  initialize(config: {
    client_id: string;
    callback: (response: { credential: string }) => void;
    ux_mode?: "popup" | "redirect";
    scope?: string;
    response_type?: string;
    prompt?: string;
  }): void;
  renderButton(element: HTMLElement, options: {
    theme: "outline" | "filled_blue" | "filled_black";
    size: "large" | "medium" | "small";
    width?: string;
  }): void;
}

interface GoogleAccounts {
  id: GoogleAccountsId;
}

interface GoogleWindow extends Window {
  google: {
    accounts: GoogleAccounts;
  };
}

interface FacebookUserInfo {
  name: string;
  email?: string;
  id: string;
  [key: string]: any;
}

interface FacebookAuthResponse {
  accessToken: string;
  [key: string]: any;
}
interface FacebookLoginResponse {
  status: "connected" | "not_authorized" | "unknown";
  authResponse?: FacebookAuthResponse;
}


interface FB {
  init(config: {
    appId: string;
    cookie: boolean;
    xfbml: boolean;
    version: string;
    status: boolean;
    autoLogAppEvents: boolean;
  }): void;
  api(path: string, callback: (response: FacebookUserInfo | { error: any }) => void): void;
  Event: {
    subscribe(event: "auth.statusChange", callback: (response: FacebookLoginResponse) => void): void;
  };
  XFBML: {
    parse(): void;
  };
}

declare global {
  interface Window extends GoogleWindow {
    FB: FB;
  }
}
interface GoogleSignInResponse {
  credential: string;
}
export function useSignupController() {
  const name = ref("");
  const email = ref("");
  const password = ref("");
  const acceptTerms = ref(false);
  const errorMessage = ref("");
  const captchaToken = ref("");
  const router = useRouter();

  const setCaptchaToken = (token: string) => {
    captchaToken.value = token;
  };


  const checkConditions = () => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value || !name.value || !password.value) {
      errorMessage.value = "Fill all the fields.";
      return false;
    }
    if (!name.value || name.value.length < 3 || name.value.length > 50) {
      errorMessage.value = "Full name must be between 3-50 characters.";
      return false;
    }
    if (!email.value || !regex.test(email.value)) {
      errorMessage.value = "Please enter a valid email address.";
      return false;
    }
    if (!password.value || password.value.length < 6) {
      errorMessage.value = "Password must be at least 6 characters long.";
      return false;
    }
    if (!acceptTerms.value) {
      errorMessage.value = "You must accept the terms and conditions";
      return false;
    }
    return true;
  };
  const Signup = async () => {
    if (!checkConditions()) return;
    try {
      const response = await signup(
        {
          name: name.value,
          email: email.value,
          password: password.value,
          terms: true,
          "h-captcha-response": captchaToken,

        },
      );

      if (response.data.status?.code === 402) {
        errorMessage.value = "Email is already in use. Please try another one.";
        return;
      }

      if (response.data.status?.code === 403) {
        console.log("Signup successful:", response.data);
        console.log("Verification Code:", response.data.data?.user?.validation);
        router.push({
          path: "/verify",
          query: {
            email: email.value,
            hashedId: response.data.data?.user?.hashed_id,
          },
        });
        return;
      }
    } catch (error: unknown) {
      console.error("Signup failed:", error);
      if (error instanceof AxiosError) {
        if (error.response && error.response.status === 422) {
          const errors = error.response.data.errors || {};
          if (errors.email) {
            errorMessage.value = "This email is already registered.";
          } else {
            errorMessage.value = "Validation failed. Please check your input.";
          }
        }
      }
    }
  };
  const handleGoogleSignUp = async (response: GoogleSignInResponse) => {
    const idToken = response.credential;
    if (!idToken) {
      errorMessage.value = "Google authentication failed.";
      return;
    }
    if (!acceptTerms.value) {
      errorMessage.value = "You must accept the terms and conditions";
      return;
    }
    const userPayload = JSON.parse(atob(idToken.split(".")[1]));
    const userData = {
      name: userPayload.name,
      email: userPayload.email,
      password: "google_oauth",
      terms: true,
      google_id: userPayload.sub,
      idToken,
    };

    try {
      const res = await signup(userData);
      const responseData = await res.data;
      console.log("Backend Response:", responseData, "Status:", res.status);

      if (res.status === 402) {
        errorMessage.value = "This email is already registered. Please log in.";
        return;
      }

      if (res.status === 403 || responseData.status?.code === 403) {
        errorMessage.value = "Signup successful! Please verify your email.";
        console.log("Verification Code:", responseData.data?.user?.validation);
        router.push({
          path: "/verify",
          query: {
            email: userPayload.email,
            hashedId: responseData.data?.user?.hashed_id,
          },
        });
        return;
      }

      if (res.status === 422 || responseData.status?.code === 422) {
        errorMessage.value = "Signup failed: Missing required information.";
        return;
      }
      if (res.status !== 200) {
        errorMessage.value = responseData.message || "Signup failed. Please try again.";
        return;
      }
    } catch (error) {
      console.error("Signup error:", error);
      errorMessage.value = "Network error. Please try again.";
    }
  };



  const handleFacebookLogin = async (signupResponse: FacebookLoginResponse) => {
    if (signupResponse.status === "connected") {
      try {
        if (!acceptTerms.value) {
          throw new Error("You must accept the terms and conditions");
        }
        if (!signupResponse.authResponse) {
          throw new Error("No authentication response from Facebook");
        }
        const { accessToken } = signupResponse.authResponse;
        const fbUserInfo = await new Promise<FacebookUserInfo>((resolve, reject) => {
          window.FB.api("/me?fields=name,email", (apiresponse: FacebookUserInfo | { error: any }) => {
            if (!apiresponse || "error" in apiresponse) {
              reject(apiresponse?.error || new Error("Failed to fetch Facebook profile"));
            } else {
              resolve(apiresponse);
            }
          });
        });

        console.log("Facebook User Info:", fbUserInfo);

        if (!fbUserInfo.email) {
          const manualEmail: string | null = prompt("Veuillez entrer votre adresse email:");
          if (!manualEmail) {
            throw new Error("Email is required to complete registration");
          }
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(manualEmail)) {
            throw new Error("Veuillez entrer une adresse email valide");
          }
          fbUserInfo.email = manualEmail;
        }
        const randomPassword = window.crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
        const userData = {
          name: fbUserInfo.name,
          email: fbUserInfo.email,
          password: randomPassword,
          terms: true,
          facebook_id: fbUserInfo.id,
          accessToken,
        };
        const res = await signup(userData);
        const data = await res.data;

        
        if (res.data.status?.code === 402) {
          throw new Error("Email is already in use. Try another one.");
        }
        if (res.data.status?.code !== 403) {
          const errorMsg = data.errors?.email?.[0] || data.status?.message;
          throw new Error(errorMsg || "Erreur d'inscription Facebook");
        }

        if (data.status?.code === 403) {
          errorMessage.value = "Signup successful! Please verify your email.";
          console.log("Verification Code:", data.data?.user?.validation);
          router.push({
            path: "/verify",
            query: {
              email: fbUserInfo.email,
              hashedId: data.data?.user?.hashed_id,
            },
          });
          return;
        }
        console.log("Inscription Facebook réussie:", data);
        router.push("/login");
      } catch (error: unknown) {
        errorMessage.value = error instanceof Error ? error.message: "Facebook login failed. Please try again.";
        console.error("Erreur Facebook:", error);
      }
    } else {
      errorMessage.value = "Échec de la connexion Facebook. Veuillez réessayer.";
    }
  };


  const initializeSocialLogins = () => {
    const googleScript = document.createElement("script");
    googleScript.src = "https://accounts.google.com/gsi/client";
    googleScript.async = true;
    googleScript.onload = () => {
      const googleButton = document.getElementById("google-button");
      if (googleButton && !googleButton.hasChildNodes()) {
        window.google.accounts.id.initialize({
          client_id: "543531980890-o7btiuq1iod2423htc4c3av4i6l4j28h.apps.googleusercontent.com",
          callback: handleGoogleSignUp,
          ux_mode: "popup",
          scope: "openid email profile",
          response_type: "id_token",
          prompt: "select_account",
        });
        window.google.accounts.id.renderButton(googleButton, {
          theme: "outline",
          size: "large",
          width: "220",
        });
      }else {
        console.warn("Google button element not found or already initialized");
      }
    };
    document.head.appendChild(googleScript);

    const facebookScript = document.createElement("script");
    facebookScript.src = "https://connect.facebook.net/en_US/sdk.js";
    facebookScript.async = true;
    facebookScript.onload = () => {
      console.log("Facebook SDK loaded successfully");
      if (window.FB) {
        console.log("FB object exists");
        window.FB.init({
          appId: "507777845320852",
          cookie: true,
          xfbml: true,
          version: "v15.0",
          status: true,
          autoLogAppEvents: true,
        });
        window.FB.Event.subscribe("auth.statusChange", handleFacebookLogin);
        window.FB.XFBML.parse();
      } else {
        console.error("FB object not found");
      }
    };
    document.head.appendChild(facebookScript);
  };

  return {
    name,
    email,
    password,
    acceptTerms,
    errorMessage,
    setCaptchaToken,
    Signup, 
    handleGoogleSignUp,
    handleFacebookLogin,
    initializeSocialLogins,
  };
}
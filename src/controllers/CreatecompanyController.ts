import { ref, computed } from 'vue';
import { fetchActivities, fetchCountries, fetchCurrencies, fetchAccountingPeriods, createCompany } from '@/services/Createcompany';
import { Activity, CompanyFormData, Country, Currency, AccountingPeriod } from '@/models/CreatCompanyModel';
import { useRouter } from 'vue-router';
import { Preferences } from '@capacitor/preferences';


export const CreateCompanyForm = () => {
    const router = useRouter();
    const page = ref(1);
    const form = ref<CompanyFormData>({
      title: "",
      logo: null,
      country_id: "",
      activity_id: "",
      default_currency_id: "",
      accounting_period_id: "",
      language: "english", 
      address: "",
      state: "", 
      zip_code: "", 
      fiscal_id: "", 
      phone: ""
    });
    const activities = ref<Activity[]>([]);
    const error = ref<string | null>(null);
    const countries = ref<Country[]>([]);
    const currencies = ref<Currency[]>([]);
    const accountings = ref<AccountingPeriod[]>([]);

    const logoPreview = computed(() => {
      if (form.value.logo) {
        return URL.createObjectURL(form.value.logo);
      }
      return null;
    });
    const triggerFileInput = () => {
      document.getElementById('logo-upload')?.click();
    };
    const handleLogoUpload = (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files[0]) {
        form.value.logo = input.files[0];
      }
    };
    const removeLogo = () => {
      form.value.logo = null;
      const input = document.getElementById('logo-upload') as HTMLInputElement;
      if (input) input.value = '';
    };
    const loadActivities = async () => {
      error.value = null;
      try {
        const activity  = await fetchActivities();
        activities.value = activity?.data?.data?.activities || [];
        console.log("Activities:", activities.value);
        if (!activities.value.length) {
            console.warn("Empty activities list - API response:", activity);
        }
        if (activity.status === 400) {
            console.error("Authorization erronée.");
            router.push('/login');
            return;
        }
        if (activity.status === 401) {
            console.error("Votre compte manque d'un abonnement actif.");
            router.push('/login');
            return;
        }
        if (activity.status === 405) {
            console.error("Authorization manquante.");
            router.push('/login');
            return;
        }
        if (activity.status === 404) {
            error.value = "No activities available";
        }
      } catch (err : any) {
        error.value = err.message;
        console.error('API Error:', err);
      }
    };
    const loadCountries = async () => {
      error.value = null;
      try {
        const country  = await fetchCountries();
        countries.value = country?.data?.data?.countries || [];
        console.log("Counties:", countries.value);
        if (!countries.value.length) {
            console.warn("Empty activities list - API response:", country);
        }
        if (country.status === 400) {
            console.error("Authorization erronée.");
            router.push('/login');
            return;
        }
        if (country.status === 401) {
            console.error("Votre compte manque d'un abonnement actif.");
            router.push('/login');
            return;
        }
        if (country.status === 405) {
            console.error("Authorization manquante.");
            router.push('/login');
            return;
        }
        if (country.status === 402) {
            error.value = "	Non authorisé à accéder a cette société.";
        }
      } catch (err : any) {
        error.value = err.message;
        console.error('API Error:', err);
      }
    };
    const loadCurrencies = async () => {
      error.value = null;
      try {
        const currency  = await fetchCurrencies();
        currencies.value = currency?.data?.data?.currencies || [];
        console.log("Currencies:", currencies.value);
        if (!activities.value.length) {
            console.warn("Empty activities list - API response:", currency);
        }
        if (currency.status === 400) {
            console.error("Authorization erronée.");
            router.push('/login');
            return;
        }
        if (currency.status === 401) {
            console.error("Votre compte manque d'un abonnement actif.");
            router.push('/login');
            return;
        }
        if (currency.status === 405) {
            console.error("Authorization manquante.");
            router.push('/login');
            return;
        }
        if (currency.status === 404) {
            error.value = "No activities available";
        }
      } catch (err : any) {
        error.value = err.message;
        console.error('API Error:', err);
      }
    };
    const loadAccountingPeriod = async () => {
      error.value = null;
      try {
        const accounting  = await fetchAccountingPeriods();
        accountings.value = accounting?.data?.data?.accountingPeriods || [];
        console.log("Accountings:", accountings.value);
        if (!activities.value.length) {
            console.warn("Empty activities list - API response:", accounting);
        }
        if (accounting.status === 400) {
            console.error("Authorization erronée.");
            router.push('/login');
            return;
        }
        if (accounting.status === 401) {
            console.error("Votre compte manque d'un abonnement actif.");
            router.push('/login');
            return;
        }
        if (accounting.status === 405) {
            console.error("Authorization manquante.");
            router.push('/login');
            return;
        }
        if (accounting.status === 404) {
            error.value = "No activities available";
        }
      } catch (err : any) {
        error.value = err.message;
        console.error('API Error:', err);

      }
    };
  const nextPage1 = () => (page.value = 2);
  const nextPage2 = () => (page.value = 3);
  const validateForm = () => {
    if (!form.value.title) return "Company name is required";
    if (!form.value.country_id) return "Country is required";
    if (!form.value.activity_id) return "Activity is required";
    if (!form.value.default_currency_id) return "Currency is required";
    if (!form.value.accounting_period_id) return "Accounting period is required";
    return null;
  };
  const storeCompanyId = async (id: string | number): Promise<void> => {
    try {
      await Preferences.set({
        key: 'hashed_id"',
        value: id.toString() 
      });
      console.debug('Company ID stored securely');
      
      const { value } = await Preferences.get({ key: 'current_company_id' });
      if (value !== id.toString()) {
        throw new Error('Storage verification failed');
      }
    } catch (error) {
      console.error('Company ID storage failed:', error);
      throw new Error('Failed to persist company ID');
    }
  };
  const submitForm = async () => {
    const validationError = validateForm();
    if (validationError) {
      error.value = validationError;
      return;
    }
    try {
      if (!form.value.title || !form.value.country_id || !form.value.activity_id || 
        !form.value.default_currency_id || !form.value.accounting_period_id) {
        error.value = "Please fill all required fields";
        return;
      }
      console.log("Submitting:", JSON.parse(JSON.stringify(form.value))); 
      const response = await createCompany({
        title: form.value.title,
        logo: form.value.logo,
        country_id: form.value.country_id,
        activity_id: form.value.activity_id,
        default_currency_id: form.value.default_currency_id,
        accounting_period_id: form.value.accounting_period_id,
        language: form.value.language || "english",
        address: form.value.address,
        state: form.value.state,
        zip_code: form.value.zip_code,
        fiscal_id: form.value.fiscal_id,
        phone: form.value.phone
      });
      console.log("API Response:", response); 
      if (!response) {
        error.value = "No response from server";
        return;
      }
      if (response.data.status?.code === 200) {
        const companyId = response.data.data.id;
        if (!companyId) {
          throw new Error("Company created but no ID returned");
        }
        await storeCompanyId(companyId);
        console.log("Company created successfully! ID:", companyId);
        router.push('/invoices'); 
      }
      if (response.data.status?.code === 400) {
        console.log("Invalid input data!");
        router.push('/home'); 
      }
      if (response.data.status?.code === 501) {
        console.log("You have reached the maximum number of companies allowed !");
        router.push('/payments'); 
      }
       else {
        error.value = response.data.status?.message || "Failed to create company";
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      error.value = err instanceof Error ? err.message : "An unknown error occurred";
    }
  };

  return {
    page,
    form,
    activities,
    countries,
    currencies,
    accountings,
    error,
    logoPreview,
    triggerFileInput,
    handleLogoUpload,
    removeLogo,
    loadActivities,
    nextPage1,
    nextPage2,
    submitForm,
    loadCountries,
    loadCurrencies,
    loadAccountingPeriod
  };
};
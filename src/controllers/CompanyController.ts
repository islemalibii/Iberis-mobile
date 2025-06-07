import { ref, computed } from 'vue';
import { fetchActivities, fetchCountries, fetchCurrencies, fetchAccountingPeriods, createCompany, getAuthToken, fetchCompanyDetails, updateCompany } from '@/services/Company';
import { Activity, CompanyFormData, Country, Currency, AccountingPeriod } from '@/models/CompanyModel';
import { useRouter } from 'vue-router';
import { Preferences } from '@capacitor/preferences';
import { getUserCompanies } from '@/services/User';



const storeCompanyId = async (companyId: string): Promise<void> => {
  try {
    await Preferences.set({ key: 'current_company_id', value: companyId });
    console.log('Stored company ID:', companyId);
  } catch (error) {
    console.error('Company ID storage error:', error);
    throw new Error('Failed to store company ID');
  }
};
export const CompanyForm = () => {
  const router = useRouter();
  const page = ref(1);
  const existingLogoUrl = ref<string | null>(null);
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
  
  const createNewCompany  = async () => {
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
      console.log("RAW API RESPONSE:", response);

      if (!response.data?.data?.company) {
        console.error("Malformed API response - missing company data");

        throw new Error("Server returned incomplete data");
      }
      const statusCode = response.data.status.code;
      const token = await getAuthToken(); 
      const userCompany = await getUserCompanies.fetchAndStoreUserCompanies(token);
      console.log('Owned companies:', userCompany.owned_companies);
      if (!userCompany.owned_companies || userCompany.owned_companies.length === 0) {
        throw new Error('No companies found for this user');
      }
      if (statusCode === 200) {
        if (!userCompany.owned_companies || userCompany.owned_companies.length === 0) {
          throw new Error('No companies found for this user');
        }
        const firstCompanyId = userCompany.owned_companies[0].company.hashed_id;
        await storeCompanyId(firstCompanyId);
        console.log("Company created successfully!");
        router.push('/invoices'); 
      }
      if (statusCode === 400) {
        console.log("Invalid input data!");
        router.push('/home'); 
      }
      if (statusCode === 501) {
        console.log("You have reached the maximum number of companies allowed !");
        router.push('/payments'); 
      }
       else {
        error.value = response.data.data.status?.message || "Failed to create company";
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      error.value = err instanceof Error ? err.message : "An unknown error occurred";
    }
  };

  const loadCompanyData = async () => {
    try {
      const savedCompanyId = await Preferences.get({ key: 'current_company_id' });
      
      if (savedCompanyId.value) {
        const response = await fetchCompanyDetails();
        const company = response?.data?.data?.company;
        
        if (company) {
          
          form.value.title = company.title || "";
          form.value.fiscal_id = company.fiscal_id || "";
          form.value.address = company.address || "";
          form.value.state = company.state || "";
          form.value.zip_code = company.zip_code || "";
          form.value.phone = company.phone || "";
          form.value.language = company.language || "english";
          form.value.country_id = company.hashed_country_id || "";
          form.value.activity_id = company.hashed_activity_id || "";
          form.value.default_currency_id = company.hashed_default_currency_id || "";
          form.value.accounting_period_id = company.hashed_accounting_period_id || "";
          if (company.logo) {
            existingLogoUrl.value = company.logo;
          }
          
          console.log("Company data loaded successfully");
        }
      }
    } catch (err) {
      console.error("Error loading company data:", err);
    }
  };

  const updateExistingCompany = async () => {
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

      console.log("Updating company:", form.value);
      
      const formData = new FormData();
      formData.append('title', form.value.title);
      formData.append('country_id', form.value.country_id);
      formData.append('activity_id', form.value.activity_id);
      formData.append('default_currency_id', form.value.default_currency_id);
      formData.append('accounting_period_id', form.value.accounting_period_id);
      
      if (form.value.language) formData.append('language', form.value.language);
      if (form.value.address) formData.append('address', form.value.address);
      if (form.value.state) formData.append('state', form.value.state);
      if (form.value.zip_code) formData.append('zip_code', form.value.zip_code);
      if (form.value.fiscal_id) formData.append('fiscal_id', form.value.fiscal_id);
      if (form.value.phone) formData.append('phone', form.value.phone);
      if (form.value.logo instanceof File) {
        formData.append('logo', form.value.logo);
      } else if (existingLogoUrl.value === null) {
        formData.append('logo', '');
      }
      
      const response = await updateCompany(formData);
      
      if (response.data?.status?.code === 200) {
        console.log("Company updated successfully!");
        router.push('/invoices');
      } else {
        error.value = response.data?.status?.message || "Failed to update company";
      }
    } catch (err) {
      console.error("Error updating company:", err);
      error.value = err instanceof Error ? err.message : "An unknown error occurred";
    }
  };

  // Load all dropdown data (can be used on both create and edit pages)
  const loadAllDropdownData = async () => {
    await Promise.all([
      loadActivities(),
      loadCountries(),
      loadCurrencies(),
      loadAccountingPeriod()
    ]);
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
    existingLogoUrl,
    triggerFileInput,
    handleLogoUpload,
    removeLogo,
    loadActivities,
    nextPage1,
    nextPage2,
    createNewCompany,
    loadCountries,
    loadCurrencies,
    loadAccountingPeriod,
    updateExistingCompany,
    loadCompanyData,
    loadAllDropdownData
  };
};
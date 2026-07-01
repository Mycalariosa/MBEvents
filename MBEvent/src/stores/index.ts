import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Package, PackageInclusion, WizardSelection } from '@/src/types/database';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setDark: (dark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      toggleTheme: () => set((s) => ({ isDark: !s.isDark })),
      setDark: (dark) => set({ isDark: dark }),
    }),
    { name: 'mbevents-theme', storage: createJSONStorage(() => AsyncStorage) }
  )
);

interface WizardState {
  eventType: string;
  packageId: string | null;
  selectedPackage: Package | null;
  packageInclusions: PackageInclusion[];
  guestCount: number;
  eventDate: string | null;
  eventTime: string | null;
  eventAddress: string;
  themeColor: string;
  specialRequests: string;
  customerName: string;
  contactNumber: string;
  email: string;
  selections: WizardSelection[];
  additionalRequests: string;
  currentStep: number;
  setEventType: (type: string) => void;
  setPackage: (pkg: Package) => void;
  setPackageInclusions: (inclusions: PackageInclusion[]) => void;
  setGuestCount: (count: number) => void;
  setEventDate: (date: string) => void;
  setEventTime: (time: string) => void;
  setEventAddress: (address: string) => void;
  setThemeColor: (color: string) => void;
  setSpecialRequests: (text: string) => void;
  setCustomerName: (name: string) => void;
  setContactNumber: (phone: string) => void;
  setEmail: (email: string) => void;
  addSelection: (selection: WizardSelection) => void;
  setAdditionalRequests: (text: string) => void;
  setCurrentStep: (step: number) => void;
  reset: () => void;
}

const initialWizardState = {
  eventType: '',
  packageId: null,
  selectedPackage: null,
  packageInclusions: [] as PackageInclusion[],
  guestCount: 50,
  eventDate: null,
  eventTime: null,
  eventAddress: '',
  themeColor: '',
  specialRequests: '',
  customerName: '',
  contactNumber: '',
  email: '',
  selections: [] as WizardSelection[],
  additionalRequests: '',
  currentStep: 0,
};

export const useWizardStore = create<WizardState>((set) => ({
  ...initialWizardState,
  setEventType: (eventType) => set({ eventType }),
  setPackage: (pkg) => set({ packageId: pkg.id, selectedPackage: pkg }),
  setPackageInclusions: (packageInclusions) => set({ packageInclusions }),
  setGuestCount: (guestCount) => set({ guestCount }),
  setEventDate: (eventDate) => set({ eventDate }),
  setEventTime: (eventTime) => set({ eventTime }),
  setEventAddress: (eventAddress) => set({ eventAddress }),
  setThemeColor: (themeColor) => set({ themeColor }),
  setSpecialRequests: (specialRequests) => set({ specialRequests }),
  setCustomerName: (customerName) => set({ customerName }),
  setContactNumber: (contactNumber) => set({ contactNumber }),
  setEmail: (email) => set({ email }),
  addSelection: (selection) =>
    set((s) => ({
      selections: [
        ...s.selections.filter((x) => x.serviceType !== selection.serviceType),
        selection,
      ],
    })),
  setAdditionalRequests: (additionalRequests) => set({ additionalRequests }),
  setCurrentStep: (currentStep) => set({ currentStep }),
  reset: () => set(initialWizardState),
}));

interface GenericBookingState {
  supplierId: string | null;
  supplierName: string | null;
  serviceType: string | null;
  packageName: string | null;
  packagePrice: number;
  eventDate: string | null;
  eventTime: string | null;
  additionalRequests: string;
  setSupplier: (id: string, name: string, type: string) => void;
  setPackageInfo: (name: string, price: number) => void;
  setEventDate: (date: string) => void;
  setEventTime: (time: string) => void;
  setAdditionalRequests: (text: string) => void;
  reset: () => void;
}

export const useGenericBookingStore = create<GenericBookingState>((set) => ({
  supplierId: null,
  supplierName: null,
  serviceType: null,
  packageName: null,
  packagePrice: 0,
  eventDate: null,
  eventTime: null,
  additionalRequests: '',
  setSupplier: (supplierId, supplierName, serviceType) =>
    set({ supplierId, supplierName, serviceType }),
  setPackageInfo: (packageName, packagePrice) => set({ packageName, packagePrice }),
  setEventDate: (eventDate) => set({ eventDate }),
  setEventTime: (eventTime) => set({ eventTime }),
  setAdditionalRequests: (additionalRequests) => set({ additionalRequests }),
  reset: () =>
    set({
      supplierId: null,
      supplierName: null,
      serviceType: null,
      packageName: null,
      packagePrice: 0,
      eventDate: null,
      eventTime: null,
      additionalRequests: '',
    }),
}));

interface AdminViewState {
  bookingFilter?: string | undefined;
  setBookingFilter: (status?: string) => void;
  bookingCustomerId?: string | undefined;
  setBookingCustomerId: (id?: string) => void;
}

export const useAdminViewStore = create<AdminViewState>((set) => ({
  bookingFilter: undefined,
  setBookingFilter: (status) => set({ bookingFilter: status }),
  bookingCustomerId: undefined,
  setBookingCustomerId: (id) => set({ bookingCustomerId: id }),
}));

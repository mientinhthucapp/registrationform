import { useState, useEffect, useCallback } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import FormBanner from '@/components/FormBanner';
import CoverPage from '@/components/CoverPage';
import PersonalInfoPage from '@/components/PersonalInfoPage';
import HealthPage from '@/components/HealthPage';
import AccommodationPage from '@/components/AccommodationPage';
import PaymentPage from '@/components/PaymentPage';
import ThankYouPage from '@/components/ThankYouPage';
import { initialFormData, MAX_CAPACITY, calculateTotal, PAGE_BG_URL } from '@/lib/formTypes';
import type { FormData } from '@/lib/formTypes';
import { submitRegistration } from 'zite-endpoints-sdk';
import type { SubmitRegistrationOutputType } from 'zite-endpoints-sdk';
import { getRegistrationCount } from 'zite-endpoints-sdk';
import { normalisePhone } from '@/lib/phoneUtils';

function getInitialStep(): number {
  const params = new URLSearchParams(window.location.search);
  const start = params.get('start');
  if (start === 'personal-info' || start === 'thong-tin-ca-nhan' || start === '1') {
    return 1;
  }
  return 0;
}

export default function App() {
  const [step, setStep] = useState(getInitialStep);
  const [data, setData] = useState<FormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmitRegistrationOutputType | null>(null);

  useEffect(() => {
    getRegistrationCount({}).then(r => {
      if (r.count >= MAX_CAPACITY) setIsFull(true);
    }).catch(() => {});
  }, []);

  const update = useCallback((partial: Partial<FormData>) => {
    setData(prev => ({ ...prev, ...partial }));
  }, []);

  const next = () => { setStep(s => s + 1); window.scrollTo(0, 0); };
  const back = () => { setStep(s => s - 1); window.scrollTo(0, 0); };

  const handleSubmit = async () => {
    setSubmitting(true);
    const { baseFee, tShirtFee, donationAmount, total } = calculateTotal(data);
    try {
      const result = await submitRegistration({
        email: data.email,
        hoVaTen: data.hoVaTen,
        phapDanh: data.phapDanh || undefined,
        phoneViberOriginal: data.phoneViber,
        phoneViberNormalised: normalisePhone(data.phoneViber),
        namSinh: data.namSinh,
        gioiTinh: data.gioiTinh,
        ngheNghiep: data.ngheNghiep || undefined,
        diaChi: data.diaChi,
        yeuCauHoTro: data.yeuCauHoTro || undefined,
        emergencyName: data.emergencyName,
        emergencyPhoneOriginal: data.emergencyPhone,
        emergencyPhoneNormalised: normalisePhone(data.emergencyPhone),
        emergencyRelationship: data.emergencyRelationship,
        emergencyAddress: data.emergencyAddress || undefined,
        healthConfirmed: data.healthConfirmed,
        rulesConfirmed: data.rulesConfirmed,
        camping: data.camping,
        tShirt: data.tShirt,
        tShirtSize: data.tShirtSize || undefined,
        paymentMethod: data.paymentMethod,
        paymentAmount: total,
        tShirtFee,
        baseFee,
        donationAmount,
        totalAmount: total,
        receiptUrl: data.receiptUrl || undefined,
        additionalMessage: data.additionalMessage || undefined,
      });
      setSubmissionResult(result);
      next();
    } catch {
      toast.error('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const showBanner = step >= 1 && step <= 5;

  return (
    <div className="min-h-screen relative bg-[#a9c7dd]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <img src={PAGE_BG_URL} alt="" className="w-full h-full object-cover scale-105" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#16314f]/30 via-transparent to-[#16314f]/45" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#f47b2a]/25 via-[#f47b2a]/5 to-transparent" />
      </div>

      <main className="relative px-3 sm:px-4 py-6 sm:py-10">
        <div className={`mx-auto ${step === 0 ? 'max-w-5xl' : 'max-w-[720px]'}`}>
          <div className="bg-[#fffaf3] rounded-[22px] shadow-[0_24px_80px_rgba(0,0,0,0.35)] overflow-hidden">
            {showBanner && <FormBanner />}
            <div className={step === 0 ? 'px-5 sm:px-10 py-8 md:py-12' : 'px-5 sm:px-9 py-7 sm:py-10'}>
              {step === 0 && <CoverPage onStart={next} isFull={isFull} />}
              {step === 1 && <PersonalInfoPage data={data} onChange={update} onNext={next} onBack={back} />}
              {step === 2 && <HealthPage data={data} onChange={update} onNext={next} onBack={back} />}
              {step === 3 && <AccommodationPage data={data} onChange={update} onNext={next} onBack={back} />}
              {step === 4 && <PaymentPage data={data} onChange={update} onSubmit={handleSubmit} onBack={back} submitting={submitting} />}
              {step === 5 && (
                <ThankYouPage
                  paymentMethod={data.paymentMethod}
                  hoVaTen={data.hoVaTen}
                  email={data.email}
                  ticketNumber={submissionResult?.ticketNumber || ''}
                  qrCodeUrl={submissionResult?.qrCodeUrl || ''}
                />
              )}
            </div>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}

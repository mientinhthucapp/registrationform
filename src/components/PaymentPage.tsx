import { useState, useRef, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { uploadFile } from 'zite-file-upload-sdk';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent } from 'zite-endpoints-sdk';
import ProgressBar from '@/components/ProgressBar';
import { calculateTotal } from '@/lib/formTypes';
import type { FormData } from '@/lib/formTypes';

const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = pk ? loadStripe(pk) : null;

interface Props {
  data: FormData;
  onChange: (d: Partial<FormData>) => void;
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
}

/* ── Stripe checkout form ── */
function StripeCheckoutForm({ onSuccess, submitting }: { onSuccess: () => void; submitting: boolean }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string>();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setError(undefined);
    const { error } = await stripe.confirmPayment({ elements, redirect: 'if_required' });
    if (error) {
      setError(error.message);
      setProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={!stripe || processing || submitting}>
        {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang xử lý...</> : 'Thanh toán & Gửi đăng ký'}
      </Button>
    </form>
  );
}

/* ── Stripe wrapper that fetches client secret ── */
function StripeSection({ data, onSuccess, submitting }: { data: FormData; onSuccess: () => void; submitting: boolean }) {
  const [clientSecret, setClientSecret] = useState<string>();
  const [loadingPI, setLoadingPI] = useState(true);
  const [piError, setPiError] = useState<string>();

  const { total } = calculateTotal(data);

  useEffect(() => {
    let cancelled = false;
    setLoadingPI(true);
    setPiError(undefined);
    createPaymentIntent({ email: data.email, amount: Math.round(total * 100) })
      .then(r => { if (!cancelled) setClientSecret(r.clientSecret); })
      .catch(() => { if (!cancelled) setPiError('Không thể kết nối thanh toán. Vui lòng thử lại.'); })
      .finally(() => { if (!cancelled) setLoadingPI(false); });
    return () => { cancelled = true; };
  }, [data.email, total]);

  const appearance = useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    const root = getComputedStyle(document.documentElement);
    const hslVar = (name: string) => {
      const v = root.getPropertyValue(name).trim();
      return v ? `hsl(${v})` : undefined;
    };
    return {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: hslVar('--primary'),
        colorBackground: hslVar('--background'),
        colorText: hslVar('--foreground'),
        colorDanger: hslVar('--destructive'),
        colorTextSecondary: hslVar('--muted-foreground'),
        borderRadius: root.getPropertyValue('--radius').trim() || '0.5rem',
      },
    };
  }, []);

  if (!stripePromise) return <p className="text-sm text-destructive">Stripe chưa được kết nối. Vui lòng chọn chuyển khoản ngân hàng.</p>;
  if (loadingPI) return <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Đang tải thanh toán...</span></div>;
  if (piError) return <p className="text-sm text-destructive">{piError}</p>;
  if (!clientSecret) return null;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
      <StripeCheckoutForm onSuccess={onSuccess} submitting={submitting} />
    </Elements>
  );
}

/* ── Main page ── */
export default function PaymentPage({ data, onChange, onSubmit, onBack, submitting }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const { baseFee, tShirtFee, donationAmount, total } = calculateTotal(data);
  const fmt = (n: number) => `$${n.toFixed(2)} AUD`;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.paymentMethod) e.paymentMethod = 'Vui lòng chọn phương thức thanh toán';
    if (data.paymentMethod === 'bank_transfer' && !data.receiptUrl) e.receipt = 'Vui lòng tải lên biên nhận chuyển khoản';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleBankSubmit = () => {
    if (validate()) onSubmit();
  };

  const handleStripeSuccess = () => {
    onSubmit();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/heic', 'image/heif'];
    if (!allowed.includes(file.type) && !file.name.toLowerCase().endsWith('.heic')) {
      setErrors(prev => ({ ...prev, receipt: 'Chỉ chấp nhận file PDF, JPG, PNG hoặc HEIC' }));
      return;
    }
    try {
      setUploading(true);
      const { fileUrl } = await uploadFile({ data: file, filename: file.name });
      onChange({ receiptUrl: fileUrl });
      setFileName(file.name);
      setErrors(prev => { const n = { ...prev }; delete n.receipt; return n; });
    } catch {
      setErrors(prev => ({ ...prev, receipt: 'Không thể tải lên file. Vui lòng thử lại.' }));
    } finally {
      setUploading(false);
    }
  };

  const SummaryRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium text-right">{value}</span>
    </div>
  );

  return (
    <div>
      <ProgressBar step={4} total={4} />
      <h2 className="text-2xl font-bold text-foreground mb-6">Tóm tắt đăng ký & Thanh toán</h2>

      {/* Summary */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-1 mb-6">
        <h3 className="font-semibold text-foreground mb-2">Tóm tắt đăng ký</h3>
        <SummaryRow label="Họ và tên" value={data.hoVaTen} />
        <SummaryRow label="Email" value={data.email} />
        <SummaryRow label="Số điện thoại" value={data.phoneViber} />
        <SummaryRow label="Đăng ký cắm trại" value={data.camping || '—'} />
        <SummaryRow label="Đăng ký áo thun" value={data.tShirt === 'Có' ? `Có — Size ${data.tShirtSize}` : data.tShirt || '—'} />
        <div className="border-t border-border mt-2 pt-2 space-y-0.5">
          <SummaryRow label="Phí tham dự khóa thiền" value={fmt(baseFee)} />
          {tShirtFee > 0 && <SummaryRow label="Phí áo thun" value={fmt(tShirtFee)} />}
          {donationAmount > 0 && <SummaryRow label="Tùy hỷ ủng hộ chương trình" value={fmt(donationAmount)} />}
          <div className="flex justify-between py-1.5 text-sm font-semibold">
            <span className="text-foreground">Tổng phí cần thanh toán</span>
            <span className="text-primary text-base">{fmt(total)}</span>
          </div>
        </div>
      </div>

      {/* Payment method */}
      <div className="space-y-3 mb-6">
        <Label className="text-sm font-medium">Phương thức thanh toán <span className="text-destructive">*</span></Label>
        <RadioGroup value={data.paymentMethod} onValueChange={v => onChange({ paymentMethod: v, receiptUrl: '' })} className="space-y-2">
          <label className={`flex items-center gap-3 border rounded-xl p-3.5 cursor-pointer transition-colors ${data.paymentMethod === 'bank_transfer' ? 'border-primary bg-primary/5' : 'border-border'}`}>
            <RadioGroupItem value="bank_transfer" />
            <span className="text-sm">Chuyển khoản ngân hàng</span>
          </label>
          <label className={`flex items-center gap-3 border rounded-xl p-3.5 cursor-pointer transition-colors ${data.paymentMethod === 'stripe' ? 'border-primary bg-primary/5' : 'border-border'}`}>
            <RadioGroupItem value="stripe" />
            <span className="text-sm">Thanh toán online bằng thẻ qua Stripe</span>
          </label>
        </RadioGroup>
        {errors.paymentMethod && <p className="text-xs text-destructive">{errors.paymentMethod}</p>}
      </div>

      {/* Bank transfer details */}
      {data.paymentMethod === 'bank_transfer' && (
        <div className="space-y-4 mb-6">
          <div className="bg-muted/60 rounded-xl p-4 space-y-1.5 text-sm">
            <h4 className="font-semibold text-foreground">Thông tin chuyển khoản</h4>
            <p className="text-muted-foreground">Pay ID: [INSERT PAY ID]</p>
            <p className="text-muted-foreground mt-2">Hoặc:</p>
            <p className="text-muted-foreground">Account name: [INSERT ACCOUNT NAME]</p>
            <p className="text-muted-foreground">BSB: [INSERT BSB]</p>
            <p className="text-muted-foreground">Account number: [INSERT ACCOUNT NUMBER]</p>
            <p className="text-muted-foreground mt-2">
              Reference/Nội dung chuyển khoản: <strong>{data.hoVaTen || '[TÊN]'} - CampRumbug2026</strong>
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Tải lên biên nhận chuyển khoản <span className="text-destructive">*</span></Label>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.heic,.heif" onChange={handleFile} className="hidden" />
            {data.receiptUrl ? (
              <div className="flex items-center gap-2 border border-border rounded-lg p-3 bg-card">
                <FileText className="w-5 h-5 text-primary" />
                <span className="text-sm flex-1 truncate">{fileName}</span>
                <Button variant="ghost" size="sm" onClick={() => { onChange({ receiptUrl: '' }); setFileName(''); }}>Đổi file</Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full border-2 border-dashed border-border rounded-xl py-8 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors disabled:opacity-50"
              >
                {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                <span className="text-sm">{uploading ? 'Đang tải lên...' : 'Kéo thả hoặc chọn tệp (PDF, JPG, PNG, HEIC)'}</span>
              </button>
            )}
            {errors.receipt && <p className="text-xs text-destructive">{errors.receipt}</p>}
            <p className="text-xs text-muted-foreground">
              Việc đăng ký sẽ được Ban Tổ Chức kiểm tra và xác nhận sau khi nhận được thanh toán.
            </p>
          </div>
        </div>
      )}

      {/* Stripe embedded payment */}
      {data.paymentMethod === 'stripe' && (
        <div className="rounded-xl border border-border bg-card p-5 mb-6">
          <StripeSection data={data} onSuccess={handleStripeSuccess} submitting={submitting} />
        </div>
      )}

      {/* Additional message */}
      <div className="space-y-1.5 mb-6">
        <Label className="text-sm font-medium">Lời nhắn nhủ thêm cho Ban Tổ Chức / Yêu cầu đặc biệt</Label>
        <Textarea rows={3} value={data.additionalMessage} onChange={e => onChange({ additionalMessage: e.target.value })} />
        <p className="text-xs text-muted-foreground">
          Quý vị có thể chia sẻ thêm những điều cần Ban Tổ Chức lưu ý, ví dụ: đi cùng người thân, mong muốn ở gần ai đó, nhu cầu hỗ trợ đặc biệt, hoặc câu hỏi thêm về chương trình.
        </p>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>← Quay lại</Button>
        {/* Only show the submit button for bank transfer — Stripe has its own button inside the form */}
        {data.paymentMethod !== 'stripe' && (
          <Button onClick={handleBankSubmit} disabled={submitting}>
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang gửi...</> : 'Gửi đăng ký'}
          </Button>
        )}
      </div>
    </div>
  );
}

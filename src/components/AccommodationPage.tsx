import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink, Home, UtensilsCrossed, Car, Sparkles } from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';
import { calculateTotal, isValidDonationAmount } from '@/lib/formTypes';
import type { FormData } from '@/lib/formTypes';

interface Props {
  data: FormData;
  onChange: (d: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const feeIncludes = [
  { icon: Home, label: 'Chỗ nghỉ' },
  { icon: UtensilsCrossed, label: 'Ăn uống' },
  { icon: Car, label: 'Xe đưa đón' },
  { icon: Sparkles, label: 'Thiền tập' },
];

export default function AccommodationPage({ data, onChange, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTShirtModal, setShowTShirtModal] = useState(false);

  const { baseFee, total } = calculateTotal(data);
  const fmt = (n: number) => `AUD $${n % 1 === 0 ? n : n.toFixed(2)}`;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!isValidDonationAmount(data.donationAmount)) {
      e.donationAmount = 'Vui lòng nhập số tiền hợp lệ bằng AUD, hoặc để trống nếu không tùy hỷ thêm.';
    }
    if (!data.camping) e.camping = 'Vui lòng chọn một lựa chọn';
    if (data.camping === 'Có' && !data.campingConfirm) e.campingConfirm = 'Vui lòng xác nhận để tiếp tục';
    if (!data.tShirt) e.tShirt = 'Vui lòng chọn một lựa chọn';
    if (data.tShirt === 'Có' && !data.tShirtSize) e.tShirtSize = 'Vui lòng chọn size áo';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <div>
      <ProgressBar step={3} total={4} />
      <h2 className="text-2xl font-bold text-foreground mb-4">Chi phí, Chỗ nghỉ & Áo thun</h2>

      {/* Top information box — what the fee covers */}
      <div className="bg-muted/60 rounded-xl p-4 sm:p-5 mb-6 space-y-3.5">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Phí tham dự chương trình bao gồm chỗ nghỉ cabin chung có sưởi ấm, các bữa ăn trong suốt khóa thiền, xe bus đưa đón chung từ trung tâm Melbourne theo sắp xếp của Ban Tổ Chức, và toàn bộ chương trình thiền tậpcùng Thầy và đại chúng.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {feeIncludes.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 bg-card rounded-lg px-3 py-2 text-xs sm:text-sm text-foreground shadow-sm">
              <Icon className="w-4 h-4 text-primary flex-shrink-0" />
              <span>{label}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Áo thun chương trình là lựa chọn thêm, không bắt buộc. Việc cắm trại ngoài trời cũng được cho phép nhưng sẽ phụ thuộc vào số lượng chỗ, điều kiện thời tiết và xác nhận cuối cùng từ Ban Tổ Chức.
        </p>
      </div>

      {/* Section 1 — Chi phí tham dự */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 mb-6 space-y-4">
        <h3 className="text-base font-semibold text-foreground">Chi phí tham dự</h3>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Phí tham dự</Label>
          <Input value={fmt(baseFee)} disabled readOnly className="font-medium text-foreground disabled:opacity-100 disabled:bg-muted/50" />
          <p className="text-xs text-muted-foreground">Đã bao gồm chỗ nghỉ, ăn uống, xe đưa đón chung và chương trình thiền tập.</p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Tùy hỷ ủng hộ chương trình</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">AUD $</span>
            <Input
              inputMode="decimal"
              placeholder="Ví dụ: 50"
              value={data.donationAmount}
              onChange={e => onChange({ donationAmount: e.target.value })}
              className="pl-[4.25rem]"
            />
          </div>
          <p className="text-xs text-muted-foreground">Khoản tùy hỷ này không bắt buộc, dùng để hỗ trợ thêm cho chi phí tổ chức chương trình.</p>
          {errors.donationAmount && <p className="text-xs text-destructive">{errors.donationAmount}</p>}
        </div>

        <div className="border-t border-border pt-3 flex justify-between items-center">
          <span className="text-sm font-semibold text-foreground">Thành tiền tạm tính</span>
          <span className="text-primary text-base font-semibold">{fmt(total)}</span>
        </div>
      </div>

      {/* Section 2 — Cắm trại ngoài trời */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 mb-6 space-y-4">
        <h3 className="text-base font-semibold text-foreground">Cắm trại ngoài trời</h3>
        <div>
          <p className="text-sm mb-2">
            Quý vị có muốn đăng ký cắm trại ngoài trời không? <span className="text-destructive">*</span>
          </p>
          <RadioGroup value={data.camping} onValueChange={v => onChange({ camping: v, campingConfirm: false })} className="flex gap-6">
            {['Có', 'Không'].map(opt => (
              <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                <RadioGroupItem value={opt} /> {opt}
              </label>
            ))}
          </RadioGroup>
          {errors.camping && <p className="text-xs text-destructive mt-1">{errors.camping}</p>}
        </div>

        {data.camping === 'Có' && (
          <div className="bg-muted/50 rounded-lg p-3 flex items-start gap-3">
            <Checkbox
              id="campingConfirm"
              checked={data.campingConfirm}
              onCheckedChange={v => onChange({ campingConfirm: v === true })}
              className="mt-0.5"
            />
            <Label htmlFor="campingConfirm" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
              Tôi hiểu rằng tôi vẫn cần đăng ký giường ở phòng cabin và cần tự chuẩn bị lều và vật dụng cắm trại cá nhân. Chỗ cắm trại cần được Ban Tổ Chức xác nhận.
            </Label>
          </div>
        )}
        {errors.campingConfirm && <p className="text-xs text-destructive">{errors.campingConfirm}</p>}

        <p className="text-xs text-muted-foreground leading-relaxed">
          Việc cắm trại ngoài trời phụ thuộc vào số lượng chỗ, điều kiện thời tiết và sự xác nhận của Ban Tổ Chức. Dù đăng ký cắm trại, quý vị vẫn sẽ có chỗ nghỉ cabin theo sắp xếp chung của chương trình, trừ khi Ban Tổ Chức thông báo khác.
        </p>

        <a href="#" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          Xem thêm thông tin về chỗ nghỉ và cắm trại <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Section 3 — Áo thun chương trình */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 space-y-4">
        <h3 className="text-base font-semibold text-foreground">Áo thun chương trình</h3>
        <div>
          <p className="text-sm mb-2">
            Quý vị có muốn đăng ký áo thun đồng phục của chương trình không? <span className="text-destructive">*</span>
          </p>
          <RadioGroup value={data.tShirt} onValueChange={v => onChange({ tShirt: v, tShirtSize: '' })} className="flex gap-6">
            {['Có', 'Không'].map(opt => (
              <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                <RadioGroupItem value={opt} /> {opt}
              </label>
            ))}
          </RadioGroup>
          {errors.tShirt && <p className="text-xs text-destructive mt-1">{errors.tShirt}</p>}
        </div>

        {data.tShirt === 'Có' && (
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Size áo <span className="text-destructive">*</span></Label>
            <Select value={data.tShirtSize} onValueChange={v => onChange({ tShirtSize: v })}>
              <SelectTrigger><SelectValue placeholder="Chọn size" /></SelectTrigger>
              <SelectContent>
                {['S', 'M', 'L', 'XL', 'XXL', 'Khác / cần hỗ trợ chọn size'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.tShirtSize && <p className="text-xs text-destructive">{errors.tShirtSize}</p>}
          </div>
        )}

        <p className="text-xs text-muted-foreground leading-relaxed">
          Áo thun chương trình là lựa chọn thêm, không bắt buộc. Số lượng, kích cỡ và chi phí áo thun sẽ được Ban Tổ Chức xác nhận sau.
        </p>

        <a
          href="#"
          onClick={e => {
            e.preventDefault();
            setShowTShirtModal(true);
          }}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Xem mẫu áo thun và bảng size <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {showTShirtModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowTShirtModal(false)} />
            <div className="relative bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 p-4 overflow-hidden" role="dialog" aria-modal="true">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-semibold">Mẫu áo thun & Bảng size</h4>
                <button aria-label="Close" className="text-muted-foreground hover:text-foreground" onClick={() => setShowTShirtModal(false)}>✕</button>
              </div>
              <iframe src="https://mientinhthucmelbourne.org/2026/forms/t-shirts/tshirt-size.html" title="T-shirt sizes" className="w-full h-[70vh] border rounded" />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-8">
        <Button variant="ghost" onClick={onBack}>← Quay lại</Button>
        <Button onClick={handleNext}>Tiếp tục</Button>
      </div>
    </div>
  );
}

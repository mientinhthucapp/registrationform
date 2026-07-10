import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';
import { isValidPhone, normalisePhone } from '@/lib/phoneUtils';
import { checkPhoneUnique } from 'zite-endpoints-sdk';
import type { FormData } from '@/lib/formTypes';

interface Props {
  data: FormData;
  onChange: (d: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 90 }, (_, i) => String(currentYear - 10 - i));

function Field({ label, required, error, hint, children }: { label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

const relationships = ['Vợ/chồng', 'Cha/mẹ', 'Anh/chị/em', 'Con', 'Bạn bè', 'Người thân', 'Khác'];

export default function PersonalInfoPage({ data, onChange, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checking, setChecking] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.email) e.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'Email không hợp lệ';
    if (!data.hoVaTen.trim()) e.hoVaTen = 'Vui lòng nhập họ và tên';
    if (!data.phoneViber.trim()) e.phoneViber = 'Vui lòng nhập số điện thoại';
    else if (!isValidPhone(data.phoneViber)) e.phoneViber = 'Số điện thoại không hợp lệ. Vui lòng nhập theo định dạng 0412345678 hoặc +61412345678';
    if (!data.namSinh) e.namSinh = 'Vui lòng chọn năm sinh';
    if (!data.gioiTinh) e.gioiTinh = 'Vui lòng chọn giới tính';
    if (!data.diaChi.trim()) e.diaChi = 'Vui lòng nhập địa chỉ';
    if (!data.emergencyName.trim()) e.emergencyName = 'Vui lòng nhập tên người liên hệ';
    if (!data.emergencyPhone.trim()) e.emergencyPhone = 'Vui lòng nhập số điện thoại';
    else if (!isValidPhone(data.emergencyPhone)) e.emergencyPhone = 'Số điện thoại không hợp lệ. Vui lòng nhập theo định dạng 0412345678 hoặc +61412345678';
    if (!data.emergencyRelationship) e.emergencyRelationship = 'Vui lòng chọn mối quan hệ';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) return;

    // Check phone uniqueness
    setChecking(true);
    try {
      const normPhone = normalisePhone(data.phoneViber);
      const { isUnique } = await checkPhoneUnique({ normalisedPhone: normPhone });
      if (!isUnique) {
        setErrors(prev => ({
          ...prev,
          phoneViber: 'Số điện thoại này đã được sử dụng để đăng ký trước đó. Vui lòng kiểm tra lại hoặc liên hệ Ban Tổ Chức nếu quý vị cần hỗ trợ.',
        }));
        return;
      }
      onNext();
    } catch {
      setErrors(prev => ({ ...prev, phoneViber: 'Không thể kiểm tra số điện thoại. Vui lòng thử lại.' }));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div>
      <ProgressBar step={1} total={4} />
      <h2 className="text-2xl font-bold text-foreground mb-6">Thông tin cá nhân</h2>

      <div className="space-y-5">
        <Field label="Email" required error={errors.email}>
          <Input type="email" placeholder="email@example.com" value={data.email} onChange={e => onChange({ email: e.target.value })} />
        </Field>

        <Field label="Họ và tên" required error={errors.hoVaTen}>
          <Input value={data.hoVaTen} onChange={e => onChange({ hoVaTen: e.target.value })} />
        </Field>

        <Field label="Pháp danh, nếu có">
          <Input value={data.phapDanh} onChange={e => onChange({ phapDanh: e.target.value })} />
        </Field>

        <Field label="Số điện thoại có Viber" required error={errors.phoneViber} hint="Nhập theo định dạng: 0412345678 hoặc +61412345678">
          <Input type="tel" placeholder="+61412345678" value={data.phoneViber} onChange={e => onChange({ phoneViber: e.target.value })} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Năm sinh" required error={errors.namSinh}>
            <Select value={data.namSinh} onValueChange={v => onChange({ namSinh: v })}>
              <SelectTrigger><SelectValue placeholder="Chọn năm" /></SelectTrigger>
              <SelectContent>
                {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Giới tính" required error={errors.gioiTinh}>
            <RadioGroup value={data.gioiTinh} onValueChange={v => onChange({ gioiTinh: v })} className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
              {['Nam', 'Nữ', 'Khác', 'Không muốn chia sẻ'].map(opt => (
                <label key={opt} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <RadioGroupItem value={opt} />
                  {opt}
                </label>
              ))}
            </RadioGroup>
          </Field>
        </div>

        <Field label="Nghề nghiệp">
          <Input value={data.ngheNghiep} onChange={e => onChange({ ngheNghiep: e.target.value })} />
        </Field>

        <Field label="Địa chỉ" required error={errors.diaChi}>
          <Input value={data.diaChi} onChange={e => onChange({ diaChi: e.target.value })} />
        </Field>

        {/* Emergency contact section */}
        <div className="mt-3 pt-6 border-t border-[#eadfce] space-y-4">
          <h3 className="text-[17px] font-bold text-[#10284a]">Liên lạc trong trường hợp khẩn cấp</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Họ và tên người liên hệ" required error={errors.emergencyName}>
              <Input value={data.emergencyName} onChange={e => onChange({ emergencyName: e.target.value })} />
            </Field>
            <Field label="Số điện thoại" required error={errors.emergencyPhone} hint="Ví dụ: 0412345678 hoặc +61412345678">
              <Input type="tel" placeholder="+61412345678" value={data.emergencyPhone} onChange={e => onChange({ emergencyPhone: e.target.value })} />
            </Field>
            <Field label="Mối quan hệ" required error={errors.emergencyRelationship}>
              <Select value={data.emergencyRelationship} onValueChange={v => onChange({ emergencyRelationship: v })}>
                <SelectTrigger><SelectValue placeholder="Chọn mối quan hệ" /></SelectTrigger>
                <SelectContent>
                  {relationships.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Địa chỉ">
              <Input value={data.emergencyAddress} onChange={e => onChange({ emergencyAddress: e.target.value })} />
            </Field>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-8">
        <Button variant="ghost" onClick={onBack}>← Quay lại</Button>
        <Button onClick={handleNext} disabled={checking}>
          {checking ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang kiểm tra...</> : 'Tiếp tục'}
        </Button>
      </div>
    </div>
  );
}

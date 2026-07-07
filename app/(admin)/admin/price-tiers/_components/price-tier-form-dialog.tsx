"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Loader2, AlertCircle, Banknote, Coins, 
  CreditCard, Sparkles 
} from "lucide-react";

import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useCreatePriceTier, useUpdatePriceTier } from "@/hooks/use-price-tier";

// ─── SCHEMA ───
const priceTierSchema = z.object({
  tierName: z.string().min(2, "Tên mức giá quá ngắn"),
  priceAmount: z.number().min(0, "Giá không được âm"),
  currency: z.string().min(1, "Bắt buộc chọn tiền tệ"),
});

type FormValues = z.infer<typeof priceTierSchema>;

export function PriceTierFormDialog({ children, initialData, onSuccess }: any) {
  const [open, setOpen] = React.useState(false);
  const isEdit = !!initialData;

  const createMutation = useCreatePriceTier();
  const updateMutation = useUpdatePriceTier();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(priceTierSchema),
    defaultValues: initialData || { tierName: "", priceAmount: 0, currency: "VND" },
  });

  const currency = watch("currency");

  React.useEffect(() => {
    if (open) reset(initialData || { tierName: "", priceAmount: 0, currency: "VND" });
  }, [open, initialData, reset]);

  const onSubmit = async (values: FormValues) => {
    if (isEdit) await updateMutation.mutateAsync({ id: initialData.id, data: values });
    else await createMutation.mutateAsync(values);
    setOpen(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px] p-0 rounded-[1.25rem] border-none shadow-2xl overflow-hidden bg-white outline-hidden">
        <div className={cn("h-2", isEdit ? "bg-amber-500" : "h-2 bg-linear-to-r from-indigo-600 via-purple-500 to-blue-500")} />

        <DialogHeader className="px-8 pt-8 text-left">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-xl", isEdit ? "bg-amber-50 text-amber-600" : "bg-indigo-50 text-indigo-600")}>
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight">
                {isEdit ? "Cập Nhật Mức Giá" : "Tạo Mức Giá"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium italic text-xs">
                Thiết lập định mức giá cho hệ thống
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-6">
          
          {/* 1. Tên Mức Giá - Full Width */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              Tên hiển thị
            </Label>
            <Input
              {...register("tierName")}
              placeholder="VD: Premium Package"
              className={cn("h-11 rounded-xl border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500", errors.tierName && "border-rose-500 focus-visible:ring-rose-500/10")}
              disabled={isPending}
            />
            {errors.tierName && (
              <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {errors.tierName.message}
              </p>
            )}
          </div>

          {/* 2. Nhóm Giá & Tiền tệ - Cùng hàng, cùng chiều cao, chiếm hết bề ngang */}
          <div className="flex flex-col space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              Cấu hình giá tiền
            </Label>
            
            <div className="flex gap-3 w-full">
              {/* Field Số tiền - Chiếm 65% */}
              <div className="flex-[0.65] flex flex-col gap-1.5">
                <div className="relative">
                  <Input
                    type="number"
                    {...register("priceAmount", {valueAsNumber: true})}
                    className={cn(
                      "h-11 rounded-xl border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 pl-10 font-mono font-bold w-full",
                      errors.priceAmount && "border-rose-500 focus-visible:ring-rose-500/10"
                    )}
                    disabled={isPending}
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    {currency === "VND" ? "₫" : "$"}
                  </div>
                </div>
              </div>

              {/* Field Tiền tệ - Chiếm 35% còn lại */}
              <div className="flex-[0.35] flex flex-col gap-1.5">
                <Select
                  disabled={isPending}
                  value={currency}
                  onValueChange={(v) => setValue("currency", v)}
                >
                  <SelectTrigger className={cn(
                    "!h-11 rounded-xl border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 bg-slate-50/50 font-bold w-full",
                    errors.currency && "border-rose-500"
                  )}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    <SelectItem value="VND" className="rounded-lg cursor-pointer py-2.5 px-3">VND (₫)</SelectItem>
                    <SelectItem value="USD" className="rounded-lg cursor-pointer py-2.5 px-3">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Hiển thị lỗi chung cho cụm Giá/Tiền tệ để tiết kiệm không gian */}
            {(errors.priceAmount || errors.currency) && (
              <div className="flex flex-col gap-1 mt-1">
                {errors.priceAmount && (
                  <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.priceAmount.message}
                  </p>
                )}
                {errors.currency && (
                  <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.currency.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 3. Preview Box */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-dashed border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Giá hiển thị thực tế:</span>
              <span className={cn("text-lg font-black", isEdit ? "text-amber-600" : "text-indigo-600")}>
                {new Intl.NumberFormat().format(watch("priceAmount") || 0)} {currency}
              </span>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-50 gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold h-11 px-6" disabled={isPending}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className={cn(
                "font-black rounded-xl h-11 px-10 shadow-lg active:scale-95 transition-all flex-1 sm:flex-none",
                isEdit ? "bg-amber-500 hover:bg-amber-600 shadow-amber-100" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"
              )}
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "XÁC NHẬN"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
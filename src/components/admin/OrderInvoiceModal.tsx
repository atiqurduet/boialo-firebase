import React from 'react';
import { Printer, X, Download, Package, Phone, Mail, MapPin, Gift, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderInvoiceModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  siteName?: string;
  sitePhone?: string;
}

export const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({
  order,
  isOpen,
  onClose,
  siteName = 'বইআলো (Boialo)',
  sitePhone = '+৮৮০ ১৭০০-০০০০০০',
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const items = order.order_items || order.items || [];
  const invoiceNumber = order.order_number || `INV-${order.id?.slice(0, 8)}`;
  const orderDate = order.created_at ? new Date(order.created_at).toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }) : 'আজকে';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Action bar (hidden in print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Printer className="w-5 h-5 text-primary" />
            ইনভয়েস ও শিপিং লেবেল প্রিভিউ
          </h3>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handlePrint} className="gap-1.5 font-bold">
              <Printer className="w-4 h-4" />
              প্রিন্ট করুন
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div id="printable-invoice" className="space-y-6 bg-white text-slate-900 p-2">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">{siteName}</h1>
              <p className="text-xs text-slate-600 mt-1">বাংলাদেশের বিশ্বস্ত অনলাইন বইয়ের ঠিকানা</p>
              <p className="text-xs text-slate-500">হেল্পলাইন: {sitePhone} | www.boialo.com</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-100 text-slate-800 rounded font-mono font-bold text-sm">
                #{invoiceNumber}
              </span>
              <p className="text-xs text-slate-500 mt-1">অর্ডার তারিখ: {orderDate}</p>
              <span className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded ${
                order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {order.payment_status === 'paid' ? 'পরিশোধিত (PAID)' : 'ক্যাশ অন ডেলিভারি (COD)'}
              </span>
            </div>
          </div>

          {/* Customer & Courier Delivery Label Box */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-slate-300 bg-slate-50/70 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">প্রাপকের তথ্য (Customer):</span>
              <h4 className="font-bold text-sm text-slate-900">{order.full_name || 'সম্মানিত পাঠক'}</h4>
              <p className="flex items-center gap-1.5 text-slate-700">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <strong>{order.phone || 'ফোন নেই'}</strong>
              </p>
              {order.email && (
                <p className="flex items-center gap-1.5 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {order.email}
                </p>
              )}
            </div>

            <div className="space-y-1 border-l pl-4 border-slate-200">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">ডেলিভারি ঠিকানা (Shipping):</span>
              <p className="text-slate-800 font-medium leading-relaxed">{order.address || 'ঠিকানা দেওয়া হয়নি'}</p>
              <p className="text-slate-600 font-semibold mt-1">জোন: {order.delivery_area || 'ঢাকার ভিতরে'}</p>
            </div>
          </div>

          {/* Gift Message Note (If ordered with gift wrapping) */}
          {(order.is_gift_wrapped || order.gift_message) && (
            <div className="p-3.5 rounded-xl border border-pink-200 bg-pink-50/70 text-xs space-y-1">
              <span className="font-bold text-pink-700 flex items-center gap-1">
                <Gift className="w-3.5 h-3.5" />
                উপহার বার্তা (Gift Greeting Card):
              </span>
              <p className="italic text-slate-800">"{order.gift_message || 'প্রিয়জনের জন্য বুকালো থেকে ভালোবাসা ও শুভেচ্ছা!'}"</p>
              {order.gift_recipient && (
                <p className="text-[11px] text-pink-800 font-bold">প্রাপক: {order.gift_recipient}</p>
              )}
            </div>
          )}

          {/* Items Table */}
          <div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-100 text-slate-700">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">বইয়ের নাম</th>
                  <th className="py-2.5 px-3 text-center">পরিমাণ</th>
                  <th className="py-2.5 px-3 text-right">একক মূল্য</th>
                  <th className="py-2.5 px-3 text-right">মোট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.length > 0 ? (
                  items.map((item: any, i: number) => {
                    const title = item.product_title || item.title || item.product?.title || 'বই';
                    const qty = item.quantity || 1;
                    const price = item.price || 0;
                    return (
                      <tr key={i}>
                        <td className="py-2 px-3 text-slate-500">{i + 1}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">{title}</td>
                        <td className="py-2 px-3 text-center text-slate-700">{qty}</td>
                        <td className="py-2 px-3 text-right text-slate-700">৳{price}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">৳{price * qty}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-500">
                      কোনো আইটেম পাওয়া যায়নি
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>সাবটোটাল:</span>
                <span>৳{order.subtotal || order.total || 0}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ডেলিভারি চার্জ:</span>
                <span>৳{order.delivery_charge ?? 60}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>ছাড় / পয়েন্ট ডিসকাউন্ট:</span>
                  <span>-৳{order.discount_amount}</span>
                </div>
              )}
              {order.gift_wrap_fee > 0 && (
                <div className="flex justify-between text-pink-700 font-bold">
                  <span>গিফট র‍্যাপিং ফি:</span>
                  <span>+৳{order.gift_wrap_fee}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-900">
                <span>সর্বমোট প্রদেয়:</span>
                <span>৳{order.total || 0}</span>
              </div>
            </div>
          </div>

          {/* Barcode & Footer Notice */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
            <div>
              <p className="font-semibold text-slate-700">বইআলো (Boialo) থেকে বই কেনার জন্য ধন্যবাদ!</p>
              <p>যেকোনো প্রয়োজনে আমাদের সাপোর্ট হটলাইনে কল করুন বা ওয়েবসাইটে ভিজিট করুন।</p>
            </div>
            {/* Courier Tracking Barcode mock */}
            <div className="text-center font-mono">
              <div className="h-8 w-36 bg-slate-900 text-white flex items-center justify-center font-bold tracking-widest text-xs">
                ||| | |||| | ||| |
              </div>
              <span className="text-[10px] text-slate-600">{invoiceNumber}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
